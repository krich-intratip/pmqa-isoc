'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useAIConfigStore } from '@/stores/ai-config-store';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { InsightDashboard } from '@/components/insights/InsightDashboard';
import LeaderboardCard from '@/components/insights/LeaderboardCard';
import PredictiveScoreCard from '@/components/insights/PredictiveScoreCard';
import { Card, CardContent } from "@/components/ui/card";
// Alert components available if needed
import { Button } from "@/components/ui/button";
import { AlertTriangle, BrainCircuit, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AIInsightsPage() {
    const { user } = useAuthStore();
    const { selectedCycle, cycles } = useCycleStore();
    const { apiKey, selectedModel, loadConfig } = useAIConfigStore();

    const [loading, setLoading] = useState(true);
    const [sarContents, setSarContents] = useState<{ category: number; content: string }[]>([]);
    const [previousSarContents, setPreviousSarContents] = useState<{ category: number; content: string }[]>([]);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !selectedCycle) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Current Cycle Data
                const currentQ = query(
                    collection(db, 'sar_contents'),
                    where('unitId', '==', user.unitId),
                    where('cycleId', '==', selectedCycle.id)
                );

                const currentSnapshot = await getDocs(currentQ);
                const currentData = currentSnapshot.docs.map(doc => ({
                    category: doc.data().category,
                    content: doc.data().content as string
                }));
                currentData.sort((a, b) => a.category - b.category);
                setSarContents(currentData);

                // 2. Fetch Previous Cycle Data
                const previousCycle = cycles.find(c => Number(c.year) === Number(selectedCycle.year) - 1);

                if (previousCycle) {
                    const previousQ = query(
                        collection(db, 'sar_contents'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', previousCycle.id)
                    );
                    const prevSnapshot = await getDocs(previousQ);
                    const prevData = prevSnapshot.docs.map(doc => ({
                        category: doc.data().category,
                        content: doc.data().content as string
                    }));
                    prevData.sort((a, b) => a.category - b.category);
                    setPreviousSarContents(prevData);
                } else {
                    setPreviousSarContents([]);
                }

            } catch (error) {
                console.error("Error fetching SAR contents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, selectedCycle, cycles]);

    if (!selectedCycle) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto py-8">
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                            <AlertTriangle className="h-12 w-12 text-yellow-600" />
                            <div>
                                <h3 className="text-lg font-bold text-yellow-900">ยังไม่ได้เลือกรอบการประเมิน</h3>
                                <p className="text-yellow-700">กรุณาเลือกรอบการประเมิน (Cycle) จากเมนูด้านบนก่อนใช้งาน AI Insights</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    if (!apiKey) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto py-8">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center">
                                <BrainCircuit className="h-10 w-10 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">AI Configuration Required</h1>
                        <p className="text-slate-600 text-lg">
                            คุณยังไม่ได้ตั้งค่า API Key สำหรับ Google Gemini<br />
                            กรุณาไปที่หน้าตั้งค่าเพื่อระบุ API Key ก่อนเริ่มใช้งานฟีเจอร์นี้
                        </p>
                        <Link href="/settings/ai">
                            <Button size="lg" className="gap-2">
                                <Settings className="h-5 w-5" />
                                ไปยังหน้าตั้งค่า AI
                            </Button>
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                            <Link href="/dashboard" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <span>/</span>
                            <span>AI Insights</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                                AI Strategic Insights
                            </span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200">Beta</span>
                        </h1>
                        <p className="text-slate-600 mt-1">
                            วิเคราะห์ข้อมูล SAR และสังเคราะห์ข้อเสนอแนะเชิงกลยุทธ์ด้วย AI (Advanced Analysis)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-slate-900">{selectedCycle.name}</p>
                            <p className="text-xs text-slate-500">{sarContents.length} record(s) found</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Components */}
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                            <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Analysis (Left - 2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            <InsightDashboard
                                sarContents={sarContents}
                                previousSarContents={previousSarContents}
                                apiKey={apiKey}
                                modelId={selectedModel}
                            />
                        </div>

                        {/* Side Widgets (Right - 1 Col) */}
                        <div className="space-y-6">
                            <PredictiveScoreCard
                                scores={[
                                    { year: 2566, score: 280 },
                                    { year: 2567, score: 320 },
                                    { year: 2568, score: 350 }, // Mock data (replace with actual fetch)
                                ]}
                            />
                            <LeaderboardCard />
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
