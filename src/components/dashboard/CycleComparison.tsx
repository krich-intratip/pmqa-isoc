'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Loader2 } from 'lucide-react';
import { useCycleStore } from '@/stores/cycle-store';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface CycleStats {
    evidenceCount: number;
    verifiedCount: number;
    kpiDataCount: number;
    sarContentsCount: number;
    risksCount: number;
    qaCount: number;
}

interface ComparisonItem {
    label: string;
    current: number;
    previous: number;
    unit?: string;
}

export function CycleComparison() {
    const { user } = useAuthStore();
    const { cycles, selectedCycle } = useCycleStore();
    const [compareCycleId, setCompareCycleId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [currentStats, setCurrentStats] = useState<CycleStats | null>(null);
    const [compareStats, setCompareStats] = useState<CycleStats | null>(null);

    // Get available cycles for comparison (excluding current)
    const availableCycles = cycles.filter(c => c.id !== selectedCycle?.id);

    // Fetch stats for a specific cycle
    const fetchCycleStats = async (cycleId: string): Promise<CycleStats> => {
        if (!user?.unitId) return { evidenceCount: 0, verifiedCount: 0, kpiDataCount: 0, sarContentsCount: 0, risksCount: 0, qaCount: 0 };

        const stats: CycleStats = { evidenceCount: 0, verifiedCount: 0, kpiDataCount: 0, sarContentsCount: 0, risksCount: 0, qaCount: 0 };

        try {
            // Evidence
            const evidenceQuery = query(collection(db, 'evidence'), where('unitId', '==', user.unitId), where('cycleId', '==', cycleId));
            const evidenceSnap = await getDocs(evidenceQuery);
            stats.evidenceCount = evidenceSnap.size;
            evidenceSnap.forEach(doc => {
                if (doc.data().verificationStatus === 'verified') stats.verifiedCount++;
            });

            // KPI Data
            const kpiQuery = query(collection(db, 'kpi_data'), where('unitId', '==', user.unitId), where('cycleId', '==', cycleId));
            const kpiSnap = await getDocs(kpiQuery);
            stats.kpiDataCount = kpiSnap.size;

            // SAR Contents
            const sarQuery = query(collection(db, 'sar_contents'), where('unitId', '==', user.unitId), where('cycleId', '==', cycleId));
            const sarSnap = await getDocs(sarQuery);
            stats.sarContentsCount = sarSnap.size;

            // Risks
            const risksQuery = query(collection(db, 'risks'), where('unitId', '==', user.unitId), where('cycleId', '==', cycleId));
            const risksSnap = await getDocs(risksQuery);
            stats.risksCount = risksSnap.size;

            // Q&A Bank
            const qaQuery = query(collection(db, 'qa_bank'), where('unitId', '==', user.unitId), where('cycleId', '==', cycleId));
            const qaSnap = await getDocs(qaQuery);
            stats.qaCount = qaSnap.size;
        } catch (error) {
            console.error('Error fetching cycle stats:', error);
        }

        return stats;
    };

    // Fetch current cycle stats
    useEffect(() => {
        if (selectedCycle?.id && user?.unitId) {
            fetchCycleStats(selectedCycle.id).then(setCurrentStats);
        }
    }, [selectedCycle?.id, user?.unitId]);

    // Fetch comparison cycle stats
    useEffect(() => {
        if (compareCycleId && user?.unitId) {
            setLoading(true);
            fetchCycleStats(compareCycleId).then(stats => {
                setCompareStats(stats);
                setLoading(false);
            });
        } else {
            setCompareStats(null);
        }
    }, [compareCycleId, user?.unitId]);

    // Calculate comparison items
    const comparisons: ComparisonItem[] = currentStats && compareStats ? [
        { label: 'หลักฐาน', current: currentStats.evidenceCount, previous: compareStats.evidenceCount, unit: 'รายการ' },
        { label: 'ผ่านตรวจสอบ', current: currentStats.verifiedCount, previous: compareStats.verifiedCount, unit: 'รายการ' },
        { label: 'ข้อมูล KPI', current: currentStats.kpiDataCount, previous: compareStats.kpiDataCount, unit: 'รายการ' },
        { label: 'เนื้อหา SAR', current: currentStats.sarContentsCount, previous: compareStats.sarContentsCount, unit: 'รายการ' },
        { label: 'ความเสี่ยง', current: currentStats.risksCount, previous: compareStats.risksCount, unit: 'รายการ' },
        { label: 'คำถาม-คำตอบ', current: currentStats.qaCount, previous: compareStats.qaCount, unit: 'รายการ' },
    ] : [];

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendBadge = (current: number, previous: number) => {
        const diff = current - previous;
        const percent = previous > 0 ? Math.round((diff / previous) * 100) : (diff > 0 ? 100 : 0);

        if (diff > 0) return <Badge className="bg-green-100 text-green-700">+{diff} ({percent > 0 ? `+${percent}%` : '0%'})</Badge>;
        if (diff < 0) return <Badge className="bg-red-100 text-red-700">{diff} ({percent}%)</Badge>;
        return <Badge variant="outline">ไม่เปลี่ยนแปลง</Badge>;
    };

    if (!selectedCycle) return null;
    if (availableCycles.length === 0) return null;

    return (
        <Card className="border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    เปรียบเทียบรอบการประเมิน
                </CardTitle>
                <CardDescription className="flex items-center gap-3 flex-wrap">
                    <span>รอบปัจจุบัน: <strong>{selectedCycle.name || selectedCycle.year}</strong></span>
                    <span>เปรียบเทียบกับ:</span>
                    <Select value={compareCycleId} onValueChange={setCompareCycleId}>
                        <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="เลือกรอบ" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCycles.map(cycle => (
                                <SelectItem key={cycle.id} value={cycle.id}>
                                    {cycle.name || cycle.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : compareStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {comparisons.map((item, idx) => (
                            <div key={idx} className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    {getTrendIcon(item.current, item.previous)}
                                    <span className="text-xl font-bold">{item.current}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">
                                    เทียบกับ {item.previous} {item.unit}
                                </div>
                                {getTrendBadge(item.current, item.previous)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        เลือกรอบการประเมินเพื่อเปรียบเทียบข้อมูล
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
