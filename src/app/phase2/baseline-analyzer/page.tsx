'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, TrendingUp, TrendingDown, Minus, BarChart2, Target } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

interface BaselineAnalysis {
    kpiId: string;
    kpiCode: string;
    kpiName: string;
    unit: string;
    direction: 'up' | 'down' | 'maintain';
    baselineValue: number;
    targetValue: number;
    currentValue: number;
    trend: 'improving' | 'declining' | 'stable';
    gapToTarget: number;
    gapPercentage: number;
    recommendation: string;
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

export default function BaselineAnalyzerPage() {
    const { user } = useAuthStore();
    const [analysis, setAnalysis] = useState<BaselineAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchAndAnalyze = async () => {
        if (!user?.unitId) return;
        setLoading(true);

        try {
            // Fetch KPI definitions
            const kpiQ = query(collection(db, 'kpi_definitions'), where('unitId', '==', user.unitId));
            const kpiSnap = await getDocs(kpiQ);
            const kpis: any[] = [];
            kpiSnap.forEach(d => kpis.push({ id: d.id, ...d.data() }));

            // Fetch KPI data
            const dataQ = query(collection(db, 'kpi_data'), where('unitId', '==', user.unitId));
            const dataSnap = await getDocs(dataQ);
            const allData: any[] = [];
            dataSnap.forEach(d => allData.push({ id: d.id, ...d.data() }));

            // Analyze each KPI
            const results: BaselineAnalysis[] = kpis.map(kpi => {
                const kpiData = allData.filter(d => d.kpiId === kpi.id).sort((a, b) => a.period.localeCompare(b.period));
                const latestData = kpiData[kpiData.length - 1];
                const currentValue = latestData?.value || kpi.baselineValue;

                // Calculate trend
                let trend: 'improving' | 'declining' | 'stable' = 'stable';
                if (kpiData.length >= 2) {
                    const lastTwo = kpiData.slice(-2);
                    const diff = lastTwo[1].value - lastTwo[0].value;
                    if (kpi.direction === 'up') {
                        trend = diff > 0 ? 'improving' : diff < 0 ? 'declining' : 'stable';
                    } else if (kpi.direction === 'down') {
                        trend = diff < 0 ? 'improving' : diff > 0 ? 'declining' : 'stable';
                    } else {
                        trend = Math.abs(diff) < kpi.targetValue * 0.05 ? 'stable' : 'declining';
                    }
                }

                // Calculate gap
                const gapToTarget = kpi.direction === 'down'
                    ? currentValue - kpi.targetValue
                    : kpi.targetValue - currentValue;
                const gapPercentage = kpi.targetValue !== 0
                    ? Math.abs(gapToTarget / kpi.targetValue) * 100
                    : 0;

                // Generate recommendation
                let recommendation = '';
                if (gapPercentage <= 10) {
                    recommendation = 'ใกล้บรรลุเป้าหมาย - รักษาระดับการดำเนินงาน';
                } else if (gapPercentage <= 30) {
                    recommendation = 'ต้องเร่งดำเนินการเพิ่มเติม';
                } else {
                    recommendation = 'ต้องทบทวนแผนและมาตรการอย่างเร่งด่วน';
                }

                return {
                    kpiId: kpi.id,
                    kpiCode: kpi.code,
                    kpiName: kpi.name,
                    unit: kpi.unit,
                    direction: kpi.direction,
                    baselineValue: kpi.baselineValue,
                    targetValue: kpi.targetValue,
                    currentValue,
                    trend,
                    gapToTarget,
                    gapPercentage,
                    recommendation,
                };
            });

            setAnalysis(results);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAndAnalyze();
    }, [user]);

    const filteredAnalysis = selectedCategory === 'all'
        ? analysis
        : analysis.filter(a => a.kpiCode.startsWith(selectedCategory));

    const getTrendIcon = (trend: string, direction: string) => {
        if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-green-600" />;
        if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-600" />;
        return <Minus className="h-5 w-5 text-yellow-600" />;
    };

    const getProgressColor = (gapPercentage: number) => {
        if (gapPercentage <= 10) return 'bg-green-500';
        if (gapPercentage <= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const improvingCount = analysis.filter(a => a.trend === 'improving').length;
    const onTargetCount = analysis.filter(a => a.gapPercentage <= 10).length;
    const atRiskCount = analysis.filter(a => a.gapPercentage > 30).length;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <LineChart className="h-8 w-8 text-emerald-600" />
                            Results Baseline Analyzer
                        </h1>
                        <p className="text-muted-foreground">วิเคราะห์ผลลัพธ์เทียบกับ Baseline (App 2.6)</p>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="ทุกหมวด" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกหมวด</SelectItem>
                            {PMQA_CATEGORIES.map(cat => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-600">{analysis.length}</div>
                            <div className="text-sm text-muted-foreground">KPI ทั้งหมด</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-600">{onTargetCount}</div>
                            <div className="text-sm text-muted-foreground">ใกล้เป้าหมาย</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-emerald-600">{improvingCount}</div>
                            <div className="text-sm text-muted-foreground">แนวโน้มดีขึ้น</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-red-600">{atRiskCount}</div>
                            <div className="text-sm text-muted-foreground">ต้องเร่งดำเนินการ</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5" />
                            ผลการวิเคราะห์ ({filteredAnalysis.length} KPIs)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังวิเคราะห์...</div>
                        ) : analysis.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p>ไม่พบข้อมูล KPI - กรุณาสร้าง KPI ใน KPI Dictionary ก่อน</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">รหัส</TableHead>
                                        <TableHead>ชื่อ KPI</TableHead>
                                        <TableHead className="w-[80px]">Baseline</TableHead>
                                        <TableHead className="w-[80px]">ปัจจุบัน</TableHead>
                                        <TableHead className="w-[80px]">เป้าหมาย</TableHead>
                                        <TableHead className="w-[80px]">แนวโน้ม</TableHead>
                                        <TableHead className="w-[150px]">ระยะห่าง</TableHead>
                                        <TableHead>คำแนะนำ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAnalysis.map((item) => (
                                        <TableRow key={item.kpiId}>
                                            <TableCell className="font-mono font-medium">{item.kpiCode}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {item.direction === 'up' ? (
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    ) : item.direction === 'down' ? (
                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <Minus className="h-4 w-4 text-yellow-600" />
                                                    )}
                                                    <span className="truncate max-w-[200px]">{item.kpiName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.baselineValue} {item.unit}</TableCell>
                                            <TableCell className="text-right font-medium">{item.currentValue} {item.unit}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">{item.targetValue} {item.unit}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getTrendIcon(item.trend, item.direction)}
                                                    <span className="text-xs capitalize">{item.trend}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Gap: {item.gapPercentage.toFixed(1)}%</span>
                                                    </div>
                                                    <Progress value={Math.max(0, 100 - item.gapPercentage)} className="h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{item.recommendation}</TableCell>
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
