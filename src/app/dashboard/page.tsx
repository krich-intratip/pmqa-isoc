'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Users, Settings, Map, Calendar, FileText, CheckCircle2,
    BarChart3, ShieldCheck, FolderPlus, ClipboardCheck, Database,
    BookOpen, FileSpreadsheet, ClipboardEdit, Sparkles, LineChart,
    AlertTriangle, GitBranch, PenTool, Package, Calculator,
    Presentation, HelpCircle
} from 'lucide-react';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Mock roles for development/testing
    const isAdmin = true;
    const isReviewer = true;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <section className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ยินดีต้อนรับ, {user.displayName || 'ผู้ใช้งาน'}</h1>
                    <p className="text-slate-500 mt-2">ติดตามความคืบหน้าการประเมิน PMQA 4.0 ของหน่วยงานคุณ</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">สถานะปัจจุบัน</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle2 size={18} />
                        <span>กำลังดำเนินการ (Phase 1-2)</span>
                    </div>
                </div>
            </section>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ความคืบหน้าหมวด 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">ยังไม่ได้เริ่มดำเนินการ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">คะแนนประเมินตนเอง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">รอการประเมิน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เอกสารหลักฐาน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">ไฟล์ที่อัปโหลดแล้ว</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-slate-800">เมนูหลัก (Applications)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {isAdmin && (
                    <>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <Users className="h-5 w-5" />
                                    <span className="text-base">User Approvals</span>
                                </CardTitle>
                                <CardDescription>อนุมัติผู้ขอใช้งานระบบ</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/admin/approvals">
                                    <Button variant="outline" className="w-full">จัดการ</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-indigo-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
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
                    </>
                )}

                {/* Phase 0 Apps */}
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

                {/* Phase 1 Apps */}
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

                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Calendar className="h-5 w-5" />
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

            </div>

            {/* Phase 2: Data Management */}
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

            {/* Phase 3: Analysis & Narrative */}
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

            {/* Phase 4: SAR Writing */}
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

            {/* Phase 5: Results */}
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

            {/* Phase 6: Quality Assurance */}
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

            {/* Phase 7: Interview Prep */}
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

        </div>
    );
}
