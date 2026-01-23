'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    Users, Settings, Map, Calendar as CalendarIcon, FileText, CheckCircle2,
    BarChart3, ShieldCheck, FolderPlus, ClipboardCheck, Database,
    BookOpen, FileSpreadsheet, ClipboardEdit, Sparkles, LineChart,
    AlertTriangle, GitBranch, PenTool, Package, Calculator,
    Presentation, HelpCircle, Calendar, UserCog, Activity, MapPin, Loader2,
    LayoutDashboard, UserCheck, FileSearch, Megaphone, Download
} from 'lucide-react';
import {
    canManageUsers,
    canApproveEvidence,
    shouldShowAdminTabs,
    getAvailablePhaseTools
} from '@/lib/auth/role-helper';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { AnnouncementCards } from '@/components/dashboard/AnnouncementCards';
import { AnnouncementManager } from '@/components/dashboard/AnnouncementManager';
import { CycleComparison } from '@/components/dashboard/CycleComparison';
import { exportDashboardSummary, exportDashboardHTML } from '@/lib/export/data-export';
import { OnlineUsersSidebar } from '@/components/presence/OnlineUsersSidebar';
import OnlineUsersButton from '@/components/collaboration/OnlineUsersButton';
import { OnboardingTour, TourStep } from '@/components/onboarding/OnboardingTour';

const TOUR_STEPS: TourStep[] = [
    { targetId: 'dashboard-stats', title: 'ภาพรวมสถานะ', content: 'ดูสถานะความคืบหน้าของงานทั้งหมด และตรวจสอบ KPI ที่สำคัญ', position: 'bottom' },
    { targetId: 'dashboard-phase-progress', title: 'ความคืบหน้าตามขั้นตอน', content: 'ติดตามความคืบหน้าของแต่ละเฟส (Phase 1-7) อย่างละเอียด', position: 'top' },
    { targetId: 'dashboard-comparison', title: 'เปรียบเทียบผลการประเมิน', content: 'กราฟเปรียบเทียบผลลัพธ์กับรอบปีที่ผ่านมา', position: 'top' },
    { targetId: 'dashboard-phase-tools', title: 'เครื่องมือการทำงาน', content: 'เข้าถึงเครื่องมือสำหรับแต่ละเฟสการทำงาน', position: 'top' },
    { targetId: 'dashboard-ai-card', title: 'AI Strategic Insights', content: 'ใช้ AI ช่วยวิเคราะห์จุดแข็ง จุดอ่อน และแนวโน้มผลการดำเนินงาน', position: 'left' }
];

