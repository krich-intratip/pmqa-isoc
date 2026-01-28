'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    HelpCircle,
    LogIn,
    FileText,
    Shield,
    MessageSquare,
    Mail,
    Clock,
    AlertCircle,
    Info,
} from 'lucide-react';
import { APP_VERSION } from '@/config/version';

const helpSections = [
    {
        id: 'getting-started',
        icon: LogIn,
        title: 'เริ่มต้นใช้งาน',
        description: 'วิธีเข้าสู่ระบบและลงทะเบียน',
        items: [
            {
                question: 'ฉันจะเข้าสู่ระบบได้อย่างไร?',
                answer: 'คลิกปุ่ม "เข้าสู่ระบบด้วย Google" ที่หน้า Login แล้วเลือกบัญชี Google ที่ต้องการใช้งาน ระบบจะยืนยันตัวตนผ่าน Google OAuth โดยอัตโนมัติ',
            },
            {
                question: 'ฉันลงทะเบียนแล้วแต่ยังเข้าใช้งานไม่ได้?',
                answer: 'สำหรับผู้ใช้ใหม่ บัญชีของท่านจะอยู่ในสถานะ "รอการอนุมัติ" โดยผู้ดูแลระบบจะตรวจสอบและอนุมัติให้ท่านสามารถเข้าใช้งานได้ ระหว่างรอ ท่านสามารถเข้าดูหน้าคู่มือและหน้าเกี่ยวกับระบบได้',
            },
            {
                question: 'ฉันต้องกรอกข้อมูลอะไรบ้างในการลงทะเบียน?',
                answer: 'ท่านต้องกรอกชื่อ-นามสกุล, เบอร์โทรศัพท์, เลือกประเภทหน่วยงาน (ส่วนกลาง/ภาค/จังหวัด/ศูนย์), เลือกหน่วยงานสังกัด และบทบาทที่ต้องการ',
            },
        ],
    },
    {
        id: 'user-roles',
        icon: Shield,
        title: 'บทบาทผู้ใช้งาน',
        description: 'อธิบายสิทธิ์การใช้งานของแต่ละบทบาท',
        items: [
            {
                question: 'ผู้ดูแลระบบสูงสุด (Super Admin) ทำอะไรได้บ้าง?',
                answer: 'สามารถจัดการผู้ใช้ทั้งหมด, อนุมัติ/ปฏิเสธผู้ใช้ใหม่, กำหนดบทบาท, จัดการรอบการประเมิน, ดูรายงาน Activity Log และตั้งค่าระบบทั้งหมด',
            },
            {
                question: 'ผู้ดูแลระบบ (System Admin) ทำอะไรได้บ้าง?',
                answer: 'มีสิทธิ์เหมือน Super Admin ยกเว้นไม่สามารถแก้ไขหรือลบบัญชี Super Admin ได้',
            },
            {
                question: 'เจ้าหน้าที่จังหวัด (Provincial Staff) ทำอะไรได้บ้าง?',
                answer: 'อัปโหลดหลักฐาน, เขียนรายงาน SAR, ดูข้อมูลของหน่วยงานตนเอง และใช้เครื่องมือ AI ช่วยวิเคราะห์',
            },
            {
                question: 'ผู้เข้าชม (Read Only) ทำอะไรได้บ้าง?',
                answer: 'สามารถดูข้อมูลได้อย่างเดียว ไม่สามารถแก้ไข อัปโหลด หรือลบข้อมูลใดๆ ได้',
            },
        ],
    },
    {
        id: 'evidence-management',
        icon: FileText,
        title: 'การจัดการหลักฐาน',
        description: 'วิธีอัปโหลดและจัดการหลักฐาน PMQA',
        items: [
            {
                question: 'ฉันจะอัปโหลดหลักฐานได้อย่างไร?',
                answer: 'ไปที่เมนู "จัดการหลักฐาน" เลือกหมวดและเกณฑ์ที่ต้องการ จากนั้นคลิก "อัปโหลด" และเลือกไฟล์ที่ต้องการ รองรับไฟล์หลายประเภท เช่น PDF, Word, Excel, รูปภาพ',
            },
            {
                question: 'ไฟล์ที่อัปโหลดมีขนาดจำกัดไหม?',
                answer: 'ไฟล์แต่ละไฟล์ไม่ควรเกิน 10 MB และควรใช้ชื่อไฟล์ภาษาไทยหรืออังกฤษที่อ่านเข้าใจง่าย',
            },
            {
                question: 'ฉันสามารถแก้ไขหลักฐานที่อัปโหลดแล้วได้ไหม?',
                answer: 'ได้ครับ ระบบรองรับการอัปโหลดเวอร์ชันใหม่ โดยเวอร์ชันเก่าจะถูกเก็บไว้เป็นประวัติ',
            },
        ],
    },
    {
        id: 'ai-features',
        icon: MessageSquare,
        title: 'ฟีเจอร์ AI',
        description: 'การใช้งาน AI ช่วยวิเคราะห์',
        items: [
            {
                question: 'AI ช่วยอะไรได้บ้าง?',
                answer: 'AI สามารถช่วยวิเคราะห์ SWOT, พยากรณ์คะแนน, ติดแท็กหลักฐานอัตโนมัติ, ปรับภาษาทางการในรายงาน SAR และตอบคำถามเกี่ยวกับเกณฑ์ PMQA',
            },
            {
                question: 'ข้อมูลที่ส่งให้ AI ปลอดภัยไหม?',
                answer: 'ระบบใช้ Google Gemini API ซึ่งมีมาตรฐานความปลอดภัยระดับ Enterprise และไม่เก็บข้อมูลไปฝึก Model',
            },
        ],
    },
    {
        id: 'troubleshooting',
        icon: AlertCircle,
        title: 'แก้ไขปัญหา',
        description: 'วิธีแก้ไขปัญหาที่พบบ่อย',
        items: [
            {
                question: 'เข้าสู่ระบบไม่ได้ แสดง Error 403',
                answer: 'ปัญหานี้มักเกิดจากการเปิดลิงก์ผ่านแอป LINE หรือ Facebook กรุณากดเมนู 3 จุด แล้วเลือก "เปิดใน Chrome" หรือ "Open in Browser"',
            },
            {
                question: 'หน้าเว็บโหลดช้า',
                answer: 'ลองล้าง Cache ของ Browser หรือเปลี่ยนมาใช้ Chrome/Edge เวอร์ชันล่าสุด หากยังช้าอยู่ อาจเป็นปัญหาจากอินเทอร์เน็ต',
            },
            {
                question: 'อัปโหลดไฟล์ไม่สำเร็จ',
                answer: 'ตรวจสอบว่าไฟล์มีขนาดไม่เกิน 10 MB และเป็นประเภทไฟล์ที่รองรับ (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)',
            },
        ],
    },
    {
        id: 'contact',
        icon: Mail,
        title: 'ติดต่อผู้ดูแลระบบ',
        description: 'ช่องทางการติดต่อและขอความช่วยเหลือ',
        items: [
            {
                question: 'ฉันต้องการความช่วยเหลือเพิ่มเติม ติดต่อได้ที่ไหน?',
                answer: 'ติดต่อผู้ดูแลระบบผ่านอีเมลที่แสดงในหน้าโปรไฟล์ของท่าน หรือติดต่อหน่วยงานต้นสังกัดของท่าน',
            },
            {
                question: 'ฉันพบข้อผิดพลาดของระบบ (Bug) ควรทำอย่างไร?',
                answer: 'กรุณาแจ้งรายละเอียดข้อผิดพลาด พร้อมภาพหน้าจอ (Screenshot) ไปยังผู้ดูแลระบบ เพื่อให้ทีมพัฒนาแก้ไขได้รวดเร็ว',
            },
        ],
    },
];

