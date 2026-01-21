'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    History,
    Palette,
    ClipboardCheck,
    Upload,
    Mail,
    Wrench,
    BarChart3,
    Compass,
    Shield,
    Map,
    Layout,
    Megaphone,
    Activity,
    Settings,
    Bell,
} from 'lucide-react';
import { APP_VERSION } from '@/config/version';

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Users': Users,
    'ShieldCheck': ShieldCheck,
    'LayoutDashboard': LayoutDashboard,
    'Calendar': Calendar,
    'FileText': FileText,
    'Sparkles': Sparkles,
    'Code': Code,
    'Zap': Zap,
    'MessageSquare': MessageSquare,
    'Search': Search,
    'Lock': Lock,
    'Eye': Eye,
    'RefreshCw': RefreshCw,
    'Layers': Layers,
    'GitBranch': GitBranch,
    'Globe': Globe,
    'Server': Server,
    'Cpu': Cpu,
    'Cloud': Cloud,
    'Database': Database,
    'BookOpen': BookOpen,
    'Palette': Palette,
    'ClipboardCheck': ClipboardCheck,
    'Upload': Upload,
    'Mail': Mail,
    'Wrench': Wrench,
    'BarChart3': BarChart3,
    'Compass': Compass,
    'Shield': Shield,
    'Map': Map,
    'Layout': Layout,
    'Megaphone': Megaphone,
    'Activity': Activity,
    'Settings': Settings,
    'Bell': Bell,
};

