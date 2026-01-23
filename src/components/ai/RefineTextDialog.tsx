import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, ArrowRight, RefreshCw, Undo2 } from 'lucide-react';
import { refineSARText } from '@/lib/google/ai-api';
import { useAIConfigStore } from '@/stores/ai-config-store';
import { toast } from 'sonner';

interface RefineTextDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentText: string;
    onReplace: (newText: string) => void;
}

export default function RefineTextDialog({ isOpen, onClose, currentText, onReplace }: RefineTextDialogProps) {
    const { apiKey, selectedModel } = useAIConfigStore();
    const [refinedText, setRefinedText] = useState('');
    const [tone, setTone] = useState<'official' | 'concise' | 'elaborate'>('official');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && currentText) {
            handleRefine();
        } else {
            setRefinedText('');
            setError('');
        }
    }, [isOpen]); // Only trigger on open, not on text change (to avoid auto-refining while typing)

    const handleRefine = async () => {
        if (!currentText.trim()) return;
        if (!apiKey) {
            setError('Please configure API Key in settings');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await refineSARText(apiKey, selectedModel, currentText, tone);
            setRefinedText(result);
        } catch (err) {
            console.error(err);
            setError('Failed to refine text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        onReplace(refinedText);
        onClose();
        toast.success('Text replaced successfully');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                        AI Text Refinement
                    </DialogTitle>
                    <DialogDescription>
                        ปรับปรุงสำนวนภาษาให้เหมาะสมกับรายงานราชการ (SAR)
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end mb-2">
                    <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="official">เป็นทางการ (Official)</SelectItem>
                            <SelectItem value="concise">กระชับ (Concise)</SelectItem>
                            <SelectItem value="elaborate">ขยายความ (Elaborate)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-[400px]">
                    {/* Original */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-slate-500">ต้นฉบับ (Original)</label>
                        <div className="flex-1 p-4 bg-slate-50 rounded-lg border overflow-y-auto max-h-[500px]">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentText}</p>
                        </div>
                    </div>

                    {/* Arrow for Desktop */}
                    <div className="hidden md:flex flex-col justify-center items-center">
                        <ArrowRight className="text-slate-300" />
                    </div>

                    {/* Refined */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-purple-600 flex justify-between">
                            <span>ฉบับปรับปรุง (AI Refined)</span>
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </label>
                        <div className="flex-1 p-0 relative h-full">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 z-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                        <span className="text-sm text-slate-500">กำลังปรับปรุงสำนวน...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="h-full flex items-center justify-center text-red-500 text-sm p-4 text-center border rounded-lg bg-red-50">
                                    {error}
                                </div>
                            ) : (
                                <Textarea
                                    value={refinedText}
                                    onChange={(e) => setRefinedText(e.target.value)}
                                    className="h-full min-h-[300px] resize-none border-purple-200 focus:ring-purple-500 bg-purple-50/10"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <Button variant="secondary" onClick={handleRefine} disabled={loading}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            ลองใหม่
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={loading || !refinedText}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            แทนที่ต้นฉบับ
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
