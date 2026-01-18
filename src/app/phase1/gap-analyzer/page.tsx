'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, XCircle, FileQuestion, BarChart3 } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Evidence } from '@/types/database';

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1: การนำองค์การ', requiredCriteria: ['1.1', '1.2', '1.3', '1.4'] },
    { id: 2, name: 'หมวด 2: การวางแผนเชิงยุทธศาสตร์', requiredCriteria: ['2.1', '2.2'] },
    { id: 3, name: 'หมวด 3: การให้ความสำคัญกับผู้รับบริการ', requiredCriteria: ['3.1', '3.2'] },
    { id: 4, name: 'หมวด 4: การวัด วิเคราะห์ และจัดการความรู้', requiredCriteria: ['4.1', '4.2'] },
    { id: 5, name: 'หมวด 5: การมุ่งเน้นบุคลากร', requiredCriteria: ['5.1', '5.2'] },
    { id: 6, name: 'หมวด 6: การมุ่งเน้นระบบปฏิบัติการ', requiredCriteria: ['6.1', '6.2'] },
    { id: 7, name: 'หมวด 7: ผลลัพธ์การดำเนินการ', requiredCriteria: ['7.1', '7.2', '7.3', '7.4'] },
];

interface GapAnalysis {
    categoryId: number;
    categoryName: string;
    totalRequired: number;
    totalSubmitted: number;
    verified: number;
    pending: number;
    gaps: string[];
    completionRate: number;
}

export default function EvidenceGapAnalyzerPage() {
    const { user } = useAuthStore();
    const [analysis, setAnalysis] = useState<GapAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [overallStats, setOverallStats] = useState({ total: 0, submitted: 0, verified: 0, gaps: 0 });

    useEffect(() => {
        const analyzeGaps = async () => {
            if (!user?.unitId) return;
            setLoading(true);

            try {
                // Fetch all evidence for this unit
                const q = query(collection(db, 'evidence'), where('unitId', '==', user.unitId));
                const snap = await getDocs(q);
                const evidenceList: Evidence[] = [];
                snap.forEach(d => evidenceList.push({ id: d.id, ...d.data() } as Evidence));

                // Analyze each category
                const results: GapAnalysis[] = PMQA_CATEGORIES.map(cat => {
                    const catEvidence = evidenceList.filter(e => e.categoryId === cat.id);
                    const submittedCriteria = [...new Set(catEvidence.map(e => e.criteriaId.split(' ')[0]))]; // Get base criteria ID
                    const verifiedCount = catEvidence.filter(e => e.verificationStatus === 'verified').length;
                    const pendingCount = catEvidence.filter(e => e.verificationStatus === 'pending').length;

                    // Find gaps (required criteria without evidence)
                    const gaps = cat.requiredCriteria.filter(req =>
                        !submittedCriteria.some(sub => sub.startsWith(req))
                    );

                    const completionRate = cat.requiredCriteria.length > 0
                        ? Math.round(((cat.requiredCriteria.length - gaps.length) / cat.requiredCriteria.length) * 100)
                        : 0;

                    return {
                        categoryId: cat.id,
                        categoryName: cat.name,
                        totalRequired: cat.requiredCriteria.length,
                        totalSubmitted: catEvidence.length,
                        verified: verifiedCount,
                        pending: pendingCount,
                        gaps,
                        completionRate,
                    };
                });

                setAnalysis(results);

                // Calculate overall stats
                const totalRequired = results.reduce((sum, r) => sum + r.totalRequired, 0);
                const totalSubmitted = results.reduce((sum, r) => sum + r.totalSubmitted, 0);
                const totalVerified = results.reduce((sum, r) => sum + r.verified, 0);
                const totalGaps = results.reduce((sum, r) => sum + r.gaps.length, 0);
                setOverallStats({ total: totalRequired, submitted: totalSubmitted, verified: totalVerified, gaps: totalGaps });

            } catch (error) {
                console.error('Gap analysis error:', error);
            } finally {
                setLoading(false);
            }
        };

        analyzeGaps();
    }, [user]);

    const getStatusColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    Evidence Gap Analyzer
                </h1>
                <p className="text-muted-foreground mb-6">วิเคราะห์ช่องว่างหลักฐานตามเกณฑ์ PMQA (Phase 1.2)</p>

                {/* Overall Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{overallStats.total}</div>
                            <div className="text-sm text-muted-foreground">เกณฑ์ที่ต้องมี</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-indigo-600">{overallStats.submitted}</div>
                            <div className="text-sm text-muted-foreground">หลักฐานที่ส่ง</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{overallStats.verified}</div>
                            <div className="text-sm text-muted-foreground">ผ่านการตรวจสอบ</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{overallStats.gaps}</div>
                            <div className="text-sm text-muted-foreground">ช่องว่าง (Gaps)</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Analysis */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-8">กำลังวิเคราะห์...</div>
                    ) : (
                        analysis.map((cat) => (
                            <Card key={cat.categoryId} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{cat.categoryName}</CardTitle>
                                        <Badge className={`${getStatusColor(cat.completionRate)} text-white`}>
                                            {cat.completionRate}%
                                        </Badge>
                                    </div>
                                    <Progress value={cat.completionRate} className="h-2 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <FileQuestion className="h-4 w-4 text-blue-500" />
                                            <span>ต้องมี: {cat.totalRequired}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>ผ่าน: {cat.verified}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            <span>รอตรวจ: {cat.pending}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span>ขาด: {cat.gaps.length}</span>
                                        </div>
                                    </div>

                                    {cat.gaps.length > 0 && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <div className="text-sm font-medium text-red-700 mb-1">เกณฑ์ที่ยังไม่มีหลักฐาน:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.gaps.map(gap => (
                                                    <Badge key={gap} variant="outline" className="text-red-600 border-red-200">
                                                        {gap}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