// Functional Features Data
const functionalFeatures = [
    {
        id: 'user-management',
        icon: Users,
        title: 'การจัดการผู้ใช้งาน (User Management)',
        description: 'จัดการผู้ใช้งานแบบครบวงจร',
        color: 'blue',
        items: [
            'เข้าสู่ระบบด้วย Google OAuth',
            'ควบคุมสิทธิ์ตามบทบาท (Admin/Reviewer/Editor/Viewer)',
            'กระบวนการอนุมัติผู้ใช้ใหม่',
            'นำเข้าผู้ใช้จำนวนมากจาก Excel/CSV',
            'หน้าโปรไฟล์และการตั้งค่า',
            'บันทึกประวัติการใช้งาน (Activity Log)',
        ],
    },
    {
        id: 'evidence-management',
        icon: FileText,
        title: 'การจัดการหลักฐาน (Evidence Management)',
        description: 'จัดการหลักฐานประกอบการประเมิน',
        color: 'green',
        items: [
            'อัปโหลดหลักฐานหลายไฟล์พร้อมกัน',
            'ระบบจัดการเวอร์ชันไฟล์ (File Versioning)',
            'ติดแท็กอัจฉริยะด้วย AI (Smart Tagging)',
            'กระบวนการตรวจสอบหลักฐาน',
            'จัดหมวดหมู่ตาม PMQA 7 หมวด',
            'ดาวน์โหลดและส่งออกหลักฐาน',
        ],
    },
    {
        id: 'sar-writing',
        icon: BookOpen,
        title: 'เขียนรายงาน SAR (SAR Writer)',
        description: 'เครื่องมือเขียนรายงานประเมินตนเอง',
        color: 'purple',
        items: [
            'ตัวแก้ไขข้อความขั้นสูง (Rich Text Editor)',
            'ผู้ช่วยเขียนด้วย AI (ปรับภาษาทางการ)',
            'ระบบแม่แบบ (Template)',
            'บันทึกอัตโนมัติและฉบับร่าง',
            'ความคิดเห็นและ @Mentions',
            'ส่งออกเป็น PDF/HTML',
        ],
    },
    {
        id: 'ai-capabilities',
        icon: Sparkles,
        title: 'ความสามารถ AI (AI Capabilities)',
        description: 'ใช้ AI ช่วยวิเคราะห์และทำงาน',
        color: 'amber',
        items: [
            'วิเคราะห์เชิงกลยุทธ์ (SWOT Analysis)',
            'พยากรณ์คะแนน (Predictive Scoring)',
            'วิเคราะห์แนวโน้ม (Trend Analysis)',
            'ถาม-ตอบเกณฑ์ PMQA (Chat RAG)',
            'ผู้ช่วยตอบคำถาม (Q&A Assistant)',
            'ติดแท็กหลักฐานอัตโนมัติ',
        ],
    },
    {
        id: 'dashboard-analytics',
        icon: LayoutDashboard,
        title: 'แดชบอร์ดและการวิเคราะห์ (Dashboard & Analytics)',
        description: 'ภาพรวมและการวิเคราะห์ข้อมูล',
        color: 'indigo',
        items: [
            'แดชบอร์ดแบบเรียลไทม์',
            'ติดตามความคืบหน้า 8 Phase',
            'ตารางจัดอันดับหน่วยงาน (Leaderboard)',
            'เปรียบเทียบรอบประเมิน',
            'ส่งออกแดชบอร์ด (CSV/HTML)',
            'ประกาศข่าวสารบนแดชบอร์ด',
        ],
    },
    {
        id: 'collaboration',
        icon: MessageSquare,
        title: 'การทำงานร่วมกัน (Collaboration)',
        description: 'เครื่องมือสนับสนุนการทำงานเป็นทีม',
        color: 'cyan',
        items: [
            'แสดงผู้ใช้ออนไลน์แบบเรียลไทม์ (Live Presence)',
            'ระบบความคิดเห็น (Comments)',
            '@Mentions และการแจ้งเตือน',
            'ศูนย์การแจ้งเตือนในแอป',
            'แจ้งเตือนทางอีเมล',
            'ซิงค์ Google Calendar',
        ],
    },
    {
        id: 'cycle-management',
        icon: Calendar,
        title: 'การจัดการรอบประเมิน (Cycle Management)',
        description: 'จัดการรอบการประเมิน PMQA',
        color: 'emerald',
        items: [
            'สร้างและจัดการรอบประเมิน',
            'กำหนดวันเริ่มต้น-สิ้นสุด',
            'เลือกรอบที่ใช้งานอัตโนมัติ',
            'เปรียบเทียบรอบประเมิน',
            'เชื่อมต่อกับ Calendar',
            'แจ้งเตือนก่อนถึงกำหนด',
        ],
    },
    {
        id: 'search-navigation',
        icon: Search,
        title: 'การค้นหาและนำทาง (Search & Navigation)',
        description: 'ค้นหาข้อมูลและนำทางภายในระบบ',
        color: 'rose',
        items: [
            'ค้นหาทั่วทั้งระบบ (Cmd/Ctrl+K)',
            'ค้นหา Evidence, SAR, Users, KPI',
            'กรองและเรียงลำดับผลลัพธ์',
            'ไฮไลท์คำที่ค้นพบ',
            'แผนผังกระบวนการประเมิน (Roadmap)',
            'นำทางอย่างรวดเร็ว',
        ],
    },
];

