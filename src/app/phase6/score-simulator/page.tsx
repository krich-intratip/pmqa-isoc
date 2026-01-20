'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryScore {
    category: number;
    name: string;
    weight: number;
    processScore: number;
    resultScore: number;
    totalScore: number;
    maxScore: number;
    improvement: number;
}

const PMQA_STRUCTURE = [
    { category: 1, name: 'การนำองค์กร', weight: 12, hasResult: false },
    { category: 2, name: 'การวางแผนเชิงกลยุทธ์', weight: 8, hasResult: false },
    { category: 3, name: 'ผู้รับบริการและผู้มีส่วนได้ส่วนเสีย', weight: 8, hasResult: false },
    { category: 4, name: 'การวัด วิเคราะห์ และจัดการความรู้', weight: 9, hasResult: false },
    { category: 5, name: 'การบริหารทรัพยากรบุคคล', weight: 9, hasResult: false },
    { category: 6, name: 'การจัดการกระบวนการ', weight: 9, hasResult: false },
    { category: 7, name: 'ผลลัพธ์', weight: 45, hasResult: true },
];

export default function ScoreSimulatorPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [scores, setScores] = useState<CategoryScore[]>([]);
    const [targetTotalScore, setTargetTotalScore] = useState(350);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        // Initialize with default scores
        const initialScores: CategoryScore[] = PMQA_STRUCTURE.map(cat => ({
            category: cat.category,
            name: cat.name,
            weight: cat.weight,
            processScore: cat.hasResult ? 0 : 50,
            resultScore: cat.hasResult ? 50 : 0,
            totalScore: 50,
            maxScore: cat.weight * 10, // 10 points per percent weight
            improvement: 0,
        }));
        setScores(initialScores);
    }, []);

    const updateScore = (category: number, field: 'processScore' | 'resultScore', value: number) => {
        setScores(prev => prev.map(s => {
            if (s.category === category) {
                const updated = { ...s, [field]: value };
                const cat = PMQA_STRUCTURE.find(c => c.category === category);
                if (cat?.hasResult) {
                    updated.totalScore = updated.resultScore;
                } else {
                    updated.totalScore = updated.processScore;
                }
                updated.improvement = Math.round((updated.totalScore / 100) * updated.maxScore);
                return updated;
            }
            return s;
        }));
    };

    const calculateTotalScore = () => {
        return scores.reduce((sum, s) => {
            const categoryScore = (s.totalScore / 100) * s.maxScore;
            return sum + categoryScore;
        }, 0);
    };

    const getGapToTarget = () => {
        const current = calculateTotalScore();
        return targetTotalScore - current;
    };

    const getRecommendations = () => {
        const recommendations: { category: string; action: string; impact: number }[] = [];

        scores.forEach(s => {
            if (s.totalScore < 60) {
                const potentialGain = ((80 - s.totalScore) / 100) * s.maxScore;
                recommendations.push({
                    category: `หมวด ${s.category}`,
                    action: s.totalScore < 40
                        ? 'ต้องเร่งดำเนินการปรับปรุงเร่งด่วน'
                        : 'ควรพัฒนาให้ถึงระดับมาตรฐาน',
                    impact: Math.round(potentialGain),
                });
            }
        });

        return recommendations.sort((a, b) => b.impact - a.impact).slice(0, 5);
    };

    const totalScore = Math.round(calculateTotalScore());
    const gap = Math.round(getGapToTarget());
    const recommendations = getRecommendations();
    const passThreshold = 350;
    const isPassingScore = totalScore >= passThreshold;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Calculator className="h-8 w-8 text-teal-600" />
                            Score Simulator & Fix Planner
                        </h1>
                        <p className="text-muted-foreground">จำลองคะแนนและวางแผนปรับปรุง (App 6.2)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-teal-700 border-teal-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">เป้าหมาย</div>
                            <Input
                                type="number"
                                value={targetTotalScore}
                                onChange={(e) => setTargetTotalScore(Number(e.target.value))}
                                className="w-24 text-right"
                            />
                        </div>
                    </div>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className={`border-l-4 ${isPassingScore ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-4xl font-bold">{totalScore}</div>
                                    <div className="text-sm text-muted-foreground">คะแนนรวม (จาก 500)</div>
                                </div>
                                {isPassingScore ? (
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-12 w-12 text-red-500" />
                                )}
                            </div>
                            <Progress value={(totalScore / 500) * 100} className="mt-4" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className={`text-4xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {gap > 0 ? `+${gap}` : gap}
                                    </div>
                                    <div className="text-sm text-muted-foreground">คะแนนที่ต้องเพิ่ม</div>
                                </div>
                                <Target className="h-12 w-12 text-blue-500" />
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                เป้าหมาย: {targetTotalScore} คะแนน
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-4xl font-bold">{Math.round((totalScore / 500) * 100)}%</div>
                                    <div className="text-sm text-muted-foreground">ความสำเร็จ</div>
                                </div>
                                <TrendingUp className="h-12 w-12 text-purple-500" />
                            </div>
                            <Badge className={`mt-2 ${isPassingScore ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                {isPassingScore ? 'ผ่านเกณฑ์' : 'ยังไม่ผ่าน'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Input */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>ปรับคะแนนรายหมวด</CardTitle>
                                <CardDescription>ใช้ slider เพื่อจำลองคะแนนแต่ละหมวด (0-100%)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>หมวด</TableHead>
                                            <TableHead className="w-[100px]">น้ำหนัก</TableHead>
                                            <TableHead>คะแนน (%)</TableHead>
                                            <TableHead className="text-right">คะแนนที่ได้</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {scores.map((s) => (
                                            <TableRow key={s.category}>
                                                <TableCell className="font-medium">
                                                    <div>{s.name}</div>
                                                    <div className="text-xs text-muted-foreground">หมวด {s.category}</div>
                                                </TableCell>
                                                <TableCell>{s.weight}%</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <Slider
                                                            value={[s.totalScore]}
                                                            onValueChange={(v: number[]) => updateScore(s.category, s.category === 7 ? 'resultScore' : 'processScore', v[0])}
                                                            max={100}
                                                            step={5}
                                                            className="w-32"
                                                        />
                                                        <span className="text-sm font-medium w-12">{s.totalScore}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {Math.round((s.totalScore / 100) * s.maxScore)} / {s.maxScore}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    ข้อเสนอแนะ
                                </CardTitle>
                                <CardDescription>จุดที่ควรปรับปรุงเพื่อเพิ่มคะแนน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recommendations.length === 0 ? (
                                    <div className="text-center py-8 text-green-600">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                                        <p className="font-medium">คะแนนดีทุกหมวด!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recommendations.map((rec, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
                                                <div className="flex justify-between items-start mb-1">
                                                    <Badge variant="outline">{rec.category}</Badge>
                                                    <span className="text-xs text-green-600 font-medium">+{rec.impact} คะแนน</span>
                                                </div>
                                                <p className="text-sm text-slate-600">{rec.action}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="mt-4 border-blue-200 bg-blue-50">
                            <CardContent className="pt-4">
                                <div className="text-sm">
                                    <div className="font-semibold text-blue-900 mb-2">💡 เกณฑ์ PMQA 4.0</div>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• ผ่านพื้นฐาน: 350 คะแนน</li>
                                        <li>• ผ่านก้าวหน้า: 400 คะแนน</li>
                                        <li>• หมวด 7 มีน้ำหนัก 45%</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
