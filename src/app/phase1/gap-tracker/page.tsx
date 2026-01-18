'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, Plus, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import ThaiUtils from '@/lib/utils/thai-utils';

interface GapItem {
    id: string;
    unitId: string;
    categoryId: number;
    criteriaId: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    assignedTo?: string;
    targetDate?: Timestamp;
    resolvedDate?: Timestamp;
    notes?: string;
    createdAt: Timestamp;
}

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1' },
    { id: 2, name: 'หมวด 2' },
    { id: 3, name: 'หมวด 3' },
    { id: 4, name: 'หมวด 4' },
    { id: 5, name: 'หมวด 5' },
    { id: 6, name: 'หมวด 6' },
    { id: 7, name: 'หมวด 7' },
];

export default function GapClosureTrackerPage() {
    const { user } = useAuthStore();
    const [gaps, setGaps] = useState<GapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // New Gap Form
    const [newCriteria, setNewCriteria] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState(1);

    const fetchGaps = async () => {
        if (!user?.unitId) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'gap_items'), where('unitId', '==', user.unitId));
            const snap = await getDocs(q);
            const data: GapItem[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as GapItem));
            setGaps(data.sort((a, b) => a.categoryId - b.categoryId));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGaps();
    }, [user]);

    const handleAddGap = async () => {
        if (!newCriteria || !newDescription) {
            toast.error('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        setAdding(true);
        try {
            await addDoc(collection(db, 'gap_items'), {
                unitId: user!.unitId,
                categoryId: newCategory,
                criteriaId: newCriteria,
                description: newDescription,
                status: 'open',
                createdAt: serverTimestamp(),
            });
            toast.success('เพิ่มรายการสำเร็จ');
            setNewCriteria('');
            setNewDescription('');
            fetchGaps();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setAdding(false);
        }
    };

    const handleStatusChange = async (gapId: string, newStatus: GapItem['status']) => {
        try {
            const updates: any = { status: newStatus };
            if (newStatus === 'resolved') {
                updates.resolvedDate = serverTimestamp();
            }
            await updateDoc(doc(db, 'gap_items', gapId), updates);
            toast.success('อัปเดตสถานะสำเร็จ');
            fetchGaps();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const stats = {
        total: gaps.length,
        open: gaps.filter(g => g.status === 'open').length,
        inProgress: gaps.filter(g => g.status === 'in_progress').length,
        resolved: gaps.filter(g => g.status === 'resolved').length,
    };

    const completionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    const getStatusBadge = (status: GapItem['status']) => {
        switch (status) {
            case 'open':
                return <Badge variant="outline" className="text-red-600 border-red-200"><Circle className="h-3 w-3 mr-1" />รอดำเนินการ</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />กำลังดำเนินการ</Badge>;
            case 'resolved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />เสร็จสิ้น</Badge>;
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <ClipboardCheck className="h-8 w-8 text-rose-600" />
                            Gap Closure Tracker
                        </h1>
                        <p className="text-muted-foreground">ติดตามการปิด Gap หลักฐาน (App 1.4)</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> เพิ่ม Gap ใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>เพิ่มรายการ Gap</DialogTitle>
                                <DialogDescription>ระบุเกณฑ์ที่ยังขาดหลักฐาน</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">หมวด</Label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(Number(e.target.value))}
                                        className="col-span-3 border rounded-md p-2"
                                    >
                                        {PMQA_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">เกณฑ์</Label>
                                    <Input value={newCriteria} onChange={(e) => setNewCriteria(e.target.value)} className="col-span-3" placeholder="เช่น 1.1 ก(1)" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">รายละเอียด</Label>
                                    <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="col-span-3" placeholder="ขาดหลักฐานอะไร" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddGap} disabled={adding}>
                                    {adding ? 'กำลังบันทึก...' : 'บันทึก'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Progress Overview */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>ความคืบหน้าการปิด Gap</CardTitle>
                            <span className="text-2xl font-bold text-rose-600">{completionRate}%</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Progress value={completionRate} className="h-3 mb-4" />
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-xs text-muted-foreground">ทั้งหมด</div>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                                <div className="text-xs text-red-600">รอดำเนินการ</div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                                <div className="text-xs text-yellow-600">กำลังดำเนินการ</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                                <div className="text-xs text-green-600">เสร็จสิ้น</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gap List */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการ Gap ({gaps.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : gaps.length === 0 ? (
                            <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                                <p className="font-medium">ไม่พบ Gap - หลักฐานครบถ้วน!</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">หมวด</TableHead>
                                        <TableHead className="w-[100px]">เกณฑ์</TableHead>
                                        <TableHead>รายละเอียด</TableHead>
                                        <TableHead className="w-[150px]">สถานะ</TableHead>
                                        <TableHead className="w-[200px]">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gaps.map((gap) => (
                                        <TableRow key={gap.id}>
                                            <TableCell>
                                                <Badge variant="outline">{PMQA_CATEGORIES.find(c => c.id === gap.categoryId)?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">{gap.criteriaId}</TableCell>
                                            <TableCell>{gap.description}</TableCell>
                                            <TableCell>{getStatusBadge(gap.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {gap.status === 'open' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(gap.id, 'in_progress')}>
                                                            เริ่มดำเนินการ
                                                        </Button>
                                                    )}
                                                    {gap.status === 'in_progress' && (
                                                        <Button size="sm" variant="default" className="bg-green-600" onClick={() => handleStatusChange(gap.id, 'resolved')}>
                                                            เสร็จสิ้น
                                                        </Button>
                                                    )}
                                                    {gap.status === 'resolved' && (
                                                        <span className="text-sm text-green-600">✓ ปิด Gap แล้ว</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