// Non-Functional Features Data
const nonFunctionalFeatures = [
    {
        id: 'security',
        icon: Lock,
        title: 'ความปลอดภัย (Security)',
        description: 'ปกป้องข้อมูลและควบคุมการเข้าถึง',
        color: 'red',
        items: [
            'ยืนยันตัวตนด้วย Google OAuth 2.0',
            'ควบคุมสิทธิ์ตามบทบาท (RBAC)',
            'กฎความปลอดภัย Firestore',
            'บันทึกกิจกรรมไม่สามารถแก้ไขได้',
            'การจัดการเซสชัน',
            'เข้ารหัสข้อมูลทั้งขณะจัดเก็บและส่งข้อมูล',
        ],
    },
    {
        id: 'performance',
        icon: Zap,
        title: 'ประสิทธิภาพ (Performance)',
        description: 'ความเร็วและความสามารถในการทำงาน',
        color: 'orange',
        items: [
            'Next.js 16 พร้อม Turbopack',
            'React 19 Concurrent Features',
            'ซิงค์ข้อมูลแบบเรียลไทม์',
            'อัปเดต UI แบบ Optimistic',
            'โหลดแบบ Lazy และแยกโค้ด (Code Splitting)',
            'แคชที่ Edge ผ่าน Vercel',
        ],
    },
    {
        id: 'usability',
        icon: Eye,
        title: 'ความง่ายในการใช้งาน (Usability)',
        description: 'ประสบการณ์ผู้ใช้ที่ดี',
        color: 'violet',
        items: [
            'ออกแบบ Responsive (มือถือ/แท็บเล็ต/เดสก์ท็อป)',
            'รองรับ Dark Mode',
            'อินเทอร์เฟซภาษาไทย',
            'แนะนำการใช้งานสำหรับผู้ใช้ใหม่ (Onboarding)',
            'ปุ่มลัด (Keyboard Shortcuts)',
            'UI Components ที่เข้าถึงได้ (Accessible)',
        ],
    },
    {
        id: 'reliability',
        icon: RefreshCw,
        title: 'ความน่าเชื่อถือ (Reliability)',
        description: 'ความเสถียรและการกู้คืน',
        color: 'teal',
        items: [
            'Firebase High Availability',
            'บันทึกอัตโนมัติและกู้คืนฉบับร่าง',
            'จัดการข้อผิดพลาดและ Fallbacks',
            'สำรองข้อมูล (Firestore Backup)',
            'แสดงข้อความข้อผิดพลาดที่เข้าใจง่าย',
            'SLA 99.9% Uptime (Vercel/Firebase)',
        ],
    },
    {
        id: 'scalability',
        icon: Layers,
        title: 'ความสามารถในการขยาย (Scalability)',
        description: 'รองรับการเติบโตของระบบ',
        color: 'sky',
        items: [
            'สถาปัตยกรรมแบบ Serverless',
            'ปรับขนาดอัตโนมัติผ่าน Vercel',
            'Firebase Auto-scaling',
            'กระจาย CDN ทั่วโลก',
            'โครงสร้างโค้ดแบบ Modular',
            'รองรับหลายหน่วยงาน (Multi-tenant Ready)',
        ],
    },
    {
        id: 'maintainability',
        icon: GitBranch,
        title: 'การบำรุงรักษา (Maintainability)',
        description: 'ความง่ายในการดูแลและพัฒนาต่อ',
        color: 'slate',
        items: [
            'TypeScript Strict Mode',
            'ESLint และตรวจสอบคุณภาพโค้ด',
            'สถาปัตยกรรม Component แบบ Modular',
            'จัดการเวอร์ชันจากศูนย์กลาง',
            'บันทึกกิจกรรมครอบคลุม',
            'เอกสารประกอบโค้ดชัดเจน',
        ],
    },
];

