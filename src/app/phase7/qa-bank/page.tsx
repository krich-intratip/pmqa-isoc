'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useAIConfigStore } from '@/stores/ai-config-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HelpCircle, Plus, Sparkles, Trash2, Edit, Loader2, Save, MessageSquare, AlertTriangle } from 'lucide-react';
import { generateSARContent } from '@/lib/google/ai-api';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface QAItem {
    id: string;
    category: number;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: Timestamp;
}

const CATEGORIES = [
    { id: 1, name: 'หมวด 1: การนำองค์กร' },
    { id: 2, name: 'หมวด 2: การวางแผนเชิงกลยุทธ์' },
    { id: 3, name: 'หมวด 3: ผู้รับบริการ' },
    { id: 4, name: 'หมวด 4: การวัดและวิเคราะห์' },
    { id: 5, name: 'หมวด 5: บุคลากร' },
    { id: 6, name: 'หมวด 6: กระบวนการ' },
    { id: 7, name: 'หมวด 7: ผลลัพธ์' },
];

export default function QABankPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const { apiKey, selectedModel } = useAIConfigStore();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [qaItems, setQaItems] = useState<QAItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [filterCategory, setFilterCategory] = useState(0);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        fetchQAItems();
    }, [user?.unitId, selectedCycle]);

    const fetchQAItems = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            setQaItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const q = query(
                collection(db, 'qa_bank'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id)
            );
            const snap = await getDocs(q);
            const items: QAItem[] = [];
            snap.forEach(d => items.push({ id: d.id, ...d.data() } as QAItem));
            items.sort((a, b) => a.category - b.category);
            setQaItems(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQA = async () => {
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า Gemini API Key ที่ Settings > AI Config');
            return;
        }

        setGenerating(true);
        try {
            const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name;

            const prompt = `คุณเป็นผู้เชี่ยวชาญ PMQA 4.0 กรุณาสร้างคำถาม-คำตอบสำหรับ ${categoryName}

สร้าง 3 คำถามที่มักถูกถามในการตรวจประเมิน พร้อมคำตอบที่เหมาะสม

รูปแบบ Output (JSON Array):
[
  {
    "question": "คำถาม 1",
    "answer": "คำตอบ 1",
    "difficulty": "easy|medium|hard"
  },
  ...
]

ให้ครอบคลุมระดับความยาก:
- easy: คำถามพื้นฐาน ตอบตรงไปตรงมา
- medium: คำถามเชิงวิเคราะห์ ต้องอธิบายกระบวนการ
- hard: คำถามเชิงลึก เชื่อมโยงผลลัพธ์

ตอบเป็น JSON เท่านั้น:`;

            const content = await generateSARContent(apiKey, selectedModel, prompt);

            // Parse JSON
            const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
            const generated = JSON.parse(jsonStr);

            // Save to Firestore
            for (const item of generated) {
                await addDoc(collection(db, 'qa_bank'), {
                    unitId: user!.unitId,
                    cycleId: selectedCycle!.id,
                    category: selectedCategory,
                    question: item.question,
                    answer: item.answer,
                    difficulty: item.difficulty,
                    createdAt: serverTimestamp(),
                });
            }

            toast.success(`สร้าง ${generated.length} คำถามสำเร็จ`);
            fetchQAItems();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'เกิดข้อผิดพลาด');
        } finally {
            setGenerating(false);
        }
    };

    const handleAddManual = async () => {
        if (!newQuestion.trim() || !newAnswer.trim()) {
            toast.error('กรุณากรอกคำถามและคำตอบ');
            return;
        }

        try {
            await addDoc(collection(db, 'qa_bank'), {
                unitId: user!.unitId,
                cycleId: selectedCycle!.id,
                category: selectedCategory,
                question: newQuestion,
                answer: newAnswer,
                difficulty,
                createdAt: serverTimestamp(),
            });
            toast.success('เพิ่มคำถามสำเร็จ');
            setNewQuestion('');
            setNewAnswer('');
            setDialogOpen(false);
            fetchQAItems();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบคำถามนี้?')) return;
        try {
            await deleteDoc(doc(db, 'qa_bank', id));
            toast.success('ลบสำเร็จ');
            fetchQAItems();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const filteredItems = filterCategory === 0
        ? qaItems
        : qaItems.filter(q => q.category === filterCategory);

    const getDifficultyBadge = (d: string) => {
        switch (d) {
            case 'easy': return <Badge className="bg-green-100 text-green-800">ง่าย</Badge>;
            case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">ปานกลาง</Badge>;
            case 'hard': return <Badge className="bg-red-100 text-red-800">ยาก</Badge>;
            default: return <Badge>{d}</Badge>;
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <HelpCircle className="h-8 w-8 text-violet-600" />
                            Q&A Bank Builder
                        </h1>
                        <p className="text-muted-foreground">คลังคำถาม-คำตอบสำหรับการตรวจประเมิน (App 7.2)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-violet-700 border-violet-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <div className="flex gap-2">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        เพิ่มเอง
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>เพิ่มคำถาม-คำตอบ</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>หมวด</Label>
                                            <Select value={selectedCategory.toString()} onValueChange={(v) => setSelectedCategory(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map(c => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ระดับความยาก</Label>
                                            <Select value={difficulty} onValueChange={(v: 'easy' | 'medium' | 'hard') => setDifficulty(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="easy">ง่าย</SelectItem>
                                                    <SelectItem value="medium">ปานกลาง</SelectItem>
                                                    <SelectItem value="hard">ยาก</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>คำถาม</Label>
                                            <Textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} rows={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>คำตอบ</Label>
                                            <Textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} rows={5} />
                                        </div>
                                        <Button onClick={handleAddManual} className="w-full gap-2">
                                            <Save className="h-4 w-4" />
                                            บันทึก
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* AI Generate Section */}
                <Card className="mb-6 border-violet-200 bg-violet-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <Sparkles className="h-8 w-8 text-violet-600" />
                            <div className="flex-1">
                                <div className="font-semibold text-violet-900">สร้างคำถามอัตโนมัติด้วย AI</div>
                                <div className="text-sm text-violet-700">เลือกหมวดแล้วกด Generate เพื่อสร้าง 3 คำถามพร้อมคำตอบ</div>
                            </div>
                            <Select value={selectedCategory.toString()} onValueChange={(v) => setSelectedCategory(Number(v))}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGenerateQA} disabled={generating} className="gap-2">
                                {generating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        กำลังสร้าง...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filter & List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    คลังคำถาม ({filteredItems.length})
                                </CardTitle>
                            </div>
                            <Select value={filterCategory.toString()} onValueChange={(v) => setFilterCategory(Number(v))}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">ทุกหมวด</SelectItem>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p>ยังไม่มีคำถามในคลัง</p>
                                <p className="text-sm">ใช้ AI Generate หรือเพิ่มเองได้</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredItems.map((item) => (
                                    <div key={item.id} className="p-4 border rounded-lg bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">หมวด {item.category}</Badge>
                                                {getDifficultyBadge(item.difficulty)}
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="mb-2">
                                            <div className="font-medium text-slate-800">Q: {item.question}</div>
                                        </div>
                                        <div className="text-sm text-foreground bg-card p-3 rounded border">
                                            <span className="font-medium text-green-700">A:</span> {item.answer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
