'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, TrendingDown, Download, FileSpreadsheet, Package, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

interface KPIData {
    id: string;
    kpiCode: string;
    kpiName: string;
    category: string;
    baseline: number;
    target: number;
    current: number;
    unit: string;
    direction: 'up' | 'down' | 'maintain';
    trend: 'improving' | 'declining' | 'stable';
    achievement: number;
}

const RESULT_CATEGORIES = [
    { id: '7.1', name: 'ผลผลิตและผลลัพธ์', description: 'ผลการดำเนินงานตามพันธกิจ' },
    { id: '7.2', name: 'ผู้รับบริการและผู้มีส่วนได้ส่วนเสีย', description: 'ความพึงพอใจและการมีส่วนร่วม' },
    { id: '7.3', name: 'บุคลากร', description: 'ผลการพัฒนาบุคลากรและความผูกพัน' },
    { id: '7.4', name: 'ความเป็นผู้นำและการกำกับดูแล', description: 'ผลด้านการนำองค์กร' },
    { id: '7.5', name: 'งบประมาณ การเงิน และตลาด', description: 'ผลด้านการเงินและทรัพยากร' },
];

export default function ResultsDataPackPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState<KPIData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('7.1');

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        fetchKPIData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.unitId, selectedCycle]);

    const fetchKPIData = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            setKpiData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch KPI definitions with cycle filter
            const kpiQ = query(
                collection(db, 'kpi_definitions'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id)
            );
            const kpiSnap = await getDocs(kpiQ);
            const kpiDefs: Array<Record<string, unknown> & { id: string }> = [];
            kpiSnap.forEach(d => kpiDefs.push({ id: d.id, ...d.data() }));

            // Fetch actual data
            const dataQ = query(collection(db, 'kpi_data'), where('unitId', '==', user.unitId));
            const dataSnap = await getDocs(dataQ);
            const dataMap = new Map<string, Record<string, unknown>>();
            dataSnap.forEach(d => {
                const data = d.data();
                const key = data.kpiId;
                const existing = dataMap.get(key);
                if (!existing || (data.period && existing.period && data.period > existing.period)) {
                    dataMap.set(key, data);
                }
            });

            // Combine and calculate
            const combined: KPIData[] = kpiDefs.map(kpi => {
                const latestData = dataMap.get(kpi.id);
                const current = typeof latestData?.value === 'number' ? latestData.value : 0;
                const baseline = typeof kpi.baseline === 'number' ? kpi.baseline : 0;
                const target = typeof kpi.target === 'number' ? kpi.target : 0;

                // Calculate achievement
                let achievement = 0;
                if (kpi.direction === 'up' && target > baseline) {
                    achievement = ((current - baseline) / (target - baseline)) * 100;
                } else if (kpi.direction === 'down' && baseline > target) {
                    achievement = ((baseline - current) / (baseline - target)) * 100;
                } else if (kpi.direction === 'maintain') {
                    const tolerance = baseline * 0.05;
                    achievement = Math.abs(current - baseline) <= tolerance ? 100 : 50;
                }
                achievement = Math.max(0, Math.min(100, achievement));

                // Determine trend
                let trend: 'improving' | 'declining' | 'stable' = 'stable';
                if (kpi.direction === 'up') {
                    trend = current > baseline ? 'improving' : current < baseline ? 'declining' : 'stable';
                } else if (kpi.direction === 'down') {
                    trend = current < baseline ? 'improving' : current > baseline ? 'declining' : 'stable';
                }

                return {
                    id: kpi.id,
                    kpiCode: typeof kpi.code === 'string' ? kpi.code : '',
                    kpiName: typeof kpi.name === 'string' ? kpi.name : '',
                    category: typeof kpi.pmqaCategory === 'string' ? kpi.pmqaCategory : '7.1',
                    baseline,
                    target,
                    current,
                    unit: typeof kpi.unit === 'string' ? kpi.unit : '',
                    direction: kpi.direction as 'up' | 'down' | 'maintain',
                    trend,
                    achievement: Math.round(achievement),
                };
            });

            setKpiData(combined);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const filtered = kpiData.filter(k => k.category === selectedCategory);
        if (filtered.length === 0) {
            toast.error('ไม่มีข้อมูลในหมวดนี้');
            return;
        }

        const headers = ['รหัส KPI', 'ชื่อ KPI', 'Baseline', 'เป้าหมาย', 'ผลปัจจุบัน', 'หน่วย', 'ทิศทาง', 'แนวโน้ม', 'ความสำเร็จ (%)'];
        const rows = filtered.map(k => [
            k.kpiCode,
            k.kpiName,
            k.baseline,
            k.target,
            k.current,
            k.unit,
            k.direction === 'up' ? 'เพิ่มขึ้น' : k.direction === 'down' ? 'ลดลง' : 'คงที่',
            k.trend === 'improving' ? 'ดีขึ้น' : k.trend === 'declining' ? 'แย่ลง' : 'คงที่',
            k.achievement,
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Results_${selectedCategory.replace('.', '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('ส่งออกข้อมูลสำเร็จ');
    };

    const filteredData = kpiData.filter(k => k.category === selectedCategory);
    const avgAchievement = filteredData.length > 0
        ? Math.round(filteredData.reduce((sum, k) => sum + k.achievement, 0) / filteredData.length)
        : 0;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Package className="h-8 w-8 text-emerald-600" />
                            Results Data Pack Builder
                        </h1>
                        <p className="text-muted-foreground">รวบรวมผลลัพธ์หมวด 7 (App 5.1)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Button onClick={exportToCSV} className="gap-2" disabled={!selectedCycle}>
                            <Download className="h-4 w-4" />
                            ส่งออก CSV
                        </Button>
                    </div>
                </div>

                {/* Warning if no cycle selected */}
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

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {RESULT_CATEGORIES.map(cat => (
                        <Card
                            key={cat.id}
                            className={`cursor-pointer transition-all ${selectedCategory === cat.id
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'hover:border-slate-300'
                                }`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <div className="font-semibold text-sm mb-1">{cat.id}</div>
                                    <div className="text-xs text-muted-foreground">{cat.name}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{filteredData.length}</div>
                            <div className="text-sm text-muted-foreground">ตัวชี้วัดทั้งหมด</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-600">{avgAchievement}%</div>
                            <div className="text-sm text-muted-foreground">ความสำเร็จเฉลี่ย</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-600">
                                {filteredData.filter(k => k.trend === 'improving').length}
                            </div>
                            <div className="text-sm text-muted-foreground">แนวโน้มดีขึ้น</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-red-600">
                                {filteredData.filter(k => k.trend === 'declining').length}
                            </div>
                            <div className="text-sm text-muted-foreground">ต้องปรับปรุง</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            {RESULT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                        </CardTitle>
                        <CardDescription>
                            {RESULT_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p>ยังไม่มีข้อมูล KPI ในหมวดนี้</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">รหัส</TableHead>
                                        <TableHead>ตัวชี้วัด</TableHead>
                                        <TableHead className="text-center">Baseline</TableHead>
                                        <TableHead className="text-center">เป้าหมาย</TableHead>
                                        <TableHead className="text-center">ผลปัจจุบัน</TableHead>
                                        <TableHead className="text-center">แนวโน้ม</TableHead>
                                        <TableHead>ความสำเร็จ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono">{item.kpiCode}</TableCell>
                                            <TableCell className="font-medium">{item.kpiName}</TableCell>
                                            <TableCell className="text-center">{item.baseline.toLocaleString()} {item.unit}</TableCell>
                                            <TableCell className="text-center">{item.target.toLocaleString()} {item.unit}</TableCell>
                                            <TableCell className="text-center font-semibold">{item.current.toLocaleString()} {item.unit}</TableCell>
                                            <TableCell className="text-center">
                                                {item.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600 inline" />}
                                                {item.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600 inline" />}
                                                {item.trend === 'stable' && <span className="text-slate-400">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={item.achievement} className="w-20" />
                                                    <span className="text-sm font-medium w-12">{item.achievement}%</span>
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