// Technology Stack Data
const technologyStack = [
    {
        id: 'frontend',
        title: 'Frontend',
        icon: Globe,
        color: 'blue',
        items: [
            { name: 'Next.js 16', desc: 'React Framework with App Router' },
            { name: 'React 19', desc: 'UI Library with Concurrent Features' },
            { name: 'TypeScript 5', desc: 'Type-safe JavaScript' },
            { name: 'Tailwind CSS 4', desc: 'Utility-first CSS Framework' },
            { name: 'Radix UI', desc: 'Accessible UI Primitives' },
            { name: 'Lucide Icons', desc: 'Beautiful Icon Library' },
        ],
    },
    {
        id: 'backend',
        title: 'Backend',
        icon: Server,
        color: 'orange',
        items: [
            { name: 'Firebase', desc: 'Backend-as-a-Service' },
            { name: 'Firestore', desc: 'NoSQL Document Database' },
            { name: 'Firebase Auth', desc: 'Authentication Service' },
            { name: 'Firebase Storage', desc: 'File Storage' },
            { name: 'Firebase RTDB', desc: 'Real-time Presence' },
            { name: 'Cloud Functions', desc: 'Serverless Functions (Optional)' },
        ],
    },
    {
        id: 'ai-ml',
        title: 'AI/ML',
        icon: Cpu,
        color: 'purple',
        items: [
            { name: 'Google Gemini', desc: 'Large Language Model' },
            { name: 'Vercel AI SDK', desc: 'AI Integration Library' },
            { name: 'Gemini 3.0 Flash', desc: 'Fast & Smart (Default)' },
            { name: 'Gemini 2.5 Pro', desc: 'Complex Analysis' },
            { name: 'Streaming AI', desc: 'Real-time Responses' },
            { name: 'Multimodal', desc: 'Text & Image Analysis' },
        ],
    },
    {
        id: 'state-management',
        title: 'State Management',
        icon: Database,
        color: 'green',
        items: [
            { name: 'Zustand', desc: 'Lightweight State Management' },
            { name: 'React Context', desc: 'Auth & Global State' },
            { name: 'React Hooks', desc: 'Local Component State' },
            { name: 'Server State', desc: 'Firestore Real-time' },
        ],
    },
    {
        id: 'deployment',
        title: 'Deployment',
        icon: Cloud,
        color: 'cyan',
        items: [
            { name: 'Vercel', desc: 'Hosting & Edge Network' },
            { name: 'GitHub', desc: 'Version Control' },
            { name: 'CI/CD', desc: 'Auto Deploy on Push' },
            { name: 'Edge Functions', desc: 'Serverless Compute' },
        ],
    },
    {
        id: 'libraries',
        title: 'Key Libraries',
        icon: Layers,
        color: 'pink',
        items: [
            { name: 'react-hook-form', desc: 'Form Management' },
            { name: 'zod', desc: 'Schema Validation' },
            { name: 'date-fns', desc: 'Date Utilities' },
            { name: 'xlsx', desc: 'Excel Import/Export' },
            { name: 'jspdf / @react-pdf/renderer', desc: 'PDF Generation' },
            { name: 'sonner', desc: 'Toast Notifications' },
        ],
    },
];

// Color utilities
const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; title: string }> = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400', title: 'text-blue-800 dark:text-blue-300' },
        green: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400', title: 'text-green-800 dark:text-green-300' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600 dark:text-purple-400', title: 'text-purple-800 dark:text-purple-300' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600 dark:text-amber-400', title: 'text-amber-800 dark:text-amber-300' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-200 dark:border-indigo-800', icon: 'text-indigo-600 dark:text-indigo-400', title: 'text-indigo-800 dark:text-indigo-300' },
        cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-200 dark:border-cyan-800', icon: 'text-cyan-600 dark:text-cyan-400', title: 'text-cyan-800 dark:text-cyan-300' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-600 dark:text-emerald-400', title: 'text-emerald-800 dark:text-emerald-300' },
        rose: { bg: 'bg-rose-50 dark:bg-rose-950', border: 'border-rose-200 dark:border-rose-800', icon: 'text-rose-600 dark:text-rose-400', title: 'text-rose-800 dark:text-rose-300' },
        red: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600 dark:text-red-400', title: 'text-red-800 dark:text-red-300' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', title: 'text-orange-800 dark:text-orange-300' },
        violet: { bg: 'bg-violet-50 dark:bg-violet-950', border: 'border-violet-200 dark:border-violet-800', icon: 'text-violet-600 dark:text-violet-400', title: 'text-violet-800 dark:text-violet-300' },
        teal: { bg: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-800', icon: 'text-teal-600 dark:text-teal-400', title: 'text-teal-800 dark:text-teal-300' },
        sky: { bg: 'bg-sky-50 dark:bg-sky-950', border: 'border-sky-200 dark:border-sky-800', icon: 'text-sky-600 dark:text-sky-400', title: 'text-sky-800 dark:text-sky-300' },
        slate: { bg: 'bg-slate-100 dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-600 dark:text-slate-400', title: 'text-slate-800 dark:text-slate-300' },
        pink: { bg: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600 dark:text-pink-400', title: 'text-pink-800 dark:text-pink-300' },
    };
    return colorMap[color] || colorMap.blue;
};

