'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Trash2, Edit, Target, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface KPIDefinition {
    id: string;
    unitId: string;
    cycleId: string; // v1.6.0: Added cycle support
    code: string;
    name: string;
    description: string;
    categoryId: number;
    formula: string;
    unit: string;
    direction: 'up' | 'down' | 'maintain';
    targetValue: number;
    baselineValue: number;
    dataSourceId?: string;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    owner: string;
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

export default function KPIDictionaryPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [kpis, setKPIs] = useState<KPIDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingKPI, setEditingKPI] = useState<KPIDefinition | null>(null);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState(7);
    const [formFormula, setFormFormula] = useState('');
    const [formUnit, setFormUnit] = useState('');
    const [formDirection, setFormDirection] = useState<'up' | 'down' | 'maintain'>('up');
    const [formTarget, setFormTarget] = useState('');
    const [formBaseline, setFormBaseline] = useState('');
    const [formOwner, setFormOwner] = useState('');
    const [formFrequency, setFormFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly');

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const fetchKPIs = async () => {
        if (!user?.unitId) return;

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            setKPIs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'kpi_definitions'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id) // v1.6.0
            );
            const snap = await getDocs(q);
            const data: KPIDefinition[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as KPIDefinition));
            setKPIs(data.sort((a, b) => a.categoryId - b.categoryId || a.code.localeCompare(b.code)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedCycle]); // v1.6.0: Re-fetch when cycle changes

    const resetForm = () => {
        setFormCode('');
        setFormName('');
        setFormDescription('');
        setFormCategory(7);
        setFormFormula('');
        setFormUnit('');
        setFormDirection('up');
        setFormTarget('');
        setFormBaseline('');
        setFormOwner('');
        setFormFrequency('yearly');
        setEditingKPI(null);
    };

    const handleEdit = (kpi: KPIDefinition) => {
        setEditingKPI(kpi);
        setFormCode(kpi.code);
        setFormName(kpi.name);
        setFormDescription(kpi.description);
        setFormCategory(kpi.categoryId);
        setFormFormula(kpi.formula);
        setFormUnit(kpi.unit);
        setFormDirection(kpi.direction);
        setFormTarget(kpi.targetValue.toString());
        setFormBaseline(kpi.baselineValue.toString());
        setFormOwner(kpi.owner);
        setFormFrequency(kpi.frequency);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formCode || !formName) {
            toast.error('กรุณากรอกรหัสและชื่อ KPI');
            return;
        }

        if (!user?.unitId) {
            toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
            return;
        }

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setSaving(true);
        try {
            const kpiData = {
                unitId: user.unitId,
                cycleId: selectedCycle.id, // v1.6.0
                code: formCode,
                name: formName,
                description: formDescription,
                categoryId: formCategory,
                formula: formFormula,
                unit: formUnit,
                direction: formDirection,
                targetValue: parseFloat(formTarget) || 0,
                baselineValue: parseFloat(formBaseline) || 0,
                owner: formOwner,
                frequency: formFrequency,
            };

            if (editingKPI) {
                await updateDoc(doc(db, 'kpi_definitions', editingKPI.id), kpiData);
                toast.success('อัปเดต KPI สำเร็จ');
            } else {
                await addDoc(collection(db, 'kpi_definitions'), {
                    ...kpiData,
                    createdAt: serverTimestamp(),
                });
                toast.success('เพิ่ม KPI สำเร็จ');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchKPIs();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบ KPI นี้?')) return;
        try {
            await deleteDoc(doc(db, 'kpi_definitions', id));
            toast.success('ลบสำเร็จ');
            fetchKPIs();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const getDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
            default: return <Minus className="h-4 w-4 text-yellow-600" />;
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            KPI Dictionary
                        </h1>
                        <p className="text-muted-foreground">พจนานุกรม KPI (App 2.2)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-indigo-700 border-indigo-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" disabled={!selectedCycle}>
                                    <Plus className="h-4 w-4" /> เพิ่ม KPI
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingKPI ? 'แก้ไข KPI' : 'เพิ่ม KPI ใหม่'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-6 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label>รหัส KPI</Label>
                                            <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="KPI-7.1" />
                                        </div>
                                        <div className="col-span-4 space-y-2">
                                            <Label>ชื่อ KPI</Label>
                                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="อัตราความพึงพอใจ" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>หมวด PMQA</Label>
                                            <select value={formCategory} onChange={(e) => setFormCategory(Number(e.target.value))} className="w-full border rounded-md p-2">
                                                {PMQA_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>หน่วย</Label>
                                            <Input value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="%" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ทิศทาง</Label>
                                            <select value={formDirection} onChange={(e) => setFormDirection(e.target.value as 'up' | 'down' | 'maintain')} className="w-full border rounded-md p-2">
                                                <option value="up">↑ ยิ่งสูงยิ่งดี</option>
                                                <option value="down">↓ ยิ่งต่ำยิ่งดี</option>
                                                <option value="maintain">→ รักษาระดับ</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>ค่า Baseline</Label>
                                            <Input type="number" value={formBaseline} onChange={(e) => setFormBaseline(e.target.value)} placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ค่าเป้าหมาย</Label>
                                            <Input type="number" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} placeholder="100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ความถี่วัด</Label>
                                            <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')} className="w-full border rounded-md p-2">
                                                <option value="monthly">รายเดือน</option>
                                                <option value="quarterly">รายไตรมาส</option>
                                                <option value="yearly">รายปี</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>สูตรคำนวณ</Label>
                                        <Input value={formFormula} onChange={(e) => setFormFormula(e.target.value)} placeholder="(จำนวนผู้พึงพอใจ / จำนวนผู้ตอบแบบสอบถาม) × 100" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ผู้รับผิดชอบ</Label>
                                        <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} placeholder="ชื่อผู้รับผิดชอบ" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>คำอธิบาย</Label>
                                        <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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

                {/* Stats by Category */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {PMQA_CATEGORIES.map(cat => (
                        <Card key={cat.id} className="text-center">
                            <CardContent className="pt-4">
                                <div className="text-xl font-bold text-indigo-600">{kpis.filter(k => k.categoryId === cat.id).length}</div>
                                <div className="text-xs text-muted-foreground">{cat.name}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการ KPI ({kpis.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : kpis.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มี KPI - คลิก &quot;เพิ่ม KPI&quot; เพื่อเริ่มต้น</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">รหัส</TableHead>
                                        <TableHead>ชื่อ KPI</TableHead>
                                        <TableHead className="w-[80px]">หมวด</TableHead>
                                        <TableHead className="w-[100px]">Baseline</TableHead>
                                        <TableHead className="w-[100px]">เป้าหมาย</TableHead>
                                        <TableHead className="w-[60px]">หน่วย</TableHead>
                                        <TableHead className="text-right w-[100px]">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kpis.map((kpi) => (
                                        <TableRow key={kpi.id}>
                                            <TableCell className="font-mono font-medium">{kpi.code}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getDirectionIcon(kpi.direction)}
                                                    <span>{kpi.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{PMQA_CATEGORIES.find(c => c.id === kpi.categoryId)?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{kpi.baselineValue}</TableCell>
                                            <TableCell className="text-right font-medium text-green-600">{kpi.targetValue}</TableCell>
                                            <TableCell>{kpi.unit}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(kpi)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(kpi.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