export default function HelpPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                    คู่มือการใช้งาน
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    คำถามที่พบบ่อยและวิธีการใช้งานระบบ PMQA ISOC
                </p>
                <Badge variant="outline">Version {APP_VERSION.version}</Badge>
            </div>

            {/* Quick Info for Pending Users */}
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-lg">
                        <Clock className="h-5 w-5" />
                        สำหรับผู้ใช้ที่รอการอนุมัติ
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-700 dark:text-amber-300 text-sm space-y-2">
                    <p>
                        หากท่านเพิ่งลงทะเบียนและอยู่ระหว่างรอการอนุมัติ ท่านสามารถ:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>อ่านคู่มือการใช้งานในหน้านี้</li>
                        <li>ดูข้อมูลเกี่ยวกับระบบในหน้า About</li>
                    </ul>
                    <p className="font-medium mt-2">
                        ผู้ดูแลระบบจะได้รับแจ้งเตือนและตรวจสอบคำขอของท่านโดยเร็ว
                    </p>
                </CardContent>
            </Card>

            {/* Help Sections */}
            <div className="space-y-6">
                {helpSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card key={section.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    {section.title}
                                </CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {section.items.map((item, idx) => (
                                        <AccordionItem key={idx} value={`${section.id}-${idx}`}>
                                            <AccordionTrigger className="text-left">
                                                <div className="flex items-start gap-2">
                                                    <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <span>{item.question}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-6">
                                                <div className="flex items-start gap-2 text-muted-foreground">
                                                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>{item.answer}</span>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
                <p>หากท่านมีคำถามเพิ่มเติม กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
        </div>
    );
}
