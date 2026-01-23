'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { AssessmentCycle } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth/role-helper';
import { Plus, Edit, CheckCircle2, Calendar, Target } from 'lucide-react';
import { getAllCycles, switchActiveCycle, getCycleStatusDisplay } from '@/lib/cycles/cycle-helper';
import CalendarSyncButton from '@/components/calendar/CalendarSyncButton';

export default function CyclesManagementPage() {
    const { user } = useAuthStore();
    const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCycleId, setEditingCycleId] = useState<string | null>(null);

    // Form states
    const [year, setYear] = useState(new Date().getFullYear() + 543); // ปีพ.ศ. ปัจจุบัน
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState<AssessmentCycle['status']>('draft');
    const [targetCategories, setTargetCategories] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
    const [targetScore, setTargetScore] = useState<number>(0);

    const fetchCycles = async () => {
        setLoading(true);
        try {
            const data = await getAllCycles();
            setCycles(data);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถดึงข้อมูลรอบการประเมินได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    const resetForm = () => {
        setYear(new Date().getFullYear() + 543);
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('draft');
        setTargetCategories([1, 2, 3, 4, 5, 6, 7]);
        setTargetScore(0);
        setEditMode(false);
        setEditingCycleId(null);
    };

    const handleSubmit = async () => {
        if (!name || !startDate || !endDate) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (targetCategories.length === 0) {
            toast.error('กรุณาเลือกหมวดที่ต้องการประเมินอย่างน้อย 1 หมวด');
            return;
        }

        try {
            const cycleData: Partial<AssessmentCycle> = {
                year,
                name,
                description,
                targetCategories: targetCategories.sort((a, b) => a - b),
                startDate: Timestamp.fromDate(new Date(startDate)),
                endDate: Timestamp.fromDate(new Date(endDate)),
                status,
                isActive: false, // ต้องเปิดใช้งานแยกต่างหาก
                updatedAt: serverTimestamp() as Timestamp,
                metadata: {
                    targetScore: targetScore > 0 ? targetScore : undefined,
                },
            };

            if (editMode && editingCycleId) {
                // Update existing cycle
                await updateDoc(doc(db, 'cycles', editingCycleId), cycleData);
                toast.success('อัปเดตรอบการประเมินเรียบร้อยแล้ว');
            } else {
                // Create new cycle
                await addDoc(collection(db, 'cycles'), {
                    ...cycleData,
                    createdAt: serverTimestamp(),
                    createdBy: user?.uid,
                });
                toast.success('สร้างรอบการประเมินเรียบร้อยแล้ว');
            }

            setDialogOpen(false);
            resetForm();
            fetchCycles();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleEdit = (cycle: AssessmentCycle) => {
        setEditMode(true);
        setEditingCycleId(cycle.id);
        setYear(cycle.year);
        setName(cycle.name);
        setDescription(cycle.description || '');
        setStartDate(new Date(cycle.startDate.seconds * 1000).toISOString().split('T')[0]);
        setEndDate(new Date(cycle.endDate.seconds * 1000).toISOString().split('T')[0]);
        setStatus(cycle.status);
        setTargetCategories(cycle.targetCategories);
        setTargetScore(cycle.metadata?.targetScore || 0);
        setDialogOpen(true);
    };

    const handleActivate = async (cycleId: string) => {
        if (!confirm('ยืนยันการเปิดใช้งานรอบการประเมินนี้? รอบที่เปิดอยู่จะถูกปิดโดยอัตโนมัติ')) return;

        const success = await switchActiveCycle(cycleId);
        if (success) {
            toast.success('เปิดใช้งานรอบการประเมินเรียบร้อยแล้ว');
            fetchCycles();
        } else {
            toast.error('เกิดข้อผิดพลาดในการเปิดใช้งาน');
        }
    };

    const toggleCategory = (categoryId: number) => {
        setTargetCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600" />
                                จัดการรอบการประเมิน PMQA
                            </CardTitle>
                            <CardDescription>สร้าง แก้ไข และจัดการรอบการประเมิน PMQA ของหน่วยงาน</CardDescription>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    สร้างรอบการประเมินใหม่
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editMode ? 'แก้ไขรอบการประเมิน' : 'สร้างรอบการประเมินใหม่'}</DialogTitle>
                                    <DialogDescription>กรอกข้อมูลรอบการประเมิน PMQA</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>ปี พ.ศ.</Label>
                                            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label>สถานะ</Label>
                                            <Select value={status} onValueChange={(v: AssessmentCycle['status']) => setStatus(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">ร่าง</SelectItem>
                                                    <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                                                    <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                                    <SelectItem value="archived">เก็บถาวร</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>ชื่อรอบการประเมิน</Label>
                                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น รอบประเมิน PMQA 2568" />
                                    </div>
                                    <div>
                                        <Label>คำอธิบาย (ถ้ามี)</Label>
                                        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>วันเริ่มต้น</Label>
                                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>วันสิ้นสุด</Label>
                                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>คะแนนเป้าหมาย (ถ้ามี)</Label>
                                        <Input type="number" value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))} placeholder="0-100" min={0} max={100} />
                                    </div>
                                    <div>
                                        <Label className="mb-3 block">หมวดที่ต้องการประเมิน</Label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[1, 2, 3, 4, 5, 6, 7].map(cat => (
                                                <div key={cat} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`cat-${cat}`}
                                                        checked={targetCategories.includes(cat)}
                                                        onCheckedChange={() => toggleCategory(cat)}
                                                    />
                                                    <label htmlFor={`cat-${cat}`} className="cursor-pointer">หมวด {cat}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                                    <Button onClick={handleSubmit}>{editMode ? 'บันทึกการแก้ไข' : 'สร้างรอบการประเมิน'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : cycles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">ยังไม่มีรอบการประเมิน</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ปี พ.ศ.</TableHead>
                                        <TableHead>ชื่อรอบ</TableHead>
                                        <TableHead>ระยะเวลา</TableHead>
                                        <TableHead>หมวดประเมิน</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cycles.map((cycle) => (
                                        <TableRow key={cycle.id}>
                                            <TableCell className="font-medium">{cycle.year}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {cycle.name}
                                                    {cycle.isActive && <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(cycle.startDate.seconds * 1000).toLocaleDateString('th-TH')}
                                                {' - '}
                                                {new Date(cycle.endDate.seconds * 1000).toLocaleDateString('th-TH')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {cycle.targetCategories.map(cat => (
                                                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'}>
                                                    {getCycleStatusDisplay(cycle.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <CalendarSyncButton cycle={cycle} />
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(cycle)}>
                                                    <Edit className="h-3 w-3 mr-1" /> แก้ไข
                                                </Button>
                                                {!cycle.isActive && (
                                                    <Button size="sm" variant="default" onClick={() => handleActivate(cycle.id)}>
                                                        <Target className="h-3 w-3 mr-1" /> เปิดใช้งาน
                                                    </Button>
                                                )}
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
