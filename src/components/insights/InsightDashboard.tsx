'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    Sparkles,
    BrainCircuit,
    Target,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    Send,
    Loader2,
    FileText,
    Lightbulb,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import { StrategicInsight, generateStrategicInsights, askDataQuestion, TrendAnalysisResult, generateTrendAnalysis } from '@/lib/google/ai-api';
import { toast } from 'sonner';

interface InsightDashboardProps {
    sarContents: { category: number; content: string }[];
    previousSarContents?: { category: number; content: string }[];
    apiKey: string;
    modelId: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function InsightDashboard({ sarContents, previousSarContents, apiKey, modelId }: InsightDashboardProps) {
    // Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<StrategicInsight | null>(null);

    // Trend State
    const [isTrendAnalyzing, setIsTrendAnalyzing] = useState(false);
    const [trendResult, setTrendResult] = useState<TrendAnalysisResult | null>(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isChatting, setIsChatting] = useState(false);

    const handleAnalyze = async () => {
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า API Key ก่อนใช้งาน (Settings > AI Configuration)');
            return;
        }
        if (sarContents.length === 0) {
            toast.error('ไม่พบข้อมูล SAR เนื้อหาที่บันทึกไว้สำหรับรอบการประเมินนี้');
            return;
        }

        setIsAnalyzing(true);
        setProgress(10);

        try {
            // Prepare context
            const contexts = sarContents.map(c => `หมวด ${c.category}: ${c.content}`);
            setProgress(30);

            // Simulate progress for UX
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 90));
            }, 500);

            // Call API
            const insight = await generateStrategicInsights(apiKey, modelId, contexts);

            clearInterval(interval);
            setProgress(100);
            setResult(insight);
            toast.success('วิเคราะห์ข้อมูลเสร็จสิ้น');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล');
            setProgress(0);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTrendAnalyze = async () => {
        if (!apiKey || !previousSarContents || previousSarContents.length === 0) {
            toast.error('ไม่พบข้อมูลของปีที่แล้วสำหรับการเปรียบเทียบ');
            return;
        }

        setIsTrendAnalyzing(true);
        try {
            const currentContexts = sarContents.map(c => `หมวด ${c.category}: ${c.content}`);
            const previousContexts = previousSarContents.map(c => `หมวด ${c.category}: ${c.content}`);

            const result = await generateTrendAnalysis(apiKey, modelId, currentContexts, previousContexts);
            setTrendResult(result);
            toast.success('วิเคราะห์แนวโน้มเสร็จสิ้น');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการวิเคราะห์แนวโน้ม');
        } finally {
            setIsTrendAnalyzing(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!currentQuestion.trim() || !apiKey) return;

        const question = currentQuestion;
        setCurrentQuestion('');
        setIsChatting(true);

        // Add user message
        const newMessages = [
            ...chatMessages,
            { role: 'user', content: question, timestamp: new Date() } as ChatMessage
        ];
        setChatMessages(newMessages);

        try {
            // Prepare context
            const contexts = sarContents.map(c => `หมวด ${c.category}: ${c.content}`);

            const answer = await askDataQuestion(apiKey, modelId, contexts, question);

            setChatMessages([
                ...newMessages,
                { role: 'assistant', content: answer, timestamp: new Date() }
            ]);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการตอบคำถาม');
            setChatMessages([
                ...newMessages,
                { role: 'assistant', content: "ขออภัย เกิดข้อผิดพลาดในการประมวลผล", timestamp: new Date() }
            ]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Source Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{sarContents.length} Sections</div>
                        <p className="text-xs text-muted-foreground">เนื้อหา SAR ที่ถูกวิเคราะห์</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4" />
                            AI Model
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{modelId}</div>
                        <p className="text-xs text-muted-foreground">โมเดลที่ใช้งานปัจจุบัน</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {result ? 'Analyzed' : 'Ready'}
                        </div>
                        <p className="text-xs text-muted-foreground">สถานะระบบ</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">
                        <Target className="h-4 w-4 mr-2" />
                        Strategic Overview
                    </TabsTrigger>
                    <TabsTrigger value="recommendations">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Recommendations
                    </TabsTrigger>
                    <TabsTrigger value="qa">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Q&A Assistant
                    </TabsTrigger>
                    <TabsTrigger value="trends">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Trend Analysis
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {!result ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                            <div className="mb-4 flex justify-center">
                                <BrainCircuit className="h-12 w-12 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">พร้อมสำหรับการวิเคราะห์</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                ระบบจะนำเนื้อหา SAR ทั้งหมดมาวิเคราะห์หาจุดแข็ง จุดอ่อน และสรุปผลในมุมมองผู้บริหาร
                            </p>
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังวิเคราะห์ข้อมูล...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Strategic Insights
                                    </>
                                )}
                            </Button>

                            {isAnalyzing && (
                                <div className="mt-8 max-w-md mx-auto space-y-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-xs text-slate-400">AI กำลังอ่านและประมวลผลข้อมูล...</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Card className="border-indigo-200 shadow-sm">
                                <CardHeader className="bg-indigo-50/50 pb-4">
                                    <CardTitle className="text-indigo-800 flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        บทสรุปผู้บริหาร (Executive Summary)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-slate-700 leading-relaxed text-lg">
                                        {result.executive_summary}
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-emerald-200 shadow-sm">
                                    <CardHeader className="bg-emerald-50/50 pb-4">
                                        <CardTitle className="text-emerald-800 flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            จุดแข็ง (Strengths)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ul className="space-y-3">
                                            {result.strengths.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-amber-200 shadow-sm">
                                    <CardHeader className="bg-amber-50/50 pb-4">
                                        <CardTitle className="text-amber-800 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            จุดที่ควรพัฒนา (Opportunities)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ul className="space-y-3">
                                            {result.weaknesses.map((item, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-2" />
                                                    <span className="text-slate-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button variant="outline" onClick={handleAnalyze} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    วิเคราะห์ใหม่
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* RECOMMENDATIONS TAB */}
                <TabsContent value="recommendations" className="space-y-6 mt-6">
                    {!result ? (
                        <Alert className="bg-blue-50 border-blue-200">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">ยังไม่มีข้อมูล</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                กรุณากดปุ่ม "Generate Strategic Insights" ในแท็บ Strategic Overview เพื่อเริ่มการวิเคราะห์
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Target className="h-6 w-6 text-purple-600" />
                                ข้อเสนอแนะเชิงกลยุทธ์ (Strategic Recommendations)
                            </h3>
                            {result.strategic_recommendations.map((rec, index) => (
                                <Card key={index} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-lg text-slate-800 font-medium mb-1">{rec}</p>
                                                <p className="text-sm text-slate-500">ข้อเสนอแนะเพื่อการยกระดับคุณภาพการบริหารจัดการ</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Q&A TAB */}
                <TabsContent value="qa" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Sidebar info */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="bg-slate-50 border-slate-200 h-full">
                                <CardHeader>
                                    <CardTitle className="text-base">เกี่ยวกับ Q&A Assistant</CardTitle>
                                    <CardDescription>ถามคำถามเกี่ยวกับข้อมูลใน SAR ของคุณ</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-slate-600">
                                        <p className="mb-2">ตัวอย่างคำถาม:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-1">
                                            <li>"หมวดไหนมีจุดอ่อนมากที่สุด?"</li>
                                            <li>"สรุปผลการดำเนินการด้านบุคลากร?"</li>
                                            <li>"มีความเสี่ยงอะไรบ้างที่ระบุไว้?"</li>
                                        </ul>
                                    </div>
                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-xs text-yellow-800">
                                            AI อาจมีความผิดพลาด โปรดตรวจสอบข้อมูลกับเอกสารจริงเสมอ
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chat Interface */}
                        <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-lg border shadow-sm">
                            <div className="flex-1 p-4 overflow-hidden">
                                <ScrollArea className="h-full pr-4">
                                    {chatMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                                            <MessageSquare className="h-16 w-16" />
                                            <p>เริ่มสนทนากับข้อมูลของคุณ</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {chatMessages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-br-none'
                                                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                                            }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {isChatting && (
                                                <div className="flex justify-start">
                                                    <div className="bg-slate-100 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                                        <span className="text-xs text-slate-500">กำลังพิมพ์...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                            <div className="p-4 border-t bg-slate-50 rounded-b-lg">
                                <div className="flex gap-2">
                                    <Textarea
                                        value={currentQuestion}
                                        onChange={(e) => setCurrentQuestion(e.target.value)}
                                        placeholder="พิมพ์คำถามของคุณที่นี่..."
                                        className="min-h-[50px] resize-none focus-visible:ring-indigo-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAskQuestion();
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={handleAskQuestion}
                                        disabled={!currentQuestion.trim() || isChatting}
                                        className="h-[50px] w-[50px] shrink-0 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TRENDS TAB */}
                <TabsContent value="trends" className="space-y-6 mt-6">
                    {!previousSarContents || previousSarContents.length === 0 ? (
                        <Alert className="bg-orange-50 border-orange-200">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertTitle className="text-orange-800">ไม่พบข้อมูลเปรียบเทียบ</AlertTitle>
                            <AlertDescription className="text-orange-700">
                                ไม่พบข้อมูล SAR ของรอบการประเมินปีที่แล้ว จึงไม่สามารถวิเคราะห์แนวโน้มได้
                            </AlertDescription>
                        </Alert>
                    ) : !trendResult ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                            <div className="mb-4 flex justify-center">
                                <TrendingUp className="h-12 w-12 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">วิเคราะห์แนวโน้ม (Year-over-Year)</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                เปรียบเทียบผลการดำเนินงานกับปีที่ผ่านมาเพื่อหาพัฒนาการและจุดที่ต้องระวัง
                            </p>
                            <Button
                                onClick={handleTrendAnalyze}
                                disabled={isTrendAnalyzing}
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isTrendAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังวิเคราะห์เปรียบเทียบ...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Analyze Trends
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Card className="border-indigo-200 bg-indigo-50/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-800">
                                        <TrendingUp className="h-5 w-5" />
                                        บทสรุปแนวโน้ม (Trend Summary)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg text-slate-700">{trendResult.summary}</p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-green-200">
                                    <CardHeader className="bg-green-50/50">
                                        <CardTitle className="text-green-700 flex items-center gap-2">
                                            <div className="bg-green-100 p-1 rounded">
                                                <TrendingUp className="h-4 w-4" />
                                            </div>
                                            Improved Areas (ดีขึ้น)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ul className="space-y-3">
                                            {trendResult.improvement_areas.map((item, idx) => (
                                                <li key={idx} className="flex gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                    <span className="text-slate-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-red-200">
                                    <CardHeader className="bg-red-50/50">
                                        <CardTitle className="text-red-700 flex items-center gap-2">
                                            <div className="bg-red-100 p-1 rounded">
                                                <AlertTriangle className="h-4 w-4" />
                                            </div>
                                            Regressed / Needs Attention (ถดถอย)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {trendResult.regression_areas.length > 0 ? (
                                            <ul className="space-y-3">
                                                {trendResult.regression_areas.map((item, idx) => (
                                                    <li key={idx} className="flex gap-3">
                                                        <div className="h-2 w-2 rounded-full bg-red-400 mt-2 shrink-0" />
                                                        <span className="text-slate-700">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                ไม่พบจุดที่ถดถอยอย่างมีนัยสำคัญ
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
