'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface OutlineSection {
    id: string;
    category: number;
    title: string;
    subsections: string[];
    required: boolean;
}

const OUTLINE_TEMPLATE: OutlineSection[] = [
    {
        id: 'cat1',
        category: 1,
        title: 'หมวด 1: การนำองค์กร',
        subsections: [
            '1.1 วิสัยทัศน์และพันธกิจ',
            '1.2 การสื่อสารและผลการปฏิบัติงานขององค์กร',
            '1.3 บรรยากาศการทำงาน',
        ],
        required: true,
    },
    {
        id: 'cat2',
        category: 2,
        title: 'หมวด 2: การวางแผนเชิงกลยุทธ์',
        subsections: [
            '2.1 การจัดทำกลยุทธ์',
            '2.2 การนำกลยุทธ์ไปปฏิบัติ',
        ],
        required: true,
    },
    {
        id: 'cat3',
        category: 3,
        title: 'หมวด 3: การให้ความสำคัญกับผู้รับบริการและผู้มีส่วนได้ส่วนเสีย',
        subsections: [
            '3.1 ความต้องการของผู้รับบริการและผู้มีส่วนได้ส่วนเสีย',
            '3.2 การมีส่วนร่วมของผู้รับบริการและผู้มีส่วนได้ส่วนเสีย',
        ],
        required: true,
    },
    {
        id: 'cat4',
        category: 4,
        title: 'หมวด 4: การวัด การวิเคราะห์ และการจัดการความรู้',
        subsections: [
            '4.1 การวัดและวิเคราะห์ผลการดำเนินการขององค์กร',
            '4.2 การจัดการความรู้ การสารสนเทศ และเทคโนโลยีสารสนเทศ',
        ],
        required: true,
    },
    {
        id: 'cat5',
        category: 5,
        title: 'หมวด 5: การให้ความสำคัญกับบุคลากร',
        subsections: [
            '5.1 สภาพแวดล้อมการทำงาน',
            '5.2 ความผูกพันของบุคลากร',
        ],
        required: true,
    },
    {
        id: 'cat6',
        category: 6,
        title: 'หมวด 6: การให้ความสำคัญกับระบบปฏิบัติการ',
        subsections: [
            '6.1 กระบวนการทำงาน',
            '6.2 ประสิทธิผลของการดำเนินการ',
        ],
        required: true,
    },
    {
        id: 'cat7',
        category: 7,
        title: 'หมวด 7: ผลลัพธ์การดำเนินการ',
        subsections: [
            '7.1 ผลลัพธ์ด้านผลผลิตและผลลัพธ์',
            '7.2 ผลลัพธ์ด้านผู้รับบริการและผู้มีส่วนได้ส่วนเสีย',
            '7.3 ผลลัพธ์ด้านบุคลากร',
            '7.4 ผลลัพธ์ด้านความเป็นผู้นำและการกำกับดูแล',
            '7.5 ผลลัพธ์ด้านงบประมาณ การเงิน และตลาด',
        ],
        required: true,
    },
];

export default function SAROutlinePage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [orgName, setOrgName] = useState('');
    const [fiscalYear, setFiscalYear] = useState('2569');

    useEffect(() => {
        // Auto-select all sections by default
        setSelectedSections(OUTLINE_TEMPLATE.map(s => s.id));
        setLoading(false);
    }, []);

    const toggleSection = (id: string) => {
        setSelectedSections(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const generateOutline = async () => {
        if (!orgName.trim()) {
            toast.error('กรุณากรอกชื่อหน่วยงาน');
            return;
        }

        setGenerating(true);
        try {
            const selectedOutlines = OUTLINE_TEMPLATE.filter(s => selectedSections.includes(s.id));

            // Generate markdown outline
            let markdown = `# รายงานการประเมินตนเอง (SAR)\n## ${orgName}\n### ปีงบประมาณ ${fiscalYear}\n\n---\n\n`;
            markdown += `## สารบัญ\n\n`;

            selectedOutlines.forEach(section => {
                markdown += `### ${section.title}\n`;
                section.subsections.forEach((sub, idx) => {
                    markdown += `- ${sub}\n`;
                });
                markdown += `\n`;
            });

            markdown += `\n---\n\n`;

            selectedOutlines.forEach(section => {
                markdown += `## ${section.title}\n\n`;
                section.subsections.forEach(sub => {
                    markdown += `### ${sub}\n\n`;
                    markdown += `*[เนื้อหาส่วนนี้จะเขียนโดยใช้ SAR Writer Assistant (App 4.2)]*\n\n`;
                    markdown += `---\n\n`;
                });
            });

            // Save to Firestore
            await setDoc(doc(db, 'sar_outlines', user!.unitId!), {
                unitId: user!.unitId,
                orgName,
                fiscalYear,
                selectedSections: selectedSections,
                markdown,
                createdAt: serverTimestamp(),
            });

            // Download as markdown file
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SAR_Outline_${orgName.replace(/\s+/g, '_')}_${fiscalYear}.md`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('สร้างโครงร่าง SAR สำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <FileText className="h-8 w-8 text-indigo-600" />
                            SAR Outline Generator
                        </h1>
                        <p className="text-muted-foreground">สร้างโครงร่าง Self Assessment Report (App 4.1)</p>
                    </div>
                    <Button onClick={generateOutline} disabled={generating} size="lg" className="gap-2">
                        {generating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                กำลังสร้าง...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                สร้างและดาวน์โหลด
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>ตั้งค่า</CardTitle>
                                <CardDescription>ข้อมูลพื้นฐานสำหรับ SAR</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>ชื่อหน่วยงาน</Label>
                                    <Input
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="เช่น กองการสื่อสาร กอ.รมน."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>ปีงบประมาณ</Label>
                                    <Input
                                        value={fiscalYear}
                                        onChange={(e) => setFiscalYear(e.target.value)}
                                        placeholder="2569"
                                    />
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">เลือกหมวด</span>
                                        <Badge variant="outline">{selectedSections.length}/7</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        โครงร่างจะรวมเฉพาะหมวดที่เลือก
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section Selection */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    โครงสร้าง SAR
                                </CardTitle>
                                <CardDescription>เลือกหมวดที่ต้องการรวมในรายงาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8">กำลังโหลด...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {OUTLINE_TEMPLATE.map((section) => (
                                            <div
                                                key={section.id}
                                                className={`p-4 border rounded-lg transition-all ${selectedSections.includes(section.id)
                                                    ? 'border-indigo-200 bg-indigo-50'
                                                    : 'border-slate-200 bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={selectedSections.includes(section.id)}
                                                        onCheckedChange={() => toggleSection(section.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-semibold text-slate-800">{section.title}</span>
                                                            {selectedSections.includes(section.id) && (
                                                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                                                            )}
                                                        </div>
                                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                                            {section.subsections.map((sub, idx) => (
                                                                <li key={idx}>• {sub}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="mt-6 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900 mb-1">ขั้นตอนถัดไป</p>
                                <p className="text-sm text-blue-700">
                                    หลังจากสร้างโครงร่างแล้ว ใช้ <strong>SAR Writer Assistant (App 4.2)</strong> เพื่อเขียนเนื้อหาในแต่ละหมวดด้วย AI
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
