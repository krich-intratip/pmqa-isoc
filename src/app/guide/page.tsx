'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, HelpCircle, Monitor } from 'lucide-react';

export default function GuidePage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Book className="h-8 w-8 text-indigo-600" />
                คู่มือการใช้งาน (User Guide)
            </h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            1. การเริ่มต้นใช้งาน (Getting Started)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-600">
                        <p>
                            ยินดีต้อนรับสู่ระบบ PMQA 4.0 - ISOC แพลตฟอร์มการประเมินผลการปฏิบัติงานอัจฉริยะ
                            สำหรับผู้ใช้งานใหม่ กรุณาปฏิบัติตามขั้นตอนดังนี้:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>การลงทะเบียน:</strong> ใช้อีเมล Google (@gmail.com) ในการเข้าสู่ระบบครั้งแรก</li>
                            <li><strong>การระบุสังกัด:</strong> เลือกหน่วยงาน (Unit) และบทบาท (Role) ให้ถูกต้องตามความเป็นจริง</li>
                            <li><strong>การรออนุมัติ:</strong> หลังจากลงทะเบียน ผู้ดูแลระบบ (Admin) จะทำการตรวจสอบและอนุมัติสิทธิ์การใช้งานของท่าน</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-green-600" />
                            2. การขอความช่วยเหลือ (Support)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-600">
                        <p>
                            หากพบปัญหาการใช้งาน หรือมีข้อสงสัยเกี่ยวกับระบบ สามารถติดต่อทีมผู้พัฒนาระบบได้ที่เมนู "เกี่ยวกับ" (About)
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