export default function Dashboard() {
    const { user, loading, initialize } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const router = useRouter();

    // Dashboard Stats State
    const [statsLoading, setStatsLoading] = useState(true);
    const [evidenceCount, setEvidenceCount] = useState(0);
    const [categoryProgress, setCategoryProgress] = useState(0);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [kpiDataCount, setKpiDataCount] = useState(0);
    const [kpiDefinitionsCount, setKpiDefinitionsCount] = useState(0);
    const [pendingUsersCount, setPendingUsersCount] = useState(0);
    // New stats
    const [sarContentsCount, setSarContentsCount] = useState(0);
    const [risksCount, setRisksCount] = useState(0);
    const [qaCount, setQaCount] = useState(0);
    const [strategyLinksCount, setStrategyLinksCount] = useState(0);
    const [contextPackExists, setContextPackExists] = useState(false);
    // Unit information
    const [unitName, setUnitName] = useState<string>('');
    const [unitCategory, setUnitCategory] = useState<string>('');

    // Role-based permissions (memoized to prevent recalculation)
    const isReviewer = useMemo(() =>
        user ? canApproveEvidence(user.role) : false,
        [user]
    );
    const showAdminTabs = useMemo(() =>
        user ? shouldShowAdminTabs(user.role) : false,
        [user]
    );
    const availablePhases = useMemo(() =>
        user ? getAvailablePhaseTools(user.role) : [0],
        [user]
    );

    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, [initialize]);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    // Fetch unit information when user is loaded
    useEffect(() => {
        const fetchUnitInfo = async () => {
            if (user && user.unitId) {
                try {
                    const unitDoc = await getDoc(doc(db, 'units', user.unitId));
                    if (unitDoc.exists()) {
                        const unitData = unitDoc.data();
                        setUnitName(unitData.name || '');
                        setUnitCategory(unitData.category || '');
                    }
                } catch (error) {
                    console.error('Error fetching unit info:', error);
                }
            }
        };

        fetchUnitInfo();
    }, [user]);

    // Fetch real dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!user) {
                setStatsLoading(false);
                return;
            }

            setStatsLoading(true);
            try {
                // Only fetch evidence/KPI if user has unitId and cycle selected
                if (user.unitId && selectedCycle?.id) {
                    // Count total evidence for this cycle
                    const evidenceQuery = query(
                        collection(db, 'evidence'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const evidenceSnap = await getDocs(evidenceQuery);
                    const totalEvidence = evidenceSnap.size;
                    setEvidenceCount(totalEvidence);

                    // Count verified evidence
                    let verified = 0;
                    evidenceSnap.forEach(doc => {
                        if (doc.data().verificationStatus === 'verified') {
                            verified++;
                        }
                    });
                    setVerifiedCount(verified);

                    // Calculate progress (verified / total * 100)
                    const progress = totalEvidence > 0 ? Math.round((verified / totalEvidence) * 100) : 0;
                    setCategoryProgress(progress);

                    // Count KPI data entries for this cycle
                    const kpiQuery = query(
                        collection(db, 'kpi_data'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const kpiSnap = await getDocs(kpiQuery);
                    setKpiDataCount(kpiSnap.size);

                    // Count KPI definitions for this cycle
                    const kpiDefsQuery = query(
                        collection(db, 'kpi_definitions'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const kpiDefsSnap = await getDocs(kpiDefsQuery);
                    setKpiDefinitionsCount(kpiDefsSnap.size);

                    // Count SAR contents for this cycle
                    const sarQuery = query(
                        collection(db, 'sar_contents'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const sarSnap = await getDocs(sarQuery);
                    setSarContentsCount(sarSnap.size);

                    // Count risks for this cycle
                    const risksQuery = query(
                        collection(db, 'risks'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const risksSnap = await getDocs(risksQuery);
                    setRisksCount(risksSnap.size);

                    // Count Q&A bank items for this cycle
                    const qaQuery = query(
                        collection(db, 'qa_bank'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const qaSnap = await getDocs(qaQuery);
                    setQaCount(qaSnap.size);

                    // Count strategy links for this cycle
                    const strategyQuery = query(
                        collection(db, 'strategy_links'),
                        where('unitId', '==', user.unitId),
                        where('cycleId', '==', selectedCycle.id)
                    );
                    const strategySnap = await getDocs(strategyQuery);
                    setStrategyLinksCount(strategySnap.size);

                    // Check context pack exists
                    const contextQuery = query(
                        collection(db, 'context_packs'),
                        where('unitId', '==', user.unitId)
                    );
                    const contextSnap = await getDocs(contextQuery);
                    setContextPackExists(contextSnap.size > 0);
                }

                // Admin stats: pending users (only for admins)
                if (canManageUsers(user.role)) {
                    const pendingQuery = query(
                        collection(db, 'users'),
                        where('status', '==', 'pending')
                    );
                    const pendingSnap = await getDocs(pendingQuery);
                    setPendingUsersCount(pendingSnap.size);
                }

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchDashboardStats();
    }, [user, selectedCycle]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    // Helper function to calculate phase progress data
    const getPhaseProgress = () => {
        return [
            {
                phase: 0,
                name: 'การเตรียมการ',
                completion: 100 // Assuming preparation is complete when accessing dashboard
            },
            {
                phase: 1,
                name: 'จัดการหลักฐาน',
                completion: categoryProgress
            },
            {
                phase: 2,
                name: 'จัดการข้อมูล',
                completion: kpiDefinitionsCount > 0 ? Math.min(100, Math.round((kpiDataCount / kpiDefinitionsCount) * 100)) : 0
            },
            {
                phase: 3,
                name: 'วิเคราะห์และเล่าเรื่อง',
                completion: contextPackExists ? Math.min(100, Math.round(((risksCount > 0 ? 50 : 0) + (strategyLinksCount > 0 ? 50 : 0)))) : 0
            },
            {
                phase: 4,
                name: 'เขียน SAR',
                completion: sarContentsCount > 0 ? Math.min(100, Math.round((sarContentsCount / 7) * 100)) : 0 // Assuming 7 categories
            },
            {
                phase: 5,
                name: 'รายงานผลลัพธ์',
                completion: kpiDataCount > 0 ? Math.min(100, Math.round((kpiDataCount / (kpiDefinitionsCount || 1)) * 100)) : 0
            },
            {
                phase: 6,
                name: 'ตรวจสอบคุณภาพ',
                completion: strategyLinksCount > 0 ? Math.min(100, strategyLinksCount * 10) : 0 // Rough estimate
            },
            {
                phase: 7,
                name: 'เตรียมสัมภาษณ์',
                completion: qaCount > 0 ? Math.min(100, qaCount * 5) : 0 // Rough estimate based on Q&A count
            }
        ];
    };

    // Handler for exporting dashboard to HTML
    const handleExportHTML = () => {
        if (!selectedCycle || !user) return;

        const phaseProgress = getPhaseProgress();

        exportDashboardHTML(
            selectedCycle.name || String(selectedCycle.year),
            unitName || 'ไม่ระบุหน่วยงาน',
            {
                evidenceCount,
                verifiedCount,
                kpiDataCount,
                sarContentsCount,
                risksCount,
                qaCount,
                strategyLinksCount,
                categoryProgress
            },
            phaseProgress
        );
    };

    // Admin Dashboard with Tabs
    if (showAdminTabs) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                {/* Welcome Section */}
                <section className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">ยินดีต้อนรับ, {user.displayName || 'ผู้ใช้งาน'}</h1>
                        <p className="text-muted-foreground mt-2">แดชบอร์ดผู้ดูแลระบบ PMQA 4.0</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectedCycle && exportDashboardSummary(
                                selectedCycle.name || String(selectedCycle.year),
                                { evidenceCount, verifiedCount, kpiDataCount, sarContentsCount, risksCount, qaCount, strategyLinksCount }
                            )}
                            disabled={!selectedCycle || statsLoading}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportHTML}
                            disabled={!selectedCycle || statsLoading}
                            className="gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Export HTML
                        </Button>
                        <OnlineUsersButton />
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {selectedCycle ? `รอบประเมิน: ${selectedCycle.name || selectedCycle.year}` : 'ยังไม่ได้เลือกรอบประเมิน'}
                            </p>
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 size={18} />
                                <span>กำลังดำเนินการ</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Announcement Cards - Visible to Admin too */}
                <AnnouncementCards />

                {/* Admin Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            ภาพรวม
                        </TabsTrigger>
                        <TabsTrigger value="announcements">
                            <Megaphone className="h-4 w-4 mr-2" />
                            ประกาศ
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            <Users className="h-4 w-4 mr-2" />
                            จัดการผู้ใช้
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            <Activity className="h-4 w-4 mr-2" />
                            ประวัติการใช้งาน
                        </TabsTrigger>
                        <TabsTrigger value="tools">
                            <FileSearch className="h-4 w-4 mr-2" />
                            เครื่องมือ Phase
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">ความคืบหน้าหลักฐาน</CardTitle>
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {statsLoading ? '-' : `${categoryProgress}%`}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : `${verifiedCount}/${evidenceCount} ผ่านการตรวจสอบ`}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">ข้อมูล KPI</CardTitle>
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {statsLoading ? '-' : kpiDataCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : 'รายการข้อมูลที่บันทึก'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">เอกสารหลักฐาน</CardTitle>
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {statsLoading ? '-' : evidenceCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : 'ไฟล์ที่อัปโหลดแล้ว'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400 dark:text-amber-400">รอการอนุมัติ</CardTitle>
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {statsLoading ? '-' : pendingUsersCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : 'ผู้ใช้รอการอนุมัติ'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Phase Progress Section */}
                        <h3 className="text-lg font-semibold text-foreground mt-6">ความคืบหน้าตาม Phase</h3>
                        <div id="dashboard-phase-progress" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                            <PhaseProgressCard
                                phase={1}
                                title="Evidence"
                                value={evidenceCount}
                                subValue={`${verifiedCount} ผ่าน`}
                                loading={statsLoading}
                                color="green"
                            />
                            <PhaseProgressCard
                                phase={2}
                                title="Data"
                                value={kpiDefinitionsCount}
                                subValue={`${kpiDataCount} ข้อมูล`}
                                loading={statsLoading}
                                color="blue"
                            />
                            <PhaseProgressCard
                                phase={3}
                                title="Analysis"
                                value={contextPackExists ? 1 : 0}
                                subValue={`${risksCount} ความเสี่ยง`}
                                loading={statsLoading}
                                color="orange"
                            />
                            <PhaseProgressCard
                                phase={4}
                                title="SAR"
                                value={sarContentsCount}
                                subValue="เนื้อหา"
                                loading={statsLoading}
                                color="indigo"
                            />
                            <PhaseProgressCard
                                phase={5}
                                title="Results"
                                value={kpiDataCount}
                                subValue="ผลลัพธ์"
                                loading={statsLoading}
                                color="emerald"
                            />
                            <PhaseProgressCard
                                phase={6}
                                title="QA"
                                value={strategyLinksCount}
                                subValue="เชื่อมโยง"
                                loading={statsLoading}
                                color="teal"
                            />
                            <PhaseProgressCard
                                phase={7}
                                title="Interview"
                                value={qaCount}
                                subValue="คำถาม"
                                loading={statsLoading}
                                color="violet"
                            />
                            <PhaseProgressCard
                                phase={8}
                                title="ภาพรวม"
                                value={categoryProgress}
                                subValue="%"
                                loading={statsLoading}
                                color="purple"
                                isPercentage
                            />
                        </div>

                        {/* Cycle Comparison */}
                        <CycleComparison />

                        <h3 className="text-lg font-semibold text-foreground">ระบบหลัก</h3>
                        <div id="dashboard-system-nav" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-purple-200 dark:border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 dark:text-purple-400">
                                        <MapPin className="h-5 w-5" />
                                        <span className="text-base">Assessment Roadmap</span>
                                    </CardTitle>
                                    <CardDescription>แผนที่เส้นทางการประเมิน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/roadmap">
                                        <Button variant="outline" className="w-full border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900">เริ่มต้น</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-indigo-100 dark:border-indigo-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 dark:text-indigo-400">
                                        <Calendar className="h-5 w-5" />
                                        <span className="text-base">Cycle Management</span>
                                    </CardTitle>
                                    <CardDescription>จัดการรอบการประเมิน PMQA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/admin/cycles">
                                        <Button variant="outline" className="w-full">จัดการรอบ</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-purple-100 dark:border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 dark:text-purple-400">
                                        <Settings className="h-5 w-5" />
                                        <span className="text-base">AI Configuration</span>
                                    </CardTitle>
                                    <CardDescription>ตั้งค่า Google Gemini AI</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/settings/ai">
                                        <Button variant="outline" className="w-full">ตั้งค่า</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card id="dashboard-ai-card" className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 dark:text-indigo-400">
                                        <Sparkles className="h-5 w-5" />
                                        <span className="text-base">AI Strategic Insights</span>
                                    </CardTitle>
                                    <CardDescription>วิเคราะห์จุดแข็ง/จุดอ่อนเชิงกลยุทธ์</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/insights">
                                        <Button variant="outline" className="w-full border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900">วิเคราะห์ข้อมูล</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Users Management */}
                    <TabsContent value="users" className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">จัดการผู้ใช้งานระบบ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-indigo-100 dark:border-indigo-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 dark:text-indigo-400">
                                        <UserCog className="h-5 w-5" />
                                        <span className="text-base">User Management</span>
                                    </CardTitle>
                                    <CardDescription>จัดการผู้ใช้งานระบบ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/admin/users">
                                        <Button variant="outline" className="w-full">จัดการผู้ใช้</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-emerald-100 dark:border-emerald-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 dark:text-emerald-400">
                                        <UserCheck className="h-5 w-5" />
                                        <span className="text-base">User Approvals</span>
                                    </CardTitle>
                                    <CardDescription>อนุมัติผู้ขอใช้งานระบบ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/admin/users?filter=pending">
                                        <Button variant="outline" className="w-full">จัดการ</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-blue-100 dark:border-blue-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 dark:text-blue-400">
                                        <Map className="h-5 w-5" />
                                        <span className="text-base">Network Mapper</span>
                                    </CardTitle>
                                    <CardDescription>จัดการโครงสร้างหน่วยงาน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/phase0/network-mapper">
                                        <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Announcements Management */}
                    <TabsContent value="announcements" className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">จัดการประกาศหน้า Dashboard</h3>
                        <AnnouncementManager />
                    </TabsContent>

                    {/* Tab 3: Activity Logs */}
                    <TabsContent value="activity" className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">ประวัติการใช้งานระบบ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-indigo-100 dark:border-indigo-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 dark:text-indigo-400">
                                        <Activity className="h-5 w-5" />
                                        <span className="text-base">Activity Log</span>
                                    </CardTitle>
                                    <CardDescription>ประวัติการใช้งานระบบ</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/admin/activity-log">
                                        <Button variant="outline" className="w-full">ดูรายการ</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Phase Tools */}
                    <TabsContent value="tools" className="space-y-6">
                        <PhaseToolsSection
                            isReviewer={isReviewer}
                            availablePhases={availablePhases}
                        />
                    </TabsContent>
                </Tabs>
                <OnboardingTour steps={TOUR_STEPS} />
            </div>
        );
    }

    // Regular User Dashboard (No Tabs)
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">ยินดีต้อนรับ, {user.displayName || 'ผู้ใช้งาน'}</h1>
                    <p className="text-muted-foreground mt-2">ติดตามความคืบหน้าการประเมิน PMQA 4.0 ของหน่วยงานคุณ</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedCycle && exportDashboardSummary(
                            selectedCycle.name || String(selectedCycle.year),
                            { evidenceCount, verifiedCount, kpiDataCount, sarContentsCount, risksCount, qaCount, strategyLinksCount }
                        )}
                        disabled={!selectedCycle || statsLoading}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportHTML}
                        disabled={!selectedCycle || statsLoading}
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        Export HTML
                    </Button>
                    <OnlineUsersButton />
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            {selectedCycle ? `รอบประเมิน: ${selectedCycle.name || selectedCycle.year}` : 'ยังไม่ได้เลือกรอบประเมิน'}
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 size={18} />
                            <span>กำลังดำเนินการ</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcement Cards - Visible to all users */}
            <AnnouncementCards />

            {/* Main Stats */}
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ความคืบหน้าหลักฐาน</CardTitle>
                        {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {statsLoading ? '-' : `${categoryProgress}%`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {statsLoading ? 'กำลังโหลด...' : `${verifiedCount}/${evidenceCount} ผ่านการตรวจสอบ`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ข้อมูล KPI</CardTitle>
                        {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {statsLoading ? '-' : kpiDataCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {statsLoading ? 'กำลังโหลด...' : 'รายการข้อมูลที่บันทึก'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เอกสารหลักฐาน</CardTitle>
                        {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {statsLoading ? '-' : evidenceCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {statsLoading ? 'กำลังโหลด...' : 'ไฟล์ที่อัปโหลดแล้ว'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Phase Progress Section for Regular Users */}
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">ความคืบหน้าตาม Phase</h3>
                <div id="dashboard-phase-progress" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <PhaseProgressCard phase={1} title="Evidence" value={evidenceCount} subValue={`${verifiedCount} ผ่าน`} loading={statsLoading} color="green" />
                    <PhaseProgressCard phase={2} title="Data" value={kpiDefinitionsCount} subValue={`${kpiDataCount} ข้อมูล`} loading={statsLoading} color="blue" />
                    <PhaseProgressCard phase={3} title="Analysis" value={contextPackExists ? 1 : 0} subValue={`${risksCount} ความเสี่ยง`} loading={statsLoading} color="orange" />
                    <PhaseProgressCard phase={4} title="SAR" value={sarContentsCount} subValue="เนื้อหา" loading={statsLoading} color="indigo" />
                    <PhaseProgressCard phase={5} title="Results" value={kpiDataCount} subValue="ผลลัพธ์" loading={statsLoading} color="emerald" />
                    <PhaseProgressCard phase={6} title="QA" value={strategyLinksCount} subValue="เชื่อมโยง" loading={statsLoading} color="teal" />
                    <PhaseProgressCard phase={7} title="Interview" value={qaCount} subValue="คำถาม" loading={statsLoading} color="violet" />
                    <PhaseProgressCard phase={8} title="ภาพรวม" value={categoryProgress} subValue="%" loading={statsLoading} color="purple" isPercentage />
                </div>
            </div>

            {/* Cycle Comparison for Regular Users */}
            <div id="dashboard-comparison">
                <CycleComparison />
            </div>

            {/* Phase Tools for Regular Users */}
            <div id="dashboard-phase-tools">
                <PhaseToolsSection
                    isReviewer={isReviewer}
                    availablePhases={availablePhases}
                />
            </div>
            <OnboardingTour steps={TOUR_STEPS} />
        </div>
    );
}

// Phase Progress Card Component
const PhaseProgressCard = memo(function PhaseProgressCard({
    phase,
    title,
    value,
    subValue,
    loading,
    color,
    isPercentage = false
}: {
    phase: number;
    title: string;
    value: number;
    subValue: string;
    loading: boolean;
    color: string;
    isPercentage?: boolean;
}) {
    const colorClasses: Record<string, string> = {
        green: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 dark:text-green-400',
        blue: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 dark:text-blue-400',
        orange: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 dark:text-orange-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 dark:text-indigo-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 dark:text-emerald-400',
        teal: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 dark:text-teal-400',
        violet: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 dark:text-violet-400',
        purple: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 dark:text-purple-400',
    };

    return (
        <Card className={`${colorClasses[color] || colorClasses.blue} border transition-all hover:shadow-sm`}>
            <CardContent className="p-3 text-center">
                <div className="text-xs font-medium opacity-70 mb-1">
                    {phase <= 7 ? `P${phase}` : ''} {title}
                </div>
                <div className="text-xl font-bold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                        isPercentage ? `${value}%` : value
                    )}
                </div>
                <div className="text-xs opacity-60">{subValue}</div>
            </CardContent>
        </Card>
    );
});

// Separate component for Phase Tools to avoid duplication
// Memoized to prevent re-renders when parent dashboard updates stats
const PhaseToolsSection = memo(function PhaseToolsSection({
    isReviewer,
    availablePhases
}: {
    isReviewer: boolean;
    availablePhases: number[];
}) {
    return (
        <>
            <h2 className="text-xl font-semibold mb-4 text-foreground">เครื่องมือของฉัน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Roadmap - Available to all users */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 dark:text-purple-400">
                            <MapPin className="h-5 w-5" />
                            <span className="text-base">Assessment Roadmap</span>
                        </CardTitle>
                        <CardDescription>แผนที่เส้นทางการประเมิน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/roadmap">
                            <Button variant="outline" className="w-full border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900">เริ่มต้น</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Phase 0 Apps */}
                {availablePhases.includes(0) && (
                    <>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-blue-50 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Owner Matrix</span>
                                </CardTitle>
                                <CardDescription>มอบหมายผู้รับผิดชอบหมวด 1-7</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/owner-matrix">
                                    <Button variant="outline" className="w-full text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-teal-50 dark:border-teal-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                    <FolderPlus className="h-5 w-5" />
                                    <span className="text-base">Repository Setup</span>
                                </CardTitle>
                                <CardDescription>สร้างโฟลเดอร์เก็บหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/repository-setup">
                                    <Button variant="outline" className="w-full text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-100 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-amber-50 dark:border-amber-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <CalendarIcon className="h-5 w-5" />
                                    <span className="text-base">Submission Calendar</span>
                                </CardTitle>
                                <CardDescription>ตารางกำหนดการส่งงาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/calendar">
                                    <Button variant="outline" className="w-full text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900">ดูตาราง</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Phase 1 Apps */}
            {availablePhases.includes(1) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 1: Evidence Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-green-50 dark:border-green-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Evidence Register</span>
                                </CardTitle>
                                <CardDescription>นำเข้าและทะเบียนหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/evidence">
                                    <Button variant="outline" className="w-full text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900">เข้าสู่ระบบ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-orange-50 dark:border-orange-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                    <BarChart3 className="h-5 w-5" />
                                    <span className="text-base">Gap Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ช่องว่างหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/gap-analyzer">
                                    <Button variant="outline" className="w-full text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {isReviewer && (
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-purple-50 dark:border-purple-900 dark:border-purple-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400 dark:text-purple-400">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-base">Gate Checker</span>
                                    </CardTitle>
                                    <CardDescription>ตรวจสอบและอนุมัติหลักฐาน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/phase1/gate-checker">
                                        <Button variant="outline" className="w-full text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">ตรวจสอบ</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-rose-50 dark:border-rose-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                                    <ClipboardCheck className="h-5 w-5" />
                                    <span className="text-base">Gap Tracker</span>
                                </CardTitle>
                                <CardDescription>ติดตามการปิด Gap หลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/gap-tracker">
                                    <Button variant="outline" className="w-full text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900">ติดตาม</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 2: Data Management */}
            {availablePhases.includes(2) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 2: Data Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-blue-50 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <Database className="h-5 w-5" />
                                    <span className="text-base">Data Source Catalog</span>
                                </CardTitle>
                                <CardDescription>จัดทำคลังแหล่งข้อมูล (2.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-catalog">
                                    <Button variant="outline" className="w-full text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-indigo-50 dark:border-indigo-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-base">KPI Dictionary</span>
                                </CardTitle>
                                <CardDescription>พจนานุกรม KPI (2.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/kpi-dictionary">
                                    <Button variant="outline" className="w-full text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-green-50 dark:border-green-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <FileSpreadsheet className="h-5 w-5" />
                                    <span className="text-base">Excel Templates</span>
                                </CardTitle>
                                <CardDescription>สร้าง Template (2.3)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/excel-templates">
                                    <Button variant="outline" className="w-full text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-cyan-50 dark:border-cyan-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                                    <ClipboardEdit className="h-5 w-5" />
                                    <span className="text-base">Data Collector</span>
                                </CardTitle>
                                <CardDescription>กรอกข้อมูล KPI (2.4)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-collector">
                                    <Button variant="outline" className="w-full text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-100 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900">กรอกข้อมูล</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-violet-50 dark:border-violet-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                                    <Sparkles className="h-5 w-5" />
                                    <span className="text-base">Data Cleaning</span>
                                </CardTitle>
                                <CardDescription>ทำความสะอาดข้อมูล (2.5)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-cleaning">
                                    <Button variant="outline" className="w-full text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-emerald-50 dark:border-emerald-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <LineChart className="h-5 w-5" />
                                    <span className="text-base">Baseline Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ผลลัพธ์ (2.6)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/baseline-analyzer">
                                    <Button variant="outline" className="w-full text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 3: Analysis & Narrative */}
            {availablePhases.includes(3) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 3: Analysis & Narrative</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-sky-50 dark:border-sky-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Context Pack</span>
                                </CardTitle>
                                <CardDescription>รวบรวมบริบทองค์กร (3.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/context-pack">
                                    <Button variant="outline" className="w-full text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-orange-50 dark:border-orange-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="text-base">Risk Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ความเสี่ยง (3.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/risk-analyzer">
                                    <Button variant="outline" className="w-full text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-purple-50 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                    <GitBranch className="h-5 w-5" />
                                    <span className="text-base">Strategy Linker</span>
                                </CardTitle>
                                <CardDescription>เชื่อมโยงยุทธศาสตร์ (3.3)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/strategy-linker">
                                    <Button variant="outline" className="w-full text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 4: SAR Writing */}
            {availablePhases.includes(4) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 4: SAR Writing (AI-Powered)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-indigo-50 dark:border-indigo-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">SAR Outline</span>
                                </CardTitle>
                                <CardDescription>สร้างโครงร่าง SAR (4.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase4/sar-outline">
                                    <Button variant="outline" className="w-full text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-purple-50 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                    <PenTool className="h-5 w-5" />
                                    <span className="text-base">SAR Writer</span>
                                </CardTitle>
                                <CardDescription>เขียนเนื้อหาด้วย AI (4.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase4/sar-writer">
                                    <Button variant="outline" className="w-full text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900">เขียน</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 5: Results */}
            {availablePhases.includes(5) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 5: Results (Category 7)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-emerald-50 dark:border-emerald-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <Package className="h-5 w-5" />
                                    <span className="text-base">Results Data Pack</span>
                                </CardTitle>
                                <CardDescription>รวบรวมผลลัพธ์หมวด 7 (5.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase5/results-pack">
                                    <Button variant="outline" className="w-full text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900">ดูผลลัพธ์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-amber-50 dark:border-amber-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-base">Recovery Narrative</span>
                                </CardTitle>
                                <CardDescription>บทวิเคราะห์ผลลัพธ์ (5.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase5/recovery-narrative">
                                    <Button variant="outline" className="w-full text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900">สร้างบทวิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 6: Quality Assurance */}
            {availablePhases.includes(6) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 6: Quality Assurance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-blue-50 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-base">Consistency Auditor</span>
                                </CardTitle>
                                <CardDescription>ตรวจสอบความสอดคล้อง (6.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase6/consistency-auditor">
                                    <Button variant="outline" className="w-full text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900">ตรวจสอบ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-teal-50 dark:border-teal-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                    <Calculator className="h-5 w-5" />
                                    <span className="text-base">Score Simulator</span>
                                </CardTitle>
                                <CardDescription>จำลองคะแนน PMQA (6.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase6/score-simulator">
                                    <Button variant="outline" className="w-full text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-100 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900">จำลอง</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 7: Interview Prep */}
            {availablePhases.includes(7) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Phase 7: Interview Prep</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-rose-50 dark:border-rose-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                                    <Presentation className="h-5 w-5" />
                                    <span className="text-base">Interview Brief</span>
                                </CardTitle>
                                <CardDescription>เตรียมรับการตรวจประเมิน (7.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase7/interview-brief">
                                    <Button variant="outline" className="w-full text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900">สร้าง Brief</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-card border-violet-50 dark:border-violet-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
                                    <HelpCircle className="h-5 w-5" />
                                    <span className="text-base">Q&A Bank</span>
                                </CardTitle>
                                <CardDescription>คลังคำถาม-คำตอบ (7.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase7/qa-bank">
                                    <Button variant="outline" className="w-full text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900">จัดการ Q&A</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Online Users Sidebar */}
            <OnlineUsersSidebar />
        </>
    );
});
