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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardEdit, Save, AlertCircle, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface KPIData {
    id: string;
    kpiId: string;
    kpiCode: string;
    kpiName: string;
    unitId: string;
    cycleId?: string; // Add cycleId field
    period: string; // format: YYYY-MM
    value: number;
    target: number;
    status: 'draft' | 'submitted' | 'validated';
    validationNotes?: string;
    createdAt: Timestamp;
}

const MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function DataCollectorPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [kpiList, setKpiList] = useState<Record<string, unknown>[]>([]);
    const [dataEntries, setDataEntries] = useState<KPIData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedYear, setSelectedYear] = useState((new Date().getFullYear() + 543).toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

    // Form state for data entry
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const fetchData = async () => {
        if (!user?.unitId) return;

        // If no cycle selected, clear data
        if (!selectedCycle) {
            setKpiList([]);
            setDataEntries([]);
            setFormValues({});
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch KPI definitions
            const kpiQ = query(collection(db, 'kpi_definitions'), where('unitId', '==', user.unitId));
            const kpiSnap = await getDocs(kpiQ);
            const kpis: Record<string, unknown>[] = [];
            kpiSnap.forEach(d => kpis.push({ id: d.id, ...d.data() }));
            setKpiList(kpis);

            // Fetch existing data entries for selected period and cycle
            const period = `${parseInt(selectedYear) - 543}-${selectedMonth.padStart(2, '0')}`;
            const dataQ = query(
                collection(db, 'kpi_data'),
                where('unitId', '==', user.unitId),
                where('period', '==', period),
                where('cycleId', '==', selectedCycle.id)
            );
            const dataSnap = await getDocs(dataQ);
            const entries: KPIData[] = [];
            dataSnap.forEach(d => entries.push({ id: d.id, ...d.data() } as KPIData));
            setDataEntries(entries);

            // Initialize form values
            const values: Record<string, string> = {};
            kpis.forEach(kpi => {
                const existing = entries.find(e => e.kpiId === (kpi.id as string));
                values[kpi.id as string] = existing ? existing.value.toString() : '';
            });
            setFormValues(values);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedYear, selectedMonth, selectedCycle]);

    const handleValueChange = (kpiId: string, value: string) => {
        setFormValues(prev => ({ ...prev, [kpiId]: value }));
    };

    const getValidationStatus = (value: number, target: number, direction: string): { valid: boolean; message: string } => {
        if (isNaN(value)) return { valid: false, message: 'ค่าไม่ถูกต้อง' };
        if (value < 0) return { valid: false, message: 'ค่าต้องไม่ติดลบ' };

        if (direction === 'up' && value >= target) return { valid: true, message: 'บรรลุเป้าหมาย' };
        if (direction === 'down' && value <= target) return { valid: true, message: 'บรรลุเป้าหมาย' };
        if (direction === 'maintain' && Math.abs(value - target) <= target * 0.1) return { valid: true, message: 'อยู่ในเกณฑ์' };

        return { valid: true, message: 'ยังไม่บรรลุเป้าหมาย' };
    };

    const handleSaveAll = async () => {
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อนบันทึกข้อมูล');
            return;
        }

        setSaving(true);
        const period = `${parseInt(selectedYear) - 543}-${selectedMonth.padStart(2, '0')}`;

        try {
            for (const kpi of kpiList) {
                const kpiId = kpi.id as string;
                const value = parseFloat(formValues[kpiId]);
                if (isNaN(value)) continue;

                const existing = dataEntries.find(e => e.kpiId === kpiId);
                const entryData = {
                    kpiId: kpiId,
                    kpiCode: kpi.code as string,
                    kpiName: kpi.name as string,
                    unitId: user!.unitId,
                    cycleId: selectedCycle.id, // Add cycleId
                    period,
                    value,
                    target: kpi.targetValue as number,
                    status: 'draft' as const,
                };

                if (existing) {
                    await updateDoc(doc(db, 'kpi_data', existing.id), entryData);
                } else {
                    await addDoc(collection(db, 'kpi_data'), {
                        ...entryData,
                        createdAt: serverTimestamp(),
                    });
                }
            }

            toast.success('บันทึกข้อมูลสำเร็จ');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitAll = async () => {
        if (!confirm('ยืนยันการส่งข้อมูล? เมื่อส่งแล้วจะไม่สามารถแก้ไขได้')) return;

        setSaving(true);
        try {
            for (const entry of dataEntries) {
                await updateDoc(doc(db, 'kpi_data', entry.id), {
                    status: 'submitted',
                });
            }
            toast.success('ส่งข้อมูลสำเร็จ');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const filledCount = Object.values(formValues).filter(v => v !== '').length;
    const totalCount = kpiList.length;
    const completionRate = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <ClipboardEdit className="h-8 w-8 text-cyan-600" />
                            Data Collector
                        </h1>
                        <p className="text-muted-foreground">กรอกข้อมูล KPI รายเดือน (App 2.4)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-cyan-700 border-cyan-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Button variant="outline" onClick={handleSaveAll} disabled={saving || !selectedCycle}>
                            <Save className="h-4 w-4 mr-2" />
                            บันทึกร่าง
                        </Button>
                        <Button onClick={handleSubmitAll} disabled={saving || dataEntries.length === 0 || !selectedCycle}>
                            ส่งข้อมูล
                        </Button>
                    </div>
                </div>

                {/* Warning when no cycle selected */}
                {!selectedCycle && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-800">ยังไม่ได้เลือกรอบการประเมิน</p>
                                    <p className="text-sm text-yellow-700">กรุณาเลือกรอบการประเมินจาก Header ด้านบน หรือติดต่อ Admin เพื่อสร้างรอบการประเมินใหม่</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Period Selection */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Label>ปี พ.ศ.</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2568, 2569, 2570, 2571].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>เดือน</Label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m, idx) => (
                                            <SelectItem key={idx} value={(idx + 1).toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="ml-auto flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-cyan-600">{completionRate}%</div>
                                    <div className="text-xs text-muted-foreground">กรอกแล้ว {filledCount}/{totalCount}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Entry Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>กรอกข้อมูล KPI - {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : kpiList.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มี KPI - กรุณาสร้ใน KPI Dictionary ก่อน</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">รหัส</TableHead>
                                        <TableHead>ชื่อ KPI</TableHead>
                                        <TableHead className="w-[120px]">ค่าที่กรอก</TableHead>
                                        <TableHead className="w-[100px]">เป้าหมาย</TableHead>
                                        <TableHead className="w-[60px]">หน่วย</TableHead>
                                        <TableHead className="w-[150px]">สถานะ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kpiList.map((kpi) => {
                                        const kpiId = kpi.id as string;
                                        const kpiCode = kpi.code as string;
                                        const kpiName = kpi.name as string;
                                        const kpiDirection = kpi.direction as string;
                                        const kpiTargetValue = kpi.targetValue as number;
                                        const value = parseFloat(formValues[kpiId]);
                                        const validation = !isNaN(value) ? getValidationStatus(value, kpiTargetValue, kpiDirection) : null;
                                        const entry = dataEntries.find(e => e.kpiId === kpiId);

                                        return (
                                            <TableRow key={kpiId}>
                                                <TableCell className="font-mono font-medium">{kpiCode}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {kpiDirection === 'up' ? (
                                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                                        ) : kpiDirection === 'down' ? (
                                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                                        ) : null}
                                                        {kpiName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={formValues[kpiId]}
                                                        onChange={(e) => handleValueChange(kpiId, e.target.value)}
                                                        className="w-full"
                                                        disabled={entry?.status === 'submitted' || entry?.status === 'validated'}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{kpiTargetValue}</TableCell>
                                                <TableCell>{kpi.unit as string}</TableCell>
                                                <TableCell>
                                                    {entry?.status === 'submitted' ? (
                                                        <Badge className="bg-blue-100 text-blue-800">ส่งแล้ว</Badge>
                                                    ) : entry?.status === 'validated' ? (
                                                        <Badge className="bg-green-100 text-green-800">ตรวจสอบแล้ว</Badge>
                                                    ) : validation ? (
                                                        <Badge variant="outline" className={validation.valid ? 'text-green-600' : 'text-orange-600'}>
                                                            {validation.message}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
