'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Users,
    Calendar,
    Activity,
    FileText,
    Map,
    Settings,
    BarChart3,
    ShieldCheck,
    ClipboardCheck,
    Database,
    Sparkles,
    LayoutDashboard,
    Zap,
    Code,
    Bell,
    RefreshCw,
    Layout,
    Megaphone,
    Download,
    MessageSquare,
    Palette,
    Compass,
} from 'lucide-react';
import { APP_VERSION } from '@/config/version';

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Users': Users,
    'ShieldCheck': ShieldCheck,
    'LayoutDashboard': LayoutDashboard,
    'Calendar': Calendar,
    'Activity': Activity,
    'FileText': FileText,
    'Map': Map,
    'Settings': Settings,
    'Sparkles': Sparkles,
    'Code': Code,
    'Zap': Zap,
    'Bell': Bell,
    'RefreshCw': RefreshCw,
    'Layout': Layout,
    'Megaphone': Megaphone,
    'Download': Download,
    'MessageSquare': MessageSquare,
    'Palette': Palette,
    'Compass': Compass,
};

// Color schemes for version cards
const versionColors = [
    { border: 'border-blue-200', bg: 'bg-blue-50', title: 'text-blue-800', desc: 'text-blue-700', card: 'border-blue-200', icon: 'text-blue-600' },
    { border: 'border-slate-200', bg: 'bg-slate-50', title: 'text-slate-800', desc: 'text-slate-700', card: 'border-slate-200', icon: 'text-slate-600' },
    { border: 'border-purple-200', bg: 'bg-purple-50', title: 'text-purple-800', desc: 'text-purple-700', card: 'border-purple-200', icon: 'text-purple-600' },
    { border: 'border-emerald-200', bg: 'bg-emerald-50', title: 'text-emerald-800', desc: 'text-emerald-700', card: 'border-emerald-200', icon: 'text-emerald-600' },
    { border: 'border-cyan-200', bg: 'bg-cyan-50', title: 'text-cyan-800', desc: 'text-cyan-700', card: 'border-cyan-200', icon: 'text-cyan-600' },
    { border: 'border-indigo-200', bg: 'bg-indigo-50', title: 'text-indigo-800', desc: 'text-indigo-700', card: 'border-indigo-200', icon: 'text-indigo-600' },
];

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
                <h1 className="text-4xl font-bold text-slate-800">
                    ระบบประเมิน PMQA 4.0 <br />
                    กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                    PMQA ISOC System - ระบบบริหารจัดการคุณภาพองค์กรภาครัฐแบบครบวงจร
                    สำหรับการประเมิน PMQA 4.0 พร้อมเครื่องมือ AI ช่วยวิเคราะห์
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        Version {APP_VERSION.version}
                    </Badge>
                    <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                        Released: {APP_VERSION.releaseDate}
                    </Badge>
                </div>
            </div>

            {/* Dynamic Version Features Cards */}
            {versionKeys.map((versionKey, idx) => {
                const release = APP_VERSION.releases[versionKey as keyof typeof APP_VERSION.releases];
                const colors = versionColors[idx % versionColors.length];
                const isCurrentVersion = versionKey === `v${APP_VERSION.version}`;

                return (
                    <Card key={versionKey} className={`${colors.border} ${colors.bg}`}>
                        <CardHeader>
                            <CardTitle className={`flex items-center gap-2 ${colors.title}`}>
                                <Sparkles className="h-6 w-6" />
                                {isCurrentVersion ? `ฟีเจอร์ใหม่ใน ${versionKey}` : `${versionKey} Features`}
                            </CardTitle>
                            <CardDescription className={colors.desc}>
                                {release.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {release.features.map((feature, featureIdx) => {
                                    const IconComponent = iconMap[feature.icon] || ShieldCheck;
                                    return (
                                        <div key={featureIdx} className={`bg-white p-6 rounded-lg border ${colors.card}`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                                                <div>
                                                    <h3 className="font-semibold text-lg">{feature.category}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2 text-sm">
                                                {feature.items.map((item, itemIdx) => (
                                                    <li key={itemIdx} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Tech Stack */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-slate-600" />
                        เทคโนโลยีที่ใช้พัฒนา
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <h4 className="font-semibold mb-2">Frontend</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Next.js 16</li>
                                <li>React 19</li>
                                <li>TypeScript 5</li>
                                <li>Tailwind CSS 4</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <h4 className="font-semibold mb-2">Backend</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Firebase</li>
                                <li>Firestore</li>
                                <li>Firebase Auth</li>
                                <li>Storage</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <h4 className="font-semibold mb-2">State Management</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Zustand</li>
                                <li>React Hooks</li>
                                <li>Server State</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <h4 className="font-semibold mb-2">AI/ML</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Google Gemini</li>
                                <li>Vercel AI SDK</li>
                                <li>Streaming AI</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* PMQA Categories */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        7 หมวดการประเมิน PMQA 4.0
                    </CardTitle>
                    <CardDescription>
                        ระบบรองรับการประเมินทั้ง 7 หมวด ตามเกณฑ์ PMQA 4.0
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                            <h4 className="font-semibold text-blue-900">หมวด 1: การนำองค์กร</h4>
                            <p className="text-sm text-blue-700">Leadership & Strategic Direction</p>
                        </div>
                        <div className="p-4 border-l-4 border-green-500 bg-green-50">
                            <h4 className="font-semibold text-green-900">หมวด 2: การวางแผนเชิงยุทธศาสตร์</h4>
                            <p className="text-sm text-green-700">Strategic Planning</p>
                        </div>
                        <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                            <h4 className="font-semibold text-yellow-900">หมวด 3: การให้ความสำคัญกับผู้รับบริการ</h4>
                            <p className="text-sm text-yellow-700">Customer Focus</p>
                        </div>
                        <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                            <h4 className="font-semibold text-purple-900">
                                หมวด 4: การวัด การวิเคราะห์ และการจัดการความรู้
                            </h4>
                            <p className="text-sm text-purple-700">Measurement, Analysis & KM</p>
                        </div>
                        <div className="p-4 border-l-4 border-red-500 bg-red-50">
                            <h4 className="font-semibold text-red-900">หมวด 5: การมุ่งเน้นบุคลากร</h4>
                            <p className="text-sm text-red-700">Workforce Focus</p>
                        </div>
                        <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
                            <h4 className="font-semibold text-indigo-900">หมวด 6: การมุ่งเน้นระบบปฏิบัติการ</h4>
                            <p className="text-sm text-indigo-700">Operations Focus</p>
                        </div>
                        <div className="p-4 border-l-4 border-pink-500 bg-pink-50 md:col-span-2">
                            <h4 className="font-semibold text-pink-900">หมวด 7: ผลลัพธ์</h4>
                            <p className="text-sm text-pink-700">Results</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Future Roadmap */}
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                        <ClipboardCheck className="h-6 w-6" />
                        Roadmap - ความคืบหน้า
                    </CardTitle>
                    <CardDescription className="text-yellow-700 dark:text-yellow-400">
                        อัปเดต: 21 มกราคม 2569
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 font-semibold min-w-[100px]">✅ เสร็จแล้ว:</span>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• 🚀 <strong>v3.0.2</strong> ปุ่ม Dark Mode & หน้าสรุปฟีเจอร์</li>
                                <li>• 📤 นำเข้าผู้ใช้จำนวนมาก (Bulk Import Users)</li>
                                <li>• 📧 ระบบแจ้งเตือนอีเมล (Email Notifications)</li>
                                <li>• 🏷️ Smart Evidence Tagging & Chat RAG</li>
                                <li>• 📊 Predictive Scoring & Leaderboard</li>
                                <li>• 👥 Live Collaboration (Real-time Presence)</li>
                                <li>• 📚 Interactive eBook Export</li>
                                <li>• 🌙 Dark Mode & Theme Settings</li>
                                <li>• 💬 Comments & @Mentions System</li>
                                <li>• 🔍 Global Search (Cmd/Ctrl+K)</li>
                                <li>• 📅 Google Calendar Sync</li>
                            </ul>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-semibold min-w-[100px]">ระยะยาว:</span>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• 📊 รายงานอัตโนมัติ (Scheduled Reports)</li>
                                <li>• 📱 PWA / Offline Support</li>
                                <li>• 🏆 เปรียบเทียบข้ามหน่วยงาน (Cross-Agency Benchmarking)</li>
                                <li>• 📲 Mobile App (iOS/Android)</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t">
                <p className="font-semibold text-slate-800">
                    PMQA ISOC System - Development Team
                </p>
                <p>กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร</p>
                <p>© 2026 All Rights Reserved</p>
            </div>
        </div>
    );
}