export default function AboutPage() {
    // Get version keys sorted descending
    const versionKeys = Object.keys(APP_VERSION.releases).sort((a, b) => {
        const aNum = parseFloat(a.replace('v', ''));
        const bNum = parseFloat(b.replace('v', ''));
        return bNum - aNum;
    });

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                    ระบบประเมิน PMQA 4.0 <br />
                    กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    PMQA ISOC System - ระบบบริหารจัดการคุณภาพองค์กรภาครัฐแบบครบวงจร
                    สำหรับการประเมิน PMQA 4.0 พร้อมเครื่องมือ AI ช่วยวิเคราะห์
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        Version {APP_VERSION.version}
                    </Badge>
                    <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Released: {APP_VERSION.releaseDate}
                    </Badge>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="functional" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="functional" className="text-sm md:text-base">
                        <Zap className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Functional</span>
                        <span className="sm:hidden">Func.</span>
                    </TabsTrigger>
                    <TabsTrigger value="non-functional" className="text-sm md:text-base">
                        <ShieldCheck className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Non-Functional</span>
                        <span className="sm:hidden">Non-Func.</span>
                    </TabsTrigger>
                    <TabsTrigger value="technology" className="text-sm md:text-base">
                        <Code className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Technology</span>
                        <span className="sm:hidden">Tech</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm md:text-base">
                        <History className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Dev History</span>
                        <span className="sm:hidden">History</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Functional Features */}
                <TabsContent value="functional" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Zap className="h-6 w-6" />
                                ความต้องการเชิงหน้าที่ (Functional Requirements)
                            </CardTitle>
                            <CardDescription>
                                ฟังก์ชันการทำงานหลักของระบบ PMQA ISOC - คลิกที่หมวดหมู่เพื่อดูรายละเอียด
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {functionalFeatures.map((feature) => {
                                    const colors = getColorClasses(feature.color);
                                    const Icon = feature.icon;
                                    return (
                                        <AccordionItem key={feature.id} value={feature.id} className={`border rounded-lg mb-3 ${colors.border} ${colors.bg}`}>
                                            <AccordionTrigger className="px-4 hover:no-underline">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                                                    <div className="text-left">
                                                        <h3 className={`font-semibold ${colors.title}`}>{feature.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <ul className="space-y-2 text-sm ml-9">
                                                    {feature.items.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                            <span className="text-foreground">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Non-Functional Features */}
                <TabsContent value="non-functional" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <ShieldCheck className="h-6 w-6" />
                                ความต้องการเชิงคุณภาพ (Non-Functional Requirements)
                            </CardTitle>
                            <CardDescription>
                                คุณสมบัติด้านประสิทธิภาพ ความปลอดภัย และการใช้งาน - คลิกที่หมวดหมู่เพื่อดูรายละเอียด
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {nonFunctionalFeatures.map((feature) => {
                                    const colors = getColorClasses(feature.color);
                                    const Icon = feature.icon;
                                    return (
                                        <AccordionItem key={feature.id} value={feature.id} className={`border rounded-lg mb-3 ${colors.border} ${colors.bg}`}>
                                            <AccordionTrigger className="px-4 hover:no-underline">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                                                    <div className="text-left">
                                                        <h3 className={`font-semibold ${colors.title}`}>{feature.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <ul className="space-y-2 text-sm ml-9">
                                                    {feature.items.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                            <span className="text-foreground">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Technology */}
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
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {technologyStack.map((tech) => {
                                    const colors = getColorClasses(tech.color);
                                    const Icon = tech.icon;
                                    return (
                                        <div key={tech.id} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon className={`h-5 w-5 ${colors.icon}`} />
                                                <h3 className={`font-semibold ${colors.title}`}>{tech.title}</h3>
                                            </div>
                                            <ul className="space-y-2 text-sm">
                                                {tech.items.map((item, idx) => (
                                                    <li key={idx}>
                                                        <span className="font-medium text-foreground">{item.name}</span>
                                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Architecture Diagram */}
                            <div className="mt-6 p-6 bg-muted rounded-lg">
                                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    สถาปัตยกรรมระบบ (System Architecture)
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <h5 className="font-semibold text-blue-800 dark:text-blue-200">Client</h5>
                                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">Next.js 16 + React 19</p>
                                        <p className="text-xs text-blue-500 dark:text-blue-400">Browser / PWA</p>
                                    </div>
                                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <h5 className="font-semibold text-green-800 dark:text-green-200">Edge</h5>
                                        <p className="text-sm text-green-600 dark:text-green-300 mt-2">Vercel Edge</p>
                                        <p className="text-xs text-green-500 dark:text-green-400">CDN + Functions</p>
                                    </div>
                                    <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                        <h5 className="font-semibold text-orange-800 dark:text-orange-200">Backend</h5>
                                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-2">Firebase</p>
                                        <p className="text-xs text-orange-500 dark:text-orange-400">Auth + Firestore + Storage</p>
                                    </div>
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <h5 className="font-semibold text-purple-800 dark:text-purple-200">AI</h5>
                                        <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">Google Gemini</p>
                                        <p className="text-xs text-purple-500 dark:text-purple-400">LLM + Multimodal</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 4: Development History */}
                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <History className="h-6 w-6" />
                                ประวัติการพัฒนา (Development History)
                            </CardTitle>
                            <CardDescription>
                                ประวัติการพัฒนาทั้งหมด {versionKeys.length} เวอร์ชัน - คลิกที่เวอร์ชันเพื่อดูรายละเอียด
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {versionKeys.map((versionKey, idx) => {
                                    const release = APP_VERSION.releases[versionKey as keyof typeof APP_VERSION.releases];
                                    const isCurrentVersion = versionKey === `v${APP_VERSION.version}`;

                                    return (
                                        <AccordionItem
                                            key={versionKey}
                                            value={versionKey}
                                            className={`border rounded-lg mb-3 ${isCurrentVersion
                                                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                                                : 'border-border bg-card'
                                                }`}
                                        >
                                            <AccordionTrigger className="px-4 hover:no-underline">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Badge
                                                        variant={isCurrentVersion ? "default" : "outline"}
                                                        className={isCurrentVersion ? "bg-green-600" : ""}
                                                    >
                                                        {versionKey}
                                                    </Badge>
                                                    <div className="text-left flex-1">
                                                        <h3 className="font-semibold text-foreground">
                                                            {release.title}
                                                            {isCurrentVersion && (
                                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">(เวอร์ชันปัจจุบัน)</span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">{release.date}</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    {release.features.map((feature, featureIdx) => {
                                                        const IconComponent = iconMap[feature.icon] || ShieldCheck;
                                                        return (
                                                            <div key={featureIdx} className="bg-background p-4 rounded-lg border border-border">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <IconComponent className="h-5 w-5 text-primary" />
                                                                    <div>
                                                                        <h4 className="font-medium text-foreground">{feature.category}</h4>
                                                                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-1 text-sm">
                                                                    {feature.items.map((item, itemIdx) => (
                                                                        <li key={itemIdx} className="flex items-start gap-2">
                                                                            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                                                                            <span className="text-muted-foreground">{item}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t border-border">
                <p className="font-semibold text-foreground">
                    PMQA ISOC System - Development Team
                </p>
                <p>กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร</p>
                <p>© 2026 All Rights Reserved</p>
            </div>
        </div>
    );
}
