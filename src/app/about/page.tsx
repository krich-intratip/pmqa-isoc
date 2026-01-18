'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Github, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const currentYear = new Date().getFullYear();
    const beYear = currentYear + 543;

    return (
        <div className="container mx-auto py-12 max-w-3xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">เกี่ยวกับเรา (About)</h1>
                <p className="text-lg text-slate-600">
                    ระบบบริหารจัดการจริยธรรมและการประเมินผลการปฏิบัติงาน กอ.รมน. (PMQA 4.0)
                </p>
            </div>

            <Card className="border-indigo-100 shadow-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                <CardContent className="relative pt-0 pb-8 px-8 text-center">
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                            <AvatarImage src="/images/developer.jpg" alt="Developer" />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-3xl font-bold">DK</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="mt-20">
                        <h2 className="text-2xl font-bold text-slate-800">พล.ท.ดร.กริช อินทราทิพย์</h2>
                        <p className="text-indigo-600 font-medium mb-4">Lt.Gen.Dr. Krich Intratip</p>
                        <Badge variant="secondary" className="mb-6 px-4 py-1">Lead Developer & Project Manager</Badge>

                        <p className="text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
                            พัฒนาระบบนี้ขึ้นเพื่อยกระดับการทำงานด้วยดิจิทัลเทคโนโลยีและ AI
                            สำหรับสนับสนุนภารกิจของกองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร (กอ.รมน.)
                        </p>

                        <div className="flex justify-center gap-4">
                            <Link href="https://portfolio-two-sepia-33.vercel.app/" target="_blank" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span>Visit Portfolio</span>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <footer className="mt-12 text-center text-slate-500 text-sm">
                <p>© {beYear} ({currentYear}) All Rights Reserved.</p>
                <p className="mt-1">
                    Developed by <a href="https://portfolio-two-sepia-33.vercel.app/" target="_blank" className="text-indigo-600 hover:underline">พล.ท.ดร.กริช อินทราทิพย์</a>
                </p>
            </footer>
        </div>
    );
}
