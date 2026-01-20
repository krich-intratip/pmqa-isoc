'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Users, Settings, Map, Calendar as CalendarIcon, FileText, CheckCircle2,
    BarChart3, ShieldCheck, FolderPlus, ClipboardCheck, Database,
    BookOpen, FileSpreadsheet, ClipboardEdit, Sparkles, LineChart,
    AlertTriangle, GitBranch, PenTool, Package, Calculator,
    Presentation, HelpCircle, Calendar, UserCog, Activity, MapPin, Loader2,
    LayoutDashboard, UserCheck, FileSearch, Megaphone
} from 'lucide-react';
import {
    canManageUsers,
    canApproveEvidence,
    shouldShowAdminTabs,
    getAvailablePhaseTools
} from '@/lib/auth/role-helper';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AnnouncementCards } from '@/components/dashboard/AnnouncementCards';
import { AnnouncementManager } from '@/components/dashboard/AnnouncementManager';

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
    const [pendingUsersCount, setPendingUsersCount] = useState(0);

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

    // Admin Dashboard with Tabs
    if (showAdminTabs) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                {/* Welcome Section */}
                <section className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">ยินดีต้อนรับ, {user.displayName || 'ผู้ใช้งาน'}</h1>
                        <p className="text-slate-500 mt-2">แดชบอร์ดผู้ดูแลระบบ PMQA 4.0</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">
                            {selectedCycle ? `รอบประเมิน: ${selectedCycle.name || selectedCycle.year}` : 'ยังไม่ได้เลือกรอบประเมิน'}
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                            <CheckCircle2 size={18} />
                            <span>กำลังดำเนินการ</span>
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
                                    <div className="text-2xl font-bold text-emerald-600">
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
                                    <div className="text-2xl font-bold text-blue-600">
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
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {statsLoading ? '-' : evidenceCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : 'ไฟล์ที่อัปโหลดแล้ว'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-200 bg-amber-50/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-amber-700">รอการอนุมัติ</CardTitle>
                                    {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">
                                        {statsLoading ? '-' : pendingUsersCount}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {statsLoading ? 'กำลังโหลด...' : 'ผู้ใช้รอการอนุมัติ'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800">ระบบหลัก</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
                                        <MapPin className="h-5 w-5" />
                                        <span className="text-base">Assessment Roadmap</span>
                                    </CardTitle>
                                    <CardDescription>แผนที่เส้นทางการประเมิน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/roadmap">
                                        <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-100">เริ่มต้น</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700">
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

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-purple-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
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
                        </div>
                    </TabsContent>

                    {/* Tab 2: Users Management */}
                    <TabsContent value="users" className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-800">จัดการผู้ใช้งานระบบ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700">
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

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-emerald-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-emerald-700">
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

                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-blue-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-700">
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
                        <h3 className="text-lg font-semibold text-slate-800">จัดการประกาศหน้า Dashboard</h3>
                        <AnnouncementManager />
                    </TabsContent>

                    {/* Tab 3: Activity Logs */}
                    <TabsContent value="activity" className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-800">ประวัติการใช้งานระบบ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700">
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
            </div>
        );
    }

    // Regular User Dashboard (No Tabs)
    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ยินดีต้อนรับ, {user.displayName || 'ผู้ใช้งาน'}</h1>
                    <p className="text-slate-500 mt-2">ติดตามความคืบหน้าการประเมิน PMQA 4.0 ของหน่วยงานคุณ</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">
                        {selectedCycle ? `รอบประเมิน: ${selectedCycle.name || selectedCycle.year}` : 'ยังไม่ได้เลือกรอบประเมิน'}
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle2 size={18} />
                        <span>กำลังดำเนินการ</span>
                    </div>
                </div>
            </section>

            {/* Announcement Cards - Visible to all users */}
            <AnnouncementCards />

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ความคืบหน้าหลักฐาน</CardTitle>
                        {statsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
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
                        <div className="text-2xl font-bold text-blue-600">
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
                        <div className="text-2xl font-bold text-indigo-600">
                            {statsLoading ? '-' : evidenceCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {statsLoading ? 'กำลังโหลด...' : 'ไฟล์ที่อัปโหลดแล้ว'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Phase Tools for Regular Users */}
            <PhaseToolsSection
                isReviewer={isReviewer}
                availablePhases={availablePhases}
            />
        </div>
    );
}

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
            <h2 className="text-xl font-semibold mb-4 text-slate-800">เครื่องมือของฉัน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Roadmap - Available to all users */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <MapPin className="h-5 w-5" />
                            <span className="text-base">Assessment Roadmap</span>
                        </CardTitle>
                        <CardDescription>แผนที่เส้นทางการประเมิน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/roadmap">
                            <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-100">เริ่มต้น</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Phase 0 Apps */}
                {availablePhases.includes(0) && (
                    <>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Owner Matrix</span>
                                </CardTitle>
                                <CardDescription>มอบหมายผู้รับผิดชอบหมวด 1-7</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/owner-matrix">
                                    <Button variant="outline" className="w-full text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-teal-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-teal-700">
                                    <FolderPlus className="h-5 w-5" />
                                    <span className="text-base">Repository Setup</span>
                                </CardTitle>
                                <CardDescription>สร้างโฟลเดอร์เก็บหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/repository-setup">
                                    <Button variant="outline" className="w-full text-teal-700 bg-teal-50 border-teal-100 hover:bg-teal-100">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700">
                                    <CalendarIcon className="h-5 w-5" />
                                    <span className="text-base">Submission Calendar</span>
                                </CardTitle>
                                <CardDescription>ตารางกำหนดการส่งงาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase0/calendar">
                                    <Button variant="outline" className="w-full text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100">ดูตาราง</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Phase 1 Apps */}
            {availablePhases.includes(1) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 1: Evidence Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Evidence Register</span>
                                </CardTitle>
                                <CardDescription>นำเข้าและทะเบียนหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/evidence">
                                    <Button variant="outline" className="w-full text-green-700 bg-green-50 border-green-100 hover:bg-green-100">เข้าสู่ระบบ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <BarChart3 className="h-5 w-5" />
                                    <span className="text-base">Gap Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ช่องว่างหลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/gap-analyzer">
                                    <Button variant="outline" className="w-full text-orange-700 bg-orange-50 border-orange-100 hover:bg-orange-100">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {isReviewer && (
                            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-purple-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-base">Gate Checker</span>
                                    </CardTitle>
                                    <CardDescription>ตรวจสอบและอนุมัติหลักฐาน</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/phase1/gate-checker">
                                        <Button variant="outline" className="w-full text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100">ตรวจสอบ</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-rose-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-700">
                                    <ClipboardCheck className="h-5 w-5" />
                                    <span className="text-base">Gap Tracker</span>
                                </CardTitle>
                                <CardDescription>ติดตามการปิด Gap หลักฐาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase1/gap-tracker">
                                    <Button variant="outline" className="w-full text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100">ติดตาม</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 2: Data Management */}
            {availablePhases.includes(2) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 2: Data Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <Database className="h-5 w-5" />
                                    <span className="text-base">Data Source Catalog</span>
                                </CardTitle>
                                <CardDescription>จัดทำคลังแหล่งข้อมูล (2.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-catalog">
                                    <Button variant="outline" className="w-full text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-base">KPI Dictionary</span>
                                </CardTitle>
                                <CardDescription>พจนานุกรม KPI (2.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/kpi-dictionary">
                                    <Button variant="outline" className="w-full text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <FileSpreadsheet className="h-5 w-5" />
                                    <span className="text-base">Excel Templates</span>
                                </CardTitle>
                                <CardDescription>สร้าง Template (2.3)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/excel-templates">
                                    <Button variant="outline" className="w-full text-green-700 bg-green-50 border-green-100 hover:bg-green-100">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-cyan-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-cyan-700">
                                    <ClipboardEdit className="h-5 w-5" />
                                    <span className="text-base">Data Collector</span>
                                </CardTitle>
                                <CardDescription>กรอกข้อมูล KPI (2.4)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-collector">
                                    <Button variant="outline" className="w-full text-cyan-700 bg-cyan-50 border-cyan-100 hover:bg-cyan-100">กรอกข้อมูล</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-violet-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-violet-700">
                                    <Sparkles className="h-5 w-5" />
                                    <span className="text-base">Data Cleaning</span>
                                </CardTitle>
                                <CardDescription>ทำความสะอาดข้อมูล (2.5)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/data-cleaning">
                                    <Button variant="outline" className="w-full text-violet-700 bg-violet-50 border-violet-100 hover:bg-violet-100">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-emerald-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700">
                                    <LineChart className="h-5 w-5" />
                                    <span className="text-base">Baseline Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ผลลัพธ์ (2.6)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase2/baseline-analyzer">
                                    <Button variant="outline" className="w-full text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 3: Analysis & Narrative */}
            {availablePhases.includes(3) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 3: Analysis & Narrative</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-sky-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sky-700">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">Context Pack</span>
                                </CardTitle>
                                <CardDescription>รวบรวมบริบทองค์กร (3.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/context-pack">
                                    <Button variant="outline" className="w-full text-sky-700 bg-sky-50 border-sky-100 hover:bg-sky-100">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="text-base">Risk Analyzer</span>
                                </CardTitle>
                                <CardDescription>วิเคราะห์ความเสี่ยง (3.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/risk-analyzer">
                                    <Button variant="outline" className="w-full text-orange-700 bg-orange-50 border-orange-100 hover:bg-orange-100">วิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-purple-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700">
                                    <GitBranch className="h-5 w-5" />
                                    <span className="text-base">Strategy Linker</span>
                                </CardTitle>
                                <CardDescription>เชื่อมโยงยุทธศาสตร์ (3.3)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase3/strategy-linker">
                                    <Button variant="outline" className="w-full text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 4: SAR Writing */}
            {availablePhases.includes(4) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 4: SAR Writing (AI-Powered)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-base">SAR Outline</span>
                                </CardTitle>
                                <CardDescription>สร้างโครงร่าง SAR (4.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase4/sar-outline">
                                    <Button variant="outline" className="w-full text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100">สร้าง</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-purple-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700">
                                    <PenTool className="h-5 w-5" />
                                    <span className="text-base">SAR Writer</span>
                                </CardTitle>
                                <CardDescription>เขียนเนื้อหาด้วย AI (4.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase4/sar-writer">
                                    <Button variant="outline" className="w-full text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-100">เขียน</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 5: Results */}
            {availablePhases.includes(5) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 5: Results (Category 7)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-emerald-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700">
                                    <Package className="h-5 w-5" />
                                    <span className="text-base">Results Data Pack</span>
                                </CardTitle>
                                <CardDescription>รวบรวมผลลัพธ์หมวด 7 (5.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase5/results-pack">
                                    <Button variant="outline" className="w-full text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100">ดูผลลัพธ์</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-700">
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-base">Recovery Narrative</span>
                                </CardTitle>
                                <CardDescription>บทวิเคราะห์ผลลัพธ์ (5.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase5/recovery-narrative">
                                    <Button variant="outline" className="w-full text-amber-700 bg-amber-50 border-amber-100 hover:bg-amber-100">สร้างบทวิเคราะห์</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 6: Quality Assurance */}
            {availablePhases.includes(6) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 6: Quality Assurance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-base">Consistency Auditor</span>
                                </CardTitle>
                                <CardDescription>ตรวจสอบความสอดคล้อง (6.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase6/consistency-auditor">
                                    <Button variant="outline" className="w-full text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100">ตรวจสอบ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-teal-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-teal-700">
                                    <Calculator className="h-5 w-5" />
                                    <span className="text-base">Score Simulator</span>
                                </CardTitle>
                                <CardDescription>จำลองคะแนน PMQA (6.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase6/score-simulator">
                                    <Button variant="outline" className="w-full text-teal-700 bg-teal-50 border-teal-100 hover:bg-teal-100">จำลอง</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Phase 7: Interview Prep */}
            {availablePhases.includes(7) && (
                <>
                    <h2 className="text-xl font-semibold mt-8 mb-4 text-slate-800">Phase 7: Interview Prep</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-rose-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-rose-700">
                                    <Presentation className="h-5 w-5" />
                                    <span className="text-base">Interview Brief</span>
                                </CardTitle>
                                <CardDescription>เตรียมรับการตรวจประเมิน (7.1)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase7/interview-brief">
                                    <Button variant="outline" className="w-full text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100">สร้าง Brief</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-violet-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-violet-700">
                                    <HelpCircle className="h-5 w-5" />
                                    <span className="text-base">Q&A Bank</span>
                                </CardTitle>
                                <CardDescription>คลังคำถาม-คำตอบ (7.2)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/phase7/qa-bank">
                                    <Button variant="outline" className="w-full text-violet-700 bg-violet-50 border-violet-100 hover:bg-violet-100">จัดการ Q&A</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </>
    );
});
