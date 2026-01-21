'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useAIConfigStore } from '@/stores/ai-config-store';
import { cn } from '@/lib/utils';
import { chatWithPMQARules } from '@/lib/google/ai-api';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function PMQAChatbot() {
    const { apiKey, selectedModel } = useAIConfigStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'สวัสดีครับ ผมคือผู้ช่วย PMQA AI มีข้อสงสัยเกี่ยวกับเกณฑ์ PMQA หมวดไหน สอบถามได้เลยครับ',
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า API Key ก่อนใช้งาน (Settings > AI Config)');
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Prepare context (last 5 messages for context window)
            const contextMessages = messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content
            }));

            // Add current message
            contextMessages.push({ role: 'user', content: userMsg.content });

            const responseText = await chatWithPMQARules(apiKey, selectedModel, contextMessages);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat Error:', error);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 hover:scale-105"
            >
                <MessageCircle className="h-8 w-8" />
            </Button>
        );
    }

    return (
        <Card className={cn(
            "fixed z-50 transition-all duration-300 shadow-2xl border-indigo-100 flex flex-col",
            isMinimized
                ? "bottom-6 right-6 w-72 h-16"
                : "bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] md:h-[600px]"
        )}>
            {/* Header */}
            <CardHeader className="p-3 bg-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-sm font-medium">PMQA Smart Assistant</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-100 hover:text-white hover:bg-indigo-700"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-100 hover:text-white hover:bg-indigo-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {/* Content - Hidden if minimized */}
            {!isMinimized && (
                <>
                    <CardContent className="flex-1 overflow-hidden p-0 bg-slate-50">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-2 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            msg.role === 'user' ? "bg-indigo-100" : "bg-emerald-100"
                                        )}>
                                            {msg.role === 'user' ? (
                                                <User className="h-4 w-4 text-indigo-600" />
                                            ) : (
                                                <Bot className="h-4 w-4 text-emerald-600" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "p-3 text-sm rounded-2xl shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-slate-800 rounded-bl-none border border-slate-200"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2 mr-auto max-w-[85%]">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                            <span className="ml-2 text-xs text-slate-400">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t">
                        <div className="flex w-full gap-2">
                            <Input
                                placeholder="ถามเกี่ยวกับเกณฑ์ PMQA..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                className="flex-1"
                            />
                            <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
