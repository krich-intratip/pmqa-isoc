'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Users,
    Calendar,
    FileText,
    ShieldCheck,
    Database,
    Sparkles,
    LayoutDashboard,
    Zap,
    Code,
    MessageSquare,
    Search,
    Globe,
    Lock,
    Server,
    Cpu,
    Cloud,
    Layers,
    GitBranch,
    RefreshCw,
    Eye,
    BookOpen,
} from 'lucide-react';
import { APP_VERSION } from '@/config/version';

export default function FeaturesPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    สรุปฟีเจอร์ระบบ
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    สรุปฟีเจอร์ทั้งหมดของระบบ PMQA ISOC แบ่งตามประเภท ความต้องการเชิงหน้าที่ (Functional),
                    ความต้องการเชิงคุณภาพ (Non-Functional) และเทคโนโลยี (Technology)
                </p>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    เวอร์ชัน {APP_VERSION.version}
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="functional" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="functional" className="text-base">
                        <Zap className="h-4 w-4 mr-2" />
                        ความต้องการเชิงหน้าที่
                    </TabsTrigger>
                    <TabsTrigger value="non-functional" className="text-base">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        ความต้องการเชิงคุณภาพ
                    </TabsTrigger>
                    <TabsTrigger value="technology" className="text-base">
                        <Code className="h-4 w-4 mr-2" />
                        เทคโนโลยี
                    </TabsTrigger>
                </TabsList>

                {/* Functional Features */}
                <TabsContent value="functional" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Zap className="h-6 w-6" />
                                ความต้องการเชิงหน้าที่ (Functional Requirements)
                            </CardTitle>
                            <CardDescription>
                                ฟังก์ชันการทำงานหลักของระบบ PMQA ISOC
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* User Management */}
                                <FeatureCard
                                    icon={Users}
                                    title="การจัดการผู้ใช้งาน (User Management)"
                                    description="จัดการผู้ใช้งานแบบครบวงจร"
                                    items={[
                                        'เข้าสู่ระบบด้วย Google OAuth',
                                        'ควบคุมสิทธิ์ตามบทบาท (Admin/Reviewer/Editor/Viewer)',
                                        'กระบวนการอนุมัติผู้ใช้ใหม่',
                                        'นำเข้าผู้ใช้จำนวนมากจาก Excel/CSV',
                                        'หน้าโปรไฟล์และการตั้งค่า',
                                        'บันทึกประวัติการใช้งาน (Activity Log)',
                                    ]}
                                    color="blue"
                                />

                                {/* Evidence Management */}
                                <FeatureCard
                                    icon={FileText}
                                    title="การจัดการหลักฐาน (Evidence Management)"
                                    description="จัดการหลักฐานประกอบการประเมิน"
                                    items={[
                                        'อัปโหลดหลักฐานหลายไฟล์พร้อมกัน',
                                        'ระบบจัดการเวอร์ชันไฟล์ (File Versioning)',
                                        'ติดแท็กอัจฉริยะด้วย AI (Smart Tagging)',
                                        'กระบวนการตรวจสอบหลักฐาน',
                                        'จัดหมวดหมู่ตาม PMQA 7 หมวด',
                                        'ดาวน์โหลดและส่งออกหลักฐาน',
                                    ]}
                                    color="green"
                                />

                                {/* SAR Writing */}
                                <FeatureCard
                                    icon={BookOpen}
                                    title="เขียนรายงาน SAR (SAR Writer)"
                                    description="เครื่องมือเขียนรายงานประเมินตนเอง"
                                    items={[
                                        'ตัวแก้ไขข้อความขั้นสูง (Rich Text Editor)',
                                        'ผู้ช่วยเขียนด้วย AI (ปรับภาษาทางการ)',
                                        'ระบบแม่แบบ (Template)',
                                        'บันทึกอัตโนมัติและฉบับร่าง',
                                        'ความคิดเห็นและ @Mentions',
                                        'ส่งออกเป็น PDF/HTML',
                                    ]}
                                    color="purple"
                                />

                                {/* AI Features */}
                                <FeatureCard
                                    icon={Sparkles}
                                    title="ความสามารถ AI (AI Capabilities)"
                                    description="ใช้ AI ช่วยวิเคราะห์และทำงาน"
                                    items={[
                                        'วิเคราะห์เชิงกลยุทธ์ (SWOT Analysis)',
                                        'พยากรณ์คะแนน (Predictive Scoring)',
                                        'วิเคราะห์แนวโน้ม (Trend Analysis)',
                                        'ถาม-ตอบเกณฑ์ PMQA (Chat RAG)',
                                        'ผู้ช่วยตอบคำถาม (Q&A Assistant)',
                                        'ติดแท็กหลักฐานอัตโนมัติ',
                                    ]}
                                    color="amber"
                                />

                                {/* Dashboard & Analytics */}
                                <FeatureCard
                                    icon={LayoutDashboard}
                                    title="แดชบอร์ดและการวิเคราะห์ (Dashboard & Analytics)"
                                    description="ภาพรวมและการวิเคราะห์ข้อมูล"
                                    items={[
                                        'แดชบอร์ดแบบเรียลไทม์',
                                        'ติดตามความคืบหน้า 8 Phase',
                                        'ตารางจัดอันดับหน่วยงาน (Leaderboard)',
                                        'เปรียบเทียบรอบประเมิน',
                                        'ส่งออกแดชบอร์ด (CSV/HTML)',
                                        'ประกาศข่าวสารบนแดชบอร์ด',
                                    ]}
                                    color="indigo"
                                />

                                {/* Collaboration */}
                                <FeatureCard
                                    icon={MessageSquare}
                                    title="การทำงานร่วมกัน (Collaboration)"
                                    description="เครื่องมือสนับสนุนการทำงานเป็นทีม"
                                    items={[
                                        'แสดงผู้ใช้ออนไลน์แบบเรียลไทม์ (Live Presence)',
                                        'ระบบความคิดเห็น (Comments)',
                                        '@Mentions และการแจ้งเตือน',
                                        'ศูนย์การแจ้งเตือนในแอป',
                                        'แจ้งเตือนทางอีเมล',
                                        'ซิงค์ Google Calendar',
                                    ]}
                                    color="cyan"
                                />

                                {/* Cycle Management */}
                                <FeatureCard
                                    icon={Calendar}
                                    title="การจัดการรอบประเมิน (Cycle Management)"
                                    description="จัดการรอบการประเมิน PMQA"
                                    items={[
                                        'สร้างและจัดการรอบประเมิน',
                                        'กำหนดวันเริ่มต้น-สิ้นสุด',
                                        'เลือกรอบที่ใช้งานอัตโนมัติ',
                                        'เปรียบเทียบรอบประเมิน',
                                        'เชื่อมต่อกับ Calendar',
                                        'แจ้งเตือนก่อนถึงกำหนด',
                                    ]}
                                    color="emerald"
                                />

                                {/* Search & Navigation */}
                                <FeatureCard
                                    icon={Search}
                                    title="การค้นหาและนำทาง (Search & Navigation)"
                                    description="ค้นหาข้อมูลและนำทางภายในระบบ"
                                    items={[
                                        'ค้นหาทั่วทั้งระบบ (Cmd/Ctrl+K)',
                                        'ค้นหา Evidence, SAR, Users, KPI',
                                        'กรองและเรียงลำดับผลลัพธ์',
                                        'ไฮไลท์คำที่ค้นพบ',
                                        'แผนผังกระบวนการประเมิน (Roadmap)',
                                        'นำทางอย่างรวดเร็ว',
                                    ]}
                                    color="rose"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Non-Functional Features */}
                <TabsContent value="non-functional" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <ShieldCheck className="h-6 w-6" />
                                ความต้องการเชิงคุณภาพ (Non-Functional Requirements)
                            </CardTitle>
                            <CardDescription>
                                คุณสมบัติด้านประสิทธิภาพ ความปลอดภัย และการใช้งาน
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Security */}
                                <FeatureCard
                                    icon={Lock}
                                    title="ความปลอดภัย (Security)"
                                    description="ปกป้องข้อมูลและควบคุมการเข้าถึง"
                                    items={[
                                        'ยืนยันตัวตนด้วย Google OAuth 2.0',
                                        'ควบคุมสิทธิ์ตามบทบาท (RBAC)',
                                        'กฎความปลอดภัย Firestore',
                                        'บันทึกกิจกรรมไม่สามารถแก้ไขได้',
                                        'การจัดการเซสชัน',
                                        'เข้ารหัสข้อมูลทั้งขณะจัดเก็บและส่งข้อมูล',
                                    ]}
                                    color="red"
                                />

                                {/* Performance */}
                                <FeatureCard
                                    icon={Zap}
                                    title="ประสิทธิภาพ (Performance)"
                                    description="ความเร็วและความสามารถในการทำงาน"
                                    items={[
                                        'Next.js 16 พร้อม Turbopack',
                                        'React 19 Concurrent Features',
                                        'ซิงค์ข้อมูลแบบเรียลไทม์',
                                        'อัปเดต UI แบบ Optimistic',
                                        'โหลดแบบ Lazy และแยกโค้ด (Code Splitting)',
                                        'แคชที่ Edge ผ่าน Vercel',
                                    ]}
                                    color="orange"
                                />

                                {/* Usability */}
                                <FeatureCard
                                    icon={Eye}
                                    title="ความง่ายในการใช้งาน (Usability)"
                                    description="ประสบการณ์ผู้ใช้ที่ดี"
                                    items={[
                                        'ออกแบบ Responsive (มือถือ/แท็บเล็ต/เดสก์ท็อป)',
                                        'รองรับ Dark Mode',
                                        'อินเทอร์เฟซภาษาไทย',
                                        'แนะนำการใช้งานสำหรับผู้ใช้ใหม่ (Onboarding)',
                                        'ปุ่มลัด (Keyboard Shortcuts)',
                                        'UI Components ที่เข้าถึงได้ (Accessible)',
                                    ]}
                                    color="violet"
                                />

                                {/* Reliability */}
                                <FeatureCard
                                    icon={RefreshCw}
                                    title="ความน่าเชื่อถือ (Reliability)"
                                    description="ความเสถียรและการกู้คืน"
                                    items={[
                                        'Firebase High Availability',
                                        'บันทึกอัตโนมัติและกู้คืนฉบับร่าง',
                                        'จัดการข้อผิดพลาดและ Fallbacks',
                                        'สำรองข้อมูล (Firestore Backup)',
                                        'แสดงข้อความข้อผิดพลาดที่เข้าใจง่าย',
                                        'SLA 99.9% Uptime (Vercel/Firebase)',
                                    ]}
                                    color="teal"
                                />

                                {/* Scalability */}
                                <FeatureCard
                                    icon={Layers}
                                    title="ความสามารถในการขยาย (Scalability)"
                                    description="รองรับการเติบโตของระบบ"
                                    items={[
                                        'สถาปัตยกรรมแบบ Serverless',
                                        'ปรับขนาดอัตโนมัติผ่าน Vercel',
                                        'Firebase Auto-scaling',
                                        'กระจาย CDN ทั่วโลก',
                                        'โครงสร้างโค้ดแบบ Modular',
                                        'รองรับหลายหน่วยงาน (Multi-tenant Ready)',
                                    ]}
                                    color="sky"
                                />

                                {/* Maintainability */}
                                <FeatureCard
                                    icon={GitBranch}
                                    title="การบำรุงรักษา (Maintainability)"
                                    description="ความง่ายในการดูแลและพัฒนาต่อ"
                                    items={[
                                        'TypeScript Strict Mode',
                                        'ESLint และตรวจสอบคุณภาพโค้ด',
                                        'สถาปัตยกรรม Component แบบ Modular',
                                        'จัดการเวอร์ชันจากศูนย์กลาง',
                                        'บันทึกกิจกรรมครอบคลุม',
                                        'เอกสารประกอบโค้ดชัดเจน',
                                    ]}
                                    color="slate"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Technology Stack */}
                <TabsContent value="technology" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                <Code className="h-6 w-6" />
                                เทคโนโลยี (Technology Stack)
                            </CardTitle>
                            <CardDescription>
                                เทคโนโลยีที่ใช้ในการพัฒนาระบบ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Frontend */}
                                <TechCard
                                    title="Frontend"
                                    icon={Globe}
                                    items={[
                                        { name: 'Next.js 16', desc: 'React Framework with App Router' },
                                        { name: 'React 19', desc: 'UI Library with Concurrent Features' },
                                        { name: 'TypeScript 5', desc: 'Type-safe JavaScript' },
                                        { name: 'Tailwind CSS 4', desc: 'Utility-first CSS Framework' },
                                        { name: 'Radix UI', desc: 'Accessible UI Primitives' },
                                        { name: 'Lucide Icons', desc: 'Beautiful Icon Library' },
                                    ]}
                                    color="blue"
                                />

                                {/* Backend */}
                                <TechCard
                                    title="Backend"
                                    icon={Server}
                                    items={[
                                        { name: 'Firebase', desc: 'Backend-as-a-Service' },
                                        { name: 'Firestore', desc: 'NoSQL Document Database' },
                                        { name: 'Firebase Auth', desc: 'Authentication Service' },
                                        { name: 'Firebase Storage', desc: 'File Storage' },
                                        { name: 'Firebase RTDB', desc: 'Real-time Presence' },
                                        { name: 'Cloud Functions', desc: 'Serverless Functions (Optional)' },
                                    ]}
                                    color="orange"
                                />

                                {/* AI/ML */}
                                <TechCard
                                    title="AI/ML"
                                    icon={Cpu}
                                    items={[
                                        { name: 'Google Gemini', desc: 'Large Language Model' },
                                        { name: 'Vercel AI SDK', desc: 'AI Integration Library' },
                                        { name: 'Gemini 3.0 Flash', desc: 'Fast & Smart (Default)' },
                                        { name: 'Gemini 2.5 Pro', desc: 'Complex Analysis' },
                                        { name: 'Streaming AI', desc: 'Real-time Responses' },
                                        { name: 'Multimodal', desc: 'Text & Image Analysis' },
                                    ]}
                                    color="purple"
                                />

                                {/* State Management */}
                                <TechCard
                                    title="State Management"
                                    icon={Database}
                                    items={[
                                        { name: 'Zustand', desc: 'Lightweight State Management' },
                                        { name: 'React Context', desc: 'Auth & Global State' },
                                        { name: 'React Hooks', desc: 'Local Component State' },
                                        { name: 'Server State', desc: 'Firestore Real-time' },
                                    ]}
                                    color="green"
                                />

                                {/* Deployment */}
                                <TechCard
                                    title="Deployment"
                                    icon={Cloud}
                                    items={[
                                        { name: 'Vercel', desc: 'Hosting & Edge Network' },
                                        { name: 'GitHub', desc: 'Version Control' },
                                        { name: 'CI/CD', desc: 'Auto Deploy on Push' },
                                        { name: 'Edge Functions', desc: 'Serverless Compute' },
                                    ]}
                                    color="cyan"
                                />

                                {/* Libraries */}
                                <TechCard
                                    title="Key Libraries"
                                    icon={Layers}
                                    items={[
                                        { name: 'react-hook-form', desc: 'Form Management' },
                                        { name: 'zod', desc: 'Schema Validation' },
                                        { name: 'date-fns', desc: 'Date Utilities' },
                                        { name: 'xlsx', desc: 'Excel Import/Export' },
                                        { name: 'jspdf / @react-pdf/renderer', desc: 'PDF Generation' },
                                        { name: 'sonner', desc: 'Toast Notifications' },
                                    ]}
                                    color="pink"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Architecture Diagram */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-6 w-6 text-indigo-600" />
                                สถาปัตยกรรมระบบ (System Architecture)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Client</h4>
                                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">Next.js 16 + React 19</p>
                                        <p className="text-xs text-blue-500 dark:text-blue-400">Browser / PWA</p>
                                    </div>
                                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">Edge</h4>
                                        <p className="text-sm text-green-600 dark:text-green-300 mt-2">Vercel Edge</p>
                                        <p className="text-xs text-green-500 dark:text-green-400">CDN + Functions</p>
                                    </div>
                                    <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                        <h4 className="font-semibold text-orange-800 dark:text-orange-200">Backend</h4>
                                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-2">Firebase</p>
                                        <p className="text-xs text-orange-500 dark:text-orange-400">Auth + Firestore + Storage</p>
                                    </div>
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">AI</h4>
                                        <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">Google Gemini</p>
                                        <p className="text-xs text-purple-500 dark:text-purple-400">LLM + Multimodal</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Feature Card Component
