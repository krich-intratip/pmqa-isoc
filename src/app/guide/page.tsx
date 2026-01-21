'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Book, FileText, LayoutDashboard, Database,
    BarChart3, PenTool, CheckCircle2, ShieldCheck,
    Users, Presentation, Sparkles, AlertCircle, HelpCircle,
    ClipboardList, Network, Calendar,
    Calculator, MessageSquare, TrendingUp, Eye, Activity
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { APP_VERSION } from '@/config/version';

export default function GuidePage() {
    return (
        <div className="container mx-auto py-8 max-w-5xl px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4 text-foreground">คู่มือการใช้งาน (User Guide)</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    คู่มือการใช้งานระบบ PMQA 4.0 Web Application สำหรับ กอ.รมน. ฉบับสมบูรณ์
                    ครอบคลุมทุกขั้นตอนตั้งแต่เริ่มต้นจนถึงการเตรียมรับการตรวจประเมิน
                </p>
                <Badge className="mt-4 bg-indigo-100 text-indigo-700">Version {APP_VERSION.version} | อัปเดต {APP_VERSION.releaseDate}</Badge>
            </div>

            <div className="grid gap-8">

                {/* ============================================ */}
                {/* GETTING STARTED SECTION */}
                {/* ============================================ */}
                <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="h-6 w-6 text-indigo-600" />
                            การเริ่มต้นใช้งาน (Getting Started)
                        </CardTitle>
                        <CardDescription>ขั้นตอนการเข้าสู่ระบบและตั้งค่าเบื้องต้น</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-foreground">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                                การเข้าสู่ระบบ (Login)
                            </h4>
                            <ul className="list-disc pl-10 space-y-2">
                                <li>เปิดเว็บไซต์และคลิกปุ่ม <strong>&quot;เข้าสู่ระบบ&quot;</strong></li>
                                <li>ใช้อีเมล Google Account (Gmail) เพื่อความปลอดภัยและสะดวกในการเข้าถึง Google Services</li>
                                <li>หากเป็นผู้ใช้ใหม่ ระบบจะนำไปหน้าลงทะเบียนเพื่อกรอกข้อมูลเพิ่มเติม</li>
                                <li>รอผู้ดูแลระบบอนุมัติการเข้าใช้งาน (สำหรับผู้ใช้ใหม่)</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                                หน้าแดชบอร์ด (Dashboard)
                            </h4>
                            <ul className="list-disc pl-10 space-y-2">
                                <li>เมื่อ Login สำเร็จ ระบบจะนำไปยังหน้า Dashboard ซึ่งเป็นศูนย์กลางการทำงาน</li>
                                <li>แสดงสถานะความคืบหน้าภาพรวมของแต่ละ Phase</li>
                                <li>มีทางลัดเข้าสู่โมดูลต่างๆ ทั้ง 8 Phases</li>
                                <li>แสดงกิจกรรมล่าสุดและการแจ้งเตือน</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                                การตั้งค่า AI (AI Configuration)
                            </h4>
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ml-8">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800 dark:text-amber-300">สำคัญ: ต้องตั้งค่าก่อนใช้งาน AI</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">ฟีเจอร์ที่ใช้ AI (SAR Writer, Interview Brief, Q&A Bank) จำเป็นต้องตั้งค่า API Key ก่อน</p>
                                    </div>
                                </div>
                            </div>
                            <ul className="list-disc pl-10 space-y-2 mt-3">
                                <li>ไปที่ <strong>Settings → AI Config</strong></li>
                                <li>ขอ API Key จาก <a href="https://aistudio.google.com" target="_blank" className="text-indigo-600 underline">Google AI Studio</a></li>
                                <li>วาง API Key และเลือก Model ที่ต้องการ:
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                                        <li><strong>Gemini 3.0 Flash</strong> - รุ่นล่าสุด เร็วและฉลาดที่สุด (แนะนำ)</li>
                                        <li><strong>Gemini 2.5 Pro</strong> - ฉลาดที่สุด เหมาะกับงานซับซ้อน</li>
                                        <li><strong>Gemini 2.0 Flash</strong> - เวอร์ชันเสถียร</li>
                                    </ul>
                                </li>
                                <li>คลิก <strong>&quot;ทดสอบการเชื่อมต่อ&quot;</strong> และ <strong>&quot;บันทึก&quot;</strong></li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================ */}
                {/* WORKFLOW PHASES */}
                {/* ============================================ */}
                <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center gap-2">
                    <Book className="h-6 w-6 text-indigo-600" />
                    ขั้นตอนการดำเนินงาน (Workflow Phases)
                </h2>
                <p className="text-muted-foreground -mt-4">ระบบแบ่งการทำงานเป็น 8 Phases ตามลำดับ ควรดำเนินการตามขั้นตอน</p>

                <Accordion type="single" collapsible className="w-full space-y-4">

                    {/* ============================================ */}
                    {/* PHASE 0: PROJECT SETUP */}
                    {/* ============================================ */}
                    <AccordionItem value="phase0" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <LayoutDashboard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 0: การเตรียมความพร้อม (Project Setup)</div>
                                    <div className="text-sm text-muted-foreground font-normal">กำหนดโครงสร้าง ผู้รับผิดชอบ และแผนงาน</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">4 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                {/* App 0.1 */}
                                <div className="border-l-2 border-blue-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Network className="h-4 w-4 text-blue-600" />
                                        Network Scope Mapper
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">กำหนดขอบเขตเครือข่ายหน่วยงาน</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 0 → Network Mapper</strong></li>
                                        <li>นำเข้ารายชื่อหน่วยงาน (Excel/CSV) หรือเพิ่มเองทีละหน่วย</li>
                                        <li>จัดกลุ่มหน่วยตามภาค/จังหวัด/ประเภท</li>
                                        <li>กำหนดกฎการรวมข้อมูล (Sum/Average/Weighted)</li>
                                        <li>บันทึกและ Export เป็น Excel ได้</li>
                                    </ol>
                                </div>

                                {/* App 0.2 */}
                                <div className="border-l-2 border-blue-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        Owner Matrix Builder
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">มอบหมายผู้รับผิดชอบแต่ละหมวด (RACI Matrix)</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 0 → Owner Matrix</strong></li>
                                        <li>นำเข้ารายชื่อบุคลากร (Excel/CSV)</li>
                                        <li>เลือกหมวด PMQA (หมวด 1-7) และกำหนด Owner / Reviewer / Approver</li>
                                        <li>ระบบช่วยแนะนำผู้รับผิดชอบตาม AI (optional)</li>
                                        <li>บันทึก RACI Matrix และ Export เป็น Excel</li>
                                    </ol>
                                </div>

                                {/* App 0.3 */}
                                <div className="border-l-2 border-blue-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        Repository Setup Wizard
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">จัดโครงสร้างโฟลเดอร์เอกสาร</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 0 → Repository Setup</strong></li>
                                        <li>กำหนดรูปแบบการตั้งชื่อไฟล์ (Naming Convention)</li>
                                        <li>สร้างโครงสร้างโฟลเดอร์ตาม Phase และหน่วยงาน</li>
                                        <li>กำหนด Access Permission</li>
                                        <li>เชื่อมต่อกับ Google Drive (optional)</li>
                                    </ol>
                                </div>

                                {/* App 0.4 */}
                                <div className="border-l-2 border-blue-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        Submission Calendar Generator
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">สร้างปฏิทินกำหนดส่งงาน</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 0 → Calendar</strong></li>
                                        <li>กำหนด Milestones และ Deadlines หลัก</li>
                                        <li>กำหนดความถี่การส่งงาน (รายเดือน/ไตรมาส)</li>
                                        <li>ระบบคำนวณวันส่งย้อนกลับ (Backward Planning)</li>
                                        <li>Sync กับ Google Calendar และตั้งค่าแจ้งเตือนอัตโนมัติ</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 1: EVIDENCE MANAGEMENT */}
                    {/* ============================================ */}
                    <AccordionItem value="phase1" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 1: การจัดการหลักฐาน (Evidence Management)</div>
                                    <div className="text-sm text-muted-foreground font-normal">รวบรวม ตรวจสอบ และติดตามหลักฐาน</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">4 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                {/* App 1.1 */}
                                <div className="border-l-2 border-orange-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <ClipboardList className="h-4 w-4 text-orange-600" />
                                        Evidence Register Builder
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">ระบบทะเบียนคุมหลักฐาน</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 1 → Evidence</strong></li>
                                        <li>คลิก &quot;เพิ่มหลักฐาน&quot; เพื่อนำเข้าไฟล์ (PDF/Word/Excel/รูปภาพ)</li>
                                        <li>ระบบสร้างรหัสหลักฐานอัตโนมัติ (E-{"{Phase}"}-{"{Item}"}-{"{Year}"}-{"{Unit}"})</li>
                                        <li>กรอกข้อมูล: ชื่อ, อธิบาย, หมวด, เจ้าของ, ชั้นความลับ</li>
                                        <li>ดู/ค้นหา/กรองหลักฐานตามหมวด/หน่วย/สถานะ</li>
                                    </ol>
                                </div>

                                {/* App 1.2 */}
                                <div className="border-l-2 border-orange-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-orange-600" />
                                        Evidence Gap Analyzer
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">วิเคราะห์ช่องว่างหลักฐาน</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 1 → Gap Analyzer</strong></li>
                                        <li>ระบบแสดง Matrix: หมวด vs หลักฐาน</li>
                                        <li>ระบุหมวดที่มีหลักฐานไม่ครบ (แนะนำ 2-5 ชิ้นต่อหมวด)</li>
                                        <li>AI ช่วยแนะนำหลักฐานทดแทน (กรณีเอกสารลับ)</li>
                                        <li>Export Gap Report เป็น Excel/PDF</li>
                                    </ol>
                                </div>

                                {/* App 1.3 */}
                                <div className="border-l-2 border-orange-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                                        Evidence Gate Checker
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">ตรวจคุณภาพหลักฐาน</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 1 → Gate Checker</strong></li>
                                        <li>เลือกหลักฐานที่ต้องการตรวจ</li>
                                        <li>ระบบตรวจ: ชื่อไฟล์, รูปแบบ, Metadata, เนื้อหา (AI)</li>
                                        <li>แสดงผล Pass/Fail พร้อมเหตุผล</li>
                                        <li>ส่ง Email แจ้งเตือนเจ้าของหลักฐานที่ไม่ผ่าน</li>
                                    </ol>
                                </div>

                                {/* App 1.4 */}
                                <div className="border-l-2 border-orange-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-orange-600" />
                                        Evidence Gap Closure Tracker
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">ติดตามการปิดช่องว่าง</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ไปที่ <strong>Phase 1 → Gap Tracker</strong></li>
                                        <li>ดูรายการ Gaps ที่ต้องปิด</li>
                                        <li>แปลง Gap เป็น Task: มอบหมายเจ้าของ + กำหนดวัน</li>
                                        <li>อัปเดตสถานะ: Not Started → In Progress → Completed</li>
                                        <li>Dashboard แสดง Progress แยกตามหมวด</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 2: DATA MANAGEMENT */}
                    {/* ============================================ */}
                    <AccordionItem value="phase2" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Database className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 2: การจัดการข้อมูล (Data Management)</div>
                                    <div className="text-sm text-muted-foreground font-normal">จัดการ KPI และข้อมูลตัวเลข</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">6 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Data Source Catalog Builder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">จัดทำบัญชีแหล่งข้อมูล KPI</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ระบุ KPI → แหล่งข้อมูล → เจ้าของ → ความถี่อัปเดต</li>
                                        <li>ตรวจสอบว่า KPI ทุกตัวมีแหล่งข้อมูลอ้างอิง</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">KPI Dictionary Builder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">พจนานุกรม KPI</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>นิยามความหมาย / หน่วยวัด / สูตรคำนวณ</li>
                                        <li>กำหนด Baseline / Target / เกณฑ์คุณภาพ</li>
                                        <li>AI ช่วยเสนอนิยามมาตรฐาน</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Excel Template Generator</h4>
                                    <p className="text-sm text-muted-foreground mb-2">สร้าง Template รวบรวมข้อมูล</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>สร้าง Excel Templates จาก KPI Dictionary</li>
                                        <li>มี Data Validation และ Conditional Formatting</li>
                                        <li>สร้าง Quick Guide แนบ Template</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Data Collector & Validator</h4>
                                    <p className="text-sm text-muted-foreground mb-2">รวบรวมและตรวจสอบข้อมูล</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>อ่านไฟล์ Excel จาก 70+ หน่วย</li>
                                        <li>ตรวจสอบตาม KPI Dictionary Rules</li>
                                        <li>รวมข้อมูลเป็น Dataset เดียว</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Data Cleaning Assistant</h4>
                                    <p className="text-sm text-muted-foreground mb-2">ทำความสะอาดข้อมูล</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>แสดงปัญหา: Outlier / Missing / Wrong Format</li>
                                        <li>AI เสนอวิธีแก้ไข</li>
                                        <li>ติดตามการแก้ไขจากเจ้าของข้อมูล</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-purple-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Results Baseline Analyzer</h4>
                                    <p className="text-sm text-muted-foreground mb-2">วิเคราะห์ผลลัพธ์ Baseline</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>คำนวณแนวโน้ม 3 ปี (ถ้ามี)</li>
                                        <li>เปรียบเทียบ vs Target / Benchmark</li>
                                        <li>AI วิเคราะห์สาเหตุและเสนอแนวทางแก้ไข</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 3: ANALYSIS & NARRATIVE */}
                    {/* ============================================ */}
                    <AccordionItem value="phase3" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-sky-100 p-2 rounded-lg">
                                    <FileText className="h-6 w-6 text-sky-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 3: การวิเคราะห์ (Analysis & Narrative)</div>
                                    <div className="text-sm text-muted-foreground font-normal">เตรียมข้อมูลบริบทและวิเคราะห์เชิงยุทธศาสตร์</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">3 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                <div className="border-l-2 border-sky-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Context Pack Builder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">รวบรวมข้อมูลบริบทองค์กร (OP)</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>กรอก: วิสัยทัศน์ / พันธกิจ / โครงสร้าง / ผู้มีส่วนได้ส่วนเสีย</li>
                                        <li>AI ช่วยร่าง Organizational Profile</li>
                                        <li>สรุป Value Chain และข้อจำกัดเฉพาะ</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-sky-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Risk & Foresight Analyzer</h4>
                                    <p className="text-sm text-muted-foreground mb-2">วิเคราะห์ความเสี่ยงเชิงยุทธศาสตร์</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>นำเข้าเอกสารนโยบาย/ยุทธศาสตร์</li>
                                        <li>ระบุความเสี่ยงและโอกาส</li>
                                        <li>สร้าง Risk Register: Risk → Owner → Measure → KPI</li>
                                        <li>AI วิเคราะห์ Foresight factors</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-sky-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Strategy-to-KPI Linker</h4>
                                    <p className="text-sm text-muted-foreground mb-2">เชื่อมโยงยุทธศาสตร์กับ KPI</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>นำเข้า Strategic Focus จาก Risk Analyzer</li>
                                        <li>AI Map: Goal → Project → KPI → Result</li>
                                        <li>กำหนด Coverage Rules (% หน่วยที่ดำเนินการ)</li>
                                        <li>Export Strategy-to-KPI Map</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 4: SAR WRITING */}
                    {/* ============================================ */}
                    <AccordionItem value="phase4" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-pink-100 p-2 rounded-lg">
                                    <PenTool className="h-6 w-6 text-pink-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 4: การเขียนรายงาน (SAR Writing)</div>
                                    <div className="text-sm text-muted-foreground font-normal">ใช้ AI ช่วยร่างรายงานการประเมินตนเอง</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">2 Apps</Badge>
                                <Badge className="bg-pink-100 text-pink-700">AI-Powered</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-2">
                                    <Sparkles className="h-5 w-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-pink-800 dark:text-pink-300">ใช้งาน AI ในการร่างเนื้อหา</p>
                                        <p className="text-sm text-pink-700 dark:text-pink-400">Phase นี้ใช้ Gemini AI เขียนเนื้อหา ต้องตั้งค่า API Key ก่อน</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="border-l-2 border-pink-300 pl-4">
                                    <h4 className="font-semibold text-foreground">SAR Outline Generator</h4>
                                    <p className="text-sm text-muted-foreground mb-2">สร้างโครงร่างเนื้อหา SAR</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>เลือกหมวด PMQA ที่ต้องการร่าง</li>
                                        <li>ระบบแสดงหัวข้อย่อยและเกณฑ์การให้คะแนน</li>
                                        <li>กำหนดหลักฐานที่ต้องอ้างอิงแต่ละหัวข้อ</li>
                                        <li>สร้าง Outline Checklist</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-pink-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-pink-600" />
                                        SAR Writer Assistant (AI)
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">AI ช่วยร่างเนื้อหา SAR</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>เลือกหัวข้อที่ต้องการเขียน</li>
                                        <li>ระบบดึงข้อมูล Context + Evidence + KPI</li>
                                        <li>คลิก &quot;Generate&quot; เพื่อให้ AI ร่างเนื้อหาตามรูปแบบ ADLR:
                                            <ul className="list-disc pl-5 mt-1 text-xs">
                                                <li><strong>A</strong>pproach: วิธีการ/มาตรฐาน</li>
                                                <li><strong>D</strong>eployment: ขอบเขตการใช้งาน</li>
                                                <li><strong>L</strong>earning: การเรียนรู้ปรับปรุง</li>
                                                <li><strong>R</strong>esults: ผลลัพธ์ที่เกี่ยวข้อง</li>
                                            </ul>
                                        </li>
                                        <li>แก้ไขเนื้อหาตามต้องการ</li>
                                        <li>คัดลอก หรือ Download เป็น Word/PDF</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 5: RESULTS */}
                    {/* ============================================ */}
                    <AccordionItem value="phase5" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 5: ผลลัพธ์ (Results)</div>
                                    <div className="text-sm text-muted-foreground font-normal">นำเสนอผลลัพธ์การดำเนินงาน (หมวด 7)</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">2 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                <div className="border-l-2 border-emerald-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Results Data Pack Builder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">จัดทำชุดข้อมูลผลลัพธ์</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>รวบรวมข้อมูล KPI Results</li>
                                        <li>สร้างตารางและกราฟแสดงผล</li>
                                        <li>ระบุแหล่งที่มาและความสมบูรณ์ของข้อมูล</li>
                                        <li>แสดงแนวโน้ม 3 ปี (ถ้ามี)</li>
                                        <li>Export เป็น Excel + Charts</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-emerald-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        Recovery Narrative Builder (AI)
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">AI ช่วยเขียนคำอธิบายผลลัพธ์</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>เลือก KPI ที่ต้องการอธิบาย</li>
                                        <li>AI ร่าง Narrative ตามรูปแบบ: Explain → Improve → Verify</li>
                                        <li>เชื่อมโยงกับ Risk Register</li>
                                        <li>แก้ไขและบันทึก</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 6: QUALITY ASSURANCE */}
                    {/* ============================================ */}
                    <AccordionItem value="phase6" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
                                    <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 6: การตรวจสอบคุณภาพ (Quality Assurance)</div>
                                    <div className="text-sm text-muted-foreground font-normal">ตรวจความสอดคล้องและจำลองคะแนน</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">2 Apps</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                <div className="border-l-2 border-teal-300 pl-4">
                                    <h4 className="font-semibold text-foreground">Cross-Consistency Auditor</h4>
                                    <p className="text-sm text-muted-foreground mb-2">ตรวจสอบความสอดคล้องข้ามหมวด</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>คลิก &quot;เริ่มตรวจสอบ&quot;</li>
                                        <li>ระบบตรวจ 8 เกณฑ์: Context, Strategy-KPI, Evidence, SAR, Owner</li>
                                        <li>แสดงผล: ผ่าน / ควรปรับปรุง / ต้องดำเนินการ</li>
                                        <li>คลิกลิงก์เพื่อไปแก้ไขที่หน้าที่เกี่ยวข้อง</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-teal-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Calculator className="h-4 w-4 text-teal-600" />
                                        Score Simulator & Fix Planner
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">จำลองคะแนน PMQA</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>ปรับ Slider คะแนนแต่ละหมวด (0-100%)</li>
                                        <li>ดูคะแนนรวม (เต็ม 500 คะแนน)</li>
                                        <li>เกณฑ์ผ่าน: 350 คะแนน = พื้นฐาน, 400 คะแนน = ก้าวหน้า</li>
                                        <li>ดูข้อเสนอแนะหมวดที่ควรปรับปรุง</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* ============================================ */}
                    {/* PHASE 7: INTERVIEW PREP */}
                    {/* ============================================ */}
                    <AccordionItem value="phase7" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                                    <Presentation className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-foreground">Phase 7: การเตรียมรับการตรวจ (Interview Prep)</div>
                                    <div className="text-sm text-muted-foreground font-normal">เตรียมข้อมูลและคำถาม-คำตอบ</div>
                                </div>
                                <Badge variant="outline" className="ml-auto">2 Apps</Badge>
                                <Badge className="bg-rose-100 text-rose-700">AI-Powered</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <div className="space-y-6">
                                <div className="border-l-2 border-rose-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-rose-600" />
                                        Interview Brief Generator (AI)
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">สร้างเอกสารเตรียมรับการตรวจ</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>เลือกหัวข้อที่ต้องการรวม (ภาพรวม, ไฮไลท์, KPI, ความท้าทาย)</li>
                                        <li>ระบุหมายเหตุเพิ่มเติม (ถ้ามี)</li>
                                        <li>คลิก &quot;สร้าง Interview Brief&quot;</li>
                                        <li>AI สร้าง: Executive Summary + Talking Points + คำถามที่อาจถูกถาม</li>
                                        <li>คัดลอก หรือ Download เป็น Markdown</li>
                                    </ol>
                                </div>
                                <div className="border-l-2 border-rose-300 pl-4">
                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-rose-600" />
                                        Q&A Bank Builder (AI)
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">คลังคำถาม-คำตอบ</p>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                                        <li>เลือกหมวดที่ต้องการสร้างคำถาม</li>
                                        <li>คลิก &quot;Generate&quot; เพื่อให้ AI สร้าง 3 คำถาม/คำตอบ</li>
                                        <li>หรือคลิก &quot;เพิ่มเอง&quot; เพื่อกรอกคำถาม/คำตอบ Manual</li>
                                        <li>กรองดูตามหมวดและระดับความยาก (ง่าย/ปานกลาง/ยาก)</li>
                                        <li>ใช้ซ้อมตอบคำถามก่อนรับการตรวจจริง</li>
                                    </ol>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>

                {/* ============================================ */}
                {/* FAQ SECTION */}
                {/* ============================================ */}
                <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-amber-600" />
                    คำถามที่พบบ่อย (FAQ)
                </h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="faq1" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="font-semibold text-foreground">ต้องทำตามลำดับ Phase หรือไม่?</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <p className="pl-4">แนะนำให้ทำตามลำดับ Phase 0 → 7 เพื่อให้ข้อมูลเชื่อมโยงกัน แต่สามารถข้ามไปทำ Phase อื่นก่อนได้ถ้าจำเป็น</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq2" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="font-semibold text-foreground">API Key Gemini หาได้จากไหน?</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <p className="pl-4">ไปที่ <a href="https://aistudio.google.com/apikey" target="_blank" className="text-indigo-600 underline">Google AI Studio</a> → สร้าง API Key → คัดลอกมาใส่ในระบบ (ฟรี)</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq3" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="font-semibold text-foreground">ใช้ Model Gemini ตัวไหนดี?</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <p className="pl-4">แนะนำ <strong>Gemini 3.0 Flash</strong> (เร็วและฉลาดที่สุด) หรือ <strong>Gemini 2.5 Pro</strong> (สำหรับงานซับซ้อน)</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq4" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="font-semibold text-foreground">ข้อมูลเก็บที่ไหน ปลอดภัยหรือไม่?</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <p className="pl-4">ข้อมูลเก็บใน Firebase Cloud (Google) มีการเข้ารหัส และกำหนดสิทธิ์การเข้าถึงตาม Role</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* ============================================ */}
                {/* WHAT'S NEW IN CURRENT VERSION */}
                {/* ============================================ */}
                <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    มีอะไรใหม่ใน Version {APP_VERSION.version}
                </h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {APP_VERSION.releases[`v${APP_VERSION.version}`] && APP_VERSION.releases[`v${APP_VERSION.version}`].features.map((feature, idx) => (
                        <AccordionItem key={idx} value={`feature-${idx}`} className="bg-card border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{feature.category}</div>
                                        <div className="text-sm text-muted-foreground font-normal">{feature.description}</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 pb-6 text-foreground">
                                <ul className="list-disc pl-10 space-y-2 text-sm">
                                    {feature.items.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item}</li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* ============================================ */}
                {/* ADMIN FEATURES */}
                {/* ============================================ */}
                <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                    ฟีเจอร์สำหรับ Admin
                </h2>
                <p className="text-muted-foreground -mt-4">การจัดการผู้ใช้งานและระบบ (เฉพาะ Admin เท่านั้น)</p>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="admin1" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="font-semibold text-foreground">การจัดการผู้ใช้งาน & ประกาศ</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <ul className="list-disc pl-10 space-y-2 text-sm">
                                <li><strong>จัดการประกาศ (Announcements):</strong> สร้าง แก้ไข หรือลบประกาศบน Dashboard (v1.7.0)</li>
                                <li>อนุมัติ/ปฏิเสธคำขอเข้าใช้งาน</li>
                                <li>แก้ไขข้อมูล User: บทบาท, หน่วยงาน, ข้อมูลส่วนตัว</li>
                                <li>แก้ไขข้อมูลก่อนอนุมัติได้ (v1.6.2)</li>
                                <li>ดูประวัติการเข้าใช้งานล่าสุด (v1.6.2)</li>
                                <li>Bulk Actions: อนุมัติ/ปฏิเสธหลายคนพร้อมกัน</li>
                                <li>Export ข้อมูลผู้ใช้เป็น CSV</li>
                                <li>กรองตามสถานะ, หน่วยงาน, ภูมิภาค</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="admin2" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                    <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="font-semibold text-foreground">Activity Logs</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <ul className="list-disc pl-10 space-y-2 text-sm">
                                <li>ดูประวัติการทำงานทั้งหมดในระบบ</li>
                                <li>กรองตามประเภท: Login, Create, Update, Delete, Upload, Download</li>
                                <li>Export Activity Logs เป็น CSV</li>
                                <li>ติดตามความผิดปกติและความปลอดภัย</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="admin3" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="font-semibold text-foreground">File Versioning (v1.6.0+)</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <ul className="list-disc pl-10 space-y-2 text-sm">
                                <li>Delete ไฟล์หลักฐาน (Admin only)</li>
                                <li>Revert ไฟล์กลับเวอร์ชันเก่า (Admin only)</li>
                                <li>ดูประวัติการแก้ไขทุกเวอร์ชัน</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* ============================================ */}
                {/* CYCLE MANAGEMENT */}
                {/* ============================================ */}
                <h2 className="text-2xl font-bold text-foreground mt-4 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                    การจัดการรอบการประเมิน (Cycle Management)
                </h2>
                <p className="text-muted-foreground -mt-4">รองรับการทำงานหลายรอบการประเมิน (v1.5.0+)</p>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="cycle1" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="font-semibold text-foreground">การใช้งาน Cycle</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <ul className="list-disc pl-10 space-y-2 text-sm">
                                <li>เลือก Cycle จาก Dropdown ใน Header</li>
                                <li>ระบบจะกรองข้อมูลตาม Cycle ที่เลือก</li>
                                <li>Evidence, KPI Data, SAR แยกตามรอบ</li>
                                <li>Dashboard แสดงข้อมูลตาม Active Cycle</li>
                                <li>Warning UI เมื่อไม่ได้เลือก Cycle</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cycle2" className="bg-card border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="font-semibold text-foreground">หน้าที่รองรับ Cycle</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 text-foreground">
                            <ul className="list-disc pl-10 space-y-2 text-sm">
                                <li>Phase 1: Evidence, Gap Tracker, Gap Analyzer, Gate Checker</li>
                                <li>Phase 2: Data Collector, Data Cleaning, Baseline Analyzer, Data Catalog, KPI Dictionary</li>
                                <li>Phase 4: SAR Outline, SAR Writer</li>
                                <li>Dashboard: ข้อมูลทั้งหมดแสดงตาม Active Cycle</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* ============================================ */}
                {/* FOOTER */}
                {/* ============================================ */}
                <div className="text-center mt-8 space-y-2 py-6 border-t">
                    <p className="text-lg font-semibold text-foreground">PMQA 4.0 Web Application</p>
                    <p className="text-sm text-muted-foreground">Version {APP_VERSION.version} | อัปเดตล่าสุด: {APP_VERSION.releaseDate}</p>
                    <p className="text-sm text-muted-foreground/70">Internal Security Operations Command (กอ.รมน.)</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                        พัฒนาโดย{' '}
                        <a href="https://portfolio-two-sepia-33.vercel.app/" target="_blank" className="text-indigo-600 underline">
                            พล.ท.ดร.กริช อินทราทิพย์
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
