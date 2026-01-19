'use client';

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
} from 'lucide-react';

export default function AboutPage() {
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
                        Version 1.4.0
                    </Badge>
                    <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                        Released: 19 มกราคม 2569
                    </Badge>
                </div>
            </div>

            {/* Version 1.4.0 Features */}
            <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-800">
                        <Sparkles className="h-6 w-6" />
                        ฟีเจอร์ใหม่ใน Version 1.4.0
                    </CardTitle>
                    <CardDescription className="text-indigo-700">
                        ระบบจัดการผู้ใช้งานขั้นสูงและการบันทึกกิจกรรม
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Activity Logging */}
                        <div className="bg-white p-6 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <h3 className="font-semibold text-lg">Activity Logging System</h3>
                                    <p className="text-sm text-muted-foreground">
                                        ระบบบันทึกกิจกรรมแบบครอบคลุม
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>บันทึก Login/Logout อัตโนมัติ</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>ติดตาม CRUD operations ทุกประเภท</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>บันทึก File Upload/Download</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>ดูประวัติ Activity พร้อม Filters ขั้นสูง</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Export Activity Logs เป็น CSV</span>
                                </li>
                            </ul>
                        </div>

                        {/* Enhanced User Management */}
                        <div className="bg-white p-6 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="h-8 w-8 text-indigo-600" />
                                <div>
                                    <h3 className="font-semibold text-lg">Enhanced User Management</h3>
                                    <p className="text-sm text-muted-foreground">
                                        จัดการผู้ใช้งานแบบขั้นสูง
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Tabs แยกตามสถานะ (Pending, Approved, Disabled, Rejected)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Filters ขั้นสูง (Unit Category, Unit Name, Region)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Bulk Approve/Reject หลายคนพร้อมกัน</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Sorting ตามชื่อหรือวันที่สมัคร</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Export ข้อมูลผู้ใช้เป็น CSV</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Version 1.3.0 Features */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        ฟีเจอร์หลักของระบบ (v1.3.0+)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Assessment Cycle Management */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                <h3 className="font-semibold">Assessment Cycle Management</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• สร้างรอบการประเมินตามปี พ.ศ.</li>
                                <li>• เลือกหมวดที่ต้องการประเมิน (1-7)</li>
                                <li>• กำหนดคะแนนเป้าหมาย</li>
                                <li>• มีเพียง 1 รอบ Active พร้อมกัน</li>
                            </ul>
                        </div>

                        {/* User Profile & Account Management */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-6 w-6 text-green-600" />
                                <h3 className="font-semibold">User Profile Management</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• แก้ไขข้อมูลโปรไฟล์ส่วนตัว</li>
                                <li>• Soft Delete Account (ปิดการใช้งาน)</li>
                                <li>• Admin เปิดใช้งานใหม่ได้</li>
                                <li>• Avatar clickable → Profile page</li>
                            </ul>
                        </div>

                        {/* Network Mapper */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Map className="h-6 w-6 text-purple-600" />
                                <h3 className="font-semibold">Network Mapper</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• จัดการโครงสร้างหน่วยงาน</li>
                                <li>• รองรับ 5 ประเภทหน่วยงาน</li>
                                <li>• 4 ภูมิภาค (GORMN)</li>
                                <li>• Aggregation rules</li>
                            </ul>
                        </div>

                        {/* Owner Matrix */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-6 w-6 text-orange-600" />
                                <h3 className="font-semibold">Owner Matrix</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• มอบหมายผู้รับผิดชอบหมวด 1-7</li>
                                <li>• กำหนด Data Owner</li>
                                <li>• ติดตาม ownership matrix</li>
                            </ul>
                        </div>

                        {/* RBAC System */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="h-6 w-6 text-red-600" />
                                <h3 className="font-semibold">RBAC System</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• 7 บทบาท (Super Admin → Read Only)</li>
                                <li>• ProtectedRoute components</li>
                                <li>• Permission-based access control</li>
                                <li>• Hierarchical permissions</li>
                            </ul>
                        </div>

                        {/* AI Configuration */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="h-6 w-6 text-pink-600" />
                                <h3 className="font-semibold">AI Configuration</h3>
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• ตั้งค่า Google Gemini AI</li>
                                <li>• เลือกโมเดล AI</li>
                                <li>• Test AI connection</li>
                                <li>• Encrypted API key storage</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                <li>Next.js 16.1.3</li>
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
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <ClipboardCheck className="h-6 w-6" />
                        Roadmap - ฟีเจอร์ที่กำลังพัฒนา
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-600 font-semibold min-w-[80px]">Phase ถัดไป:</span>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Assessment Roadmap/Flow Visualization</li>
                                <li>• Cycle Selector ใน Dashboard/Header</li>
                                <li>• Dashboard แสดงสถิติจริงจาก Database</li>
                                <li>• Notification System</li>
                                <li>• File Upload/Download Tracking</li>
                            </ul>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-600 font-semibold min-w-[80px]">Long-term:</span>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Export/Import Data (Excel, PDF)</li>
                                <li>• Version Control สำหรับ SAR</li>
                                <li>• Mobile Responsive Improvements</li>
                                <li>• Dark Mode</li>
                                <li>• Advanced Analytics & Reporting</li>
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
