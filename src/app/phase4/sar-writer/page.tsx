'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useAIConfigStore } from '@/stores/ai-config-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, Sparkles, Copy, Save, Loader2, FileText, Trash2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CommentSection from '@/components/comments/CommentSection';
import RefineTextDialog from '@/components/ai/RefineTextDialog';
import { generateSARContent } from '@/lib/google/ai-api';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface SavedContent {
    id: string;
    unitId: string;
    cycleId: string; // v1.6.0: Added cycle support
    category: number;
    subsection: string;
    content: string;
    createdAt: Timestamp;
}

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1: การนำองค์กร', subsections: ['1.1 วิสัยทัศน์และพันธกิจ', '1.2 การสื่อสารและผลการปฏิบัติงาน', '1.3 บรรยากาศการทำงาน'] },
    { id: 2, name: 'หมวด 2: การวางแผนเชิงกลยุทธ์', subsections: ['2.1 การจัดทำกลยุทธ์', '2.2 การนำกลยุทธ์ไปปฏิบัติ'] },
    { id: 3, name: 'หมวด 3: ผู้รับบริการและผู้มีส่วนได้ส่วนเสีย', subsections: ['3.1 ความต้องการของผู้รับบริการ', '3.2 การมีส่วนร่วม'] },
    { id: 4, name: 'หมวด 4: การวัด วิเคราะห์ และจัดการความรู้', subsections: ['4.1 การวัดและวิเคราะห์', '4.2 การจัดการความรู้'] },
    { id: 5, name: 'หมวด 5: การให้ความสำคัญกับบุคลากร', subsections: ['5.1 สภาพแวดล้อมการทำงาน', '5.2 ความผูกพันของบุคลากร'] },
    { id: 6, name: 'หมวด 6: ระบบปฏิบัติการ', subsections: ['6.1 กระบวนการทำงาน', '6.2 ประสิทธิผลของการดำเนินการ'] },
];