function FeatureCard({
    icon: Icon,
    title,
    description,
    items,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    items: string[];
    color: string;
}) {
    const colorClasses: Record<string, { bg: string; border: string; icon: string; title: string }> = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600', title: 'text-blue-800 dark:text-blue-300' },
        green: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600', title: 'text-green-800 dark:text-green-300' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600', title: 'text-purple-800 dark:text-purple-300' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600', title: 'text-amber-800 dark:text-amber-300' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-200 dark:border-indigo-800', icon: 'text-indigo-600', title: 'text-indigo-800 dark:text-indigo-300' },
        cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-200 dark:border-cyan-800', icon: 'text-cyan-600', title: 'text-cyan-800 dark:text-cyan-300' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-600', title: 'text-emerald-800 dark:text-emerald-300' },
        rose: { bg: 'bg-rose-50 dark:bg-rose-950', border: 'border-rose-200 dark:border-rose-800', icon: 'text-rose-600', title: 'text-rose-800 dark:text-rose-300' },
        red: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600', title: 'text-red-800 dark:text-red-300' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600', title: 'text-orange-800 dark:text-orange-300' },
        violet: { bg: 'bg-violet-50 dark:bg-violet-950', border: 'border-violet-200 dark:border-violet-800', icon: 'text-violet-600', title: 'text-violet-800 dark:text-violet-300' },
        teal: { bg: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-800', icon: 'text-teal-600', title: 'text-teal-800 dark:text-teal-300' },
        sky: { bg: 'bg-sky-50 dark:bg-sky-950', border: 'border-sky-200 dark:border-sky-800', icon: 'text-sky-600', title: 'text-sky-800 dark:text-sky-300' },
        slate: { bg: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-600', title: 'text-slate-800 dark:text-slate-300' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600', title: 'text-pink-800 dark:text-pink-300' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`p-6 rounded-lg border ${colors.bg} ${colors.border}`}>
            <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-8 w-8 ${colors.icon}`} />
                <div>
                    <h3 className={`font-semibold text-lg ${colors.title}`}>{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <ul className="space-y-2 text-sm">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Tech Card Component
function TechCard({
    title,
    icon: Icon,
    items,
    color,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: { name: string; desc: string }[];
    color: string;
}) {
    const colorClasses: Record<string, { bg: string; border: string; icon: string; title: string }> = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600', title: 'text-blue-800 dark:text-blue-300' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600', title: 'text-orange-800 dark:text-orange-300' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600', title: 'text-purple-800 dark:text-purple-300' },
        green: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600', title: 'text-green-800 dark:text-green-300' },
        cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-200 dark:border-cyan-800', icon: 'text-cyan-600', title: 'text-cyan-800 dark:text-cyan-300' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600', title: 'text-pink-800 dark:text-pink-300' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`p-6 rounded-lg border ${colors.bg} ${colors.border}`}>
            <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-6 w-6 ${colors.icon}`} />
                <h3 className={`font-semibold text-lg ${colors.title}`}>{title}</h3>
            </div>
            <ul className="space-y-3 text-sm">
                {items.map((item, idx) => (
                    <li key={idx}>
                        <span className="font-medium">{item.name}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