export default function SARWriterPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const { apiKey, selectedModel } = useAIConfigStore();
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [selectedSubsection, setSelectedSubsection] = useState('');
    const [contextInput, setContextInput] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedContents, setSavedContents] = useState<SavedContent[]>([]);

    // Comment Dialog State
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [commentContent, setCommentContent] = useState<SavedContent | null>(null);

    // Refine Dialog State
    const [refineDialogOpen, setRefineDialogOpen] = useState(false);
    const [refineTarget, setRefineTarget] = useState<'context' | 'output'>('context');

    const handleOpenRefine = (target: 'context' | 'output') => {
        const text = target === 'context' ? contextInput : generatedContent;
        if (!text.trim()) {
            toast.error('กรุณาระบุข้อความที่ต้องการปรับปรุง');
            return;
        }
        setRefineTarget(target);
        setRefineDialogOpen(true);
    };

    const handleRefineReplace = (newText: string) => {
        if (refineTarget === 'context') {
            setContextInput(newText);
        } else {
            setGeneratedContent(newText);
        }
    };

    const currentCategory = PMQA_CATEGORIES.find(c => c.id === selectedCategory);

    // v1.6.0: Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        if (currentCategory && currentCategory.subsections.length > 0) {
            setSelectedSubsection(currentCategory.subsections[0]);
        }
    }, [selectedCategory, currentCategory]);

    useEffect(() => {
        fetchSavedContents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.unitId, selectedCycle]); // v1.6.0: Re-fetch when cycle changes

    const fetchSavedContents = async () => {
        if (!user?.unitId) return;

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            setSavedContents([]);
            return;
        }

        try {
            const q = query(
                collection(db, 'sar_contents'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id) // v1.6.0
            );
            const snap = await getDocs(q);
            const contents: SavedContent[] = [];
            snap.forEach(d => contents.push({ id: d.id, ...d.data() } as SavedContent));
            setSavedContents(contents);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า Gemini API Key ที่ Settings > AI Config');
            return;
        }

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        if (!contextInput.trim()) {
            toast.error('กรุณาระบุบริบทหรือข้อมูลเบื้องต้น');
            return;
        }

        setGenerating(true);
        try {
            const prompt = `คุณเป็นผู้เชี่ยวชาญด้านการเขียน Self Assessment Report (SAR) ตามเกณฑ์ PMQA 4.0

หัวข้อ: ${currentCategory?.name} - ${selectedSubsection}

บริบทและข้อมูลจากหน่วยงาน:
${contextInput}

กรุณาเขียนเนื้อหาสำหรับส่วนนี้ โดย:
1. ใช้ภาษาราชการที่เป็นทางการและชัดเจน
2. ระบุกระบวนการ/แนวทางปฏิบัติที่หน่วยงานใช้
3. ยกตัวอย่างที่เป็นรูปธรรม
4. เชื่อมโยงกับเกณฑ์ PMQA
5. มีความยาวประมาณ 300-500 คำ

เขียนเนื้อหา:`;

            const content = await generateSARContent(apiKey, selectedModel, prompt);
            setGeneratedContent(content);
            toast.success('สร้างเนื้อหาสำเร็จ');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างเนื้อหา';
            toast.error(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedContent.trim()) {
            toast.error('ไม่มีเนื้อหาที่จะบันทึก');
            return;
        }

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, 'sar_contents'), {
                unitId: user!.unitId,
                cycleId: selectedCycle.id, // v1.6.0
                category: selectedCategory,
                subsection: selectedSubsection,
                content: generatedContent,
                createdAt: serverTimestamp(),
            });
            toast.success('บันทึกเนื้อหาสำเร็จ');
            fetchSavedContents();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        toast.success('คัดลอกเนื้อหาแล้ว');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบเนื้อหานี้?')) return;
        try {
            await deleteDoc(doc(db, 'sar_contents', id));
            toast.success('ลบสำเร็จ');
            fetchSavedContents();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };


    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <PenTool className="h-8 w-8 text-purple-600" />
                            SAR Writer Assistant
                        </h1>
                        <p className="text-muted-foreground">เขียนเนื้อหา SAR ด้วย AI (App 4.2)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-purple-700 border-purple-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-sm">
                            Model: {selectedModel || 'ไม่ได้ตั้งค่า'}
                        </Badge>
                    </div>
                </div>

                {/* v1.6.0: Warning if no cycle selected */}
                {!selectedCycle && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-800">ยังไม่ได้เลือกรอบการประเมิน</p>
                                    <p className="text-sm text-yellow-700">กรุณาเลือกรอบการประเมินจาก Header ด้านบน</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="writer" className="mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="writer">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Writer
                        </TabsTrigger>
                        <TabsTrigger value="library">
                            <FileText className="h-4 w-4 mr-2" />
                            เนื้อหาที่บันทึก ({savedContents.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="writer" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Input */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>เลือกหัวข้อ</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">หมวด PMQA</label>
                                            <Select value={selectedCategory.toString()} onValueChange={(v) => setSelectedCategory(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PMQA_CATEGORIES.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">หัวข้อย่อย</label>
                                            <Select value={selectedSubsection} onValueChange={setSelectedSubsection}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currentCategory?.subsections.map((sub, idx) => (
                                                        <SelectItem key={idx} value={sub}>
                                                            {sub}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>ข้อมูลบริบท</CardTitle>
                                        <CardDescription>ระบุข้อมูล/แนวทางปฏิบัติของหน่วยงาน</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={contextInput}
                                            onChange={(e) => setContextInput(e.target.value)}
                                            placeholder="เช่น:&#10;- พันธกิจของหน่วยงาน&#10;- กระบวนการทำงานที่เกี่ยวข้อง&#10;- ข้อมูลสถิติ/ผลการดำเนินงาน&#10;- โครงการ/กิจกรรมสำคัญ"
                                            rows={12}
                                            className="font-mono text-sm"
                                        />
                                        <div className="flex justify-between mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenRefine('context')}
                                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                            >
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                ปรับปรุงภาษา (AI Refine)
                                            </Button>
                                            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                                                {generating ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        กำลังสร้าง...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4" />
                                                        สร้างเนื้อหา
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Output */}
                            <div>
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>เนื้อหาที่สร้าง</CardTitle>
                                                <CardDescription>{currentCategory?.name} - {selectedSubsection}</CardDescription>
                                            </div>
                                            {generatedContent && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenRefine('output')}
                                                        title="ปรับปรุงภาษา (Refine)"
                                                        className="text-purple-600 hover:bg-purple-50"
                                                    >
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCopy}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {generatedContent ? (
                                            <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border min-h-[500px]">
                                                <pre className="whitespace-pre-wrap font-sans text-slate-700">{generatedContent}</pre>
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 text-muted-foreground">
                                                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                                <p>กรอกข้อมูลบริบทและคลิก &ldquo;สร้างเนื้อหา&rdquo;</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="library">
                        <Card>
                            <CardHeader>
                                <CardTitle>เนื้อหาที่บันทึกไว้</CardTitle>
                                <CardDescription>เนื้อหา SAR ทั้งหมดที่เคยสร้างและบันทึก</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {savedContents.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                        <p>ยังไม่มีเนื้อหาที่บันทึก</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {PMQA_CATEGORIES.map(cat => {
                                            const catContents = savedContents.filter(c => c.category === cat.id);
                                            if (catContents.length === 0) return null;

                                            return (
                                                <div key={cat.id} className="border rounded-lg p-4">
                                                    <h3 className="font-semibold mb-3">{cat.name}</h3>
                                                    <div className="space-y-3">
                                                        {catContents.map(content => (
                                                            <div key={content.id} className="bg-slate-50 p-3 rounded border">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-sm font-medium">{content.subsection}</span>
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setGeneratedContent(content.content);
                                                                                setSelectedCategory(content.category);
                                                                                setSelectedSubsection(content.subsection);
                                                                            }}
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="text-red-600"
                                                                            onClick={() => handleDelete(content.id)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setCommentContent(content);
                                                                                setCommentDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <MessageSquare className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground line-clamp-2">{content.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Comment Dialog */}
                <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>ความคิดเห็น</DialogTitle>
                            <DialogDescription>
                                {commentContent?.subsection}
                            </DialogDescription>
                        </DialogHeader>
                        {commentContent && (
                            <CommentSection
                                targetType="sar_content"
                                targetId={commentContent.id}
                            />
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>ปิด</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <RefineTextDialog
                isOpen={refineDialogOpen}
                onClose={() => setRefineDialogOpen(false)}
                currentText={refineTarget === 'context' ? contextInput : generatedContent}
                onReplace={handleRefineReplace}
            />
        </ProtectedRoute>
    );
}
