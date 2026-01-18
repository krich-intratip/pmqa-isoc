'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Download, Settings, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ThaiUtils from '@/lib/utils/thai-utils';

const TEMPLATE_TYPES = [
    {
        id: 'kpi_data',
        name: 'ข้อมูล KPI รายเดือน',
        description: 'Template สำหรับกรอกข้อมูล KPI รายเดือน',
        columns: ['รหัส KPI', 'ชื่อ KPI', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'เป้าหมาย', 'หน่วย'],
        category: 'Data Collection'
    },
    {
        id: 'satisfaction_survey',
        name: 'แบบสำรวจความพึงพอใจ',
        description: 'Template สำหรับสรุปผลแบบสอบถาม',
        columns: ['ลำดับ', 'หัวข้อประเมิน', 'จำนวนผู้ตอบ', 'คะแนนเฉลี่ย', 'ระดับความพึงพอใจ'],
        category: 'Survey'
    },
    {
        id: 'evidence_register',
        name: 'ทะเบียนหลักฐาน',
        description: 'Template สำหรับบันทึกรายการหลักฐาน',
        columns: ['หมวด', 'เกณฑ์', 'รหัสหลักฐาน', 'ชื่อหลักฐาน', 'ลิงก์', 'สถานะ', 'หมายเหตุ'],
        category: 'Evidence'
    },
    {
        id: 'risk_register',
        name: 'ทะเบียนความเสี่ยง',
        description: 'Template สำหรับบันทึกความเสี่ยงองค์กร',
        columns: ['รหัส', 'ความเสี่ยง', 'ผลกระทบ', 'โอกาสเกิด', 'ระดับ', 'มาตรการ', 'ผู้รับผิดชอบ'],
        category: 'Risk'
    },
    {
        id: 'action_plan',
        name: 'แผนปฏิบัติการ',
        description: 'Template สำหรับติดตามแผนงาน',
        columns: ['กิจกรรม', 'ผู้รับผิดชอบ', 'วันเริ่ม', 'วันสิ้นสุด', 'สถานะ', 'ผลการดำเนินงาน', 'หมายเหตุ'],
        category: 'Planning'
    },
    {
        id: 'budget_tracking',
        name: 'ติดตามงบประมาณ',
        description: 'Template สำหรับติดตามการใช้งบประมาณ',
        columns: ['รหัสงบ', 'รายการ', 'งบที่ได้รับ', 'งบที่ใช้', 'คงเหลือ', 'ร้อยละ', 'หมายเหตุ'],
        category: 'Budget'
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Data Collection': 'bg-blue-100 text-blue-800',
    'Survey': 'bg-green-100 text-green-800',
    'Evidence': 'bg-purple-100 text-purple-800',
    'Risk': 'bg-red-100 text-red-800',
    'Planning': 'bg-yellow-100 text-yellow-800',
    'Budget': 'bg-orange-100 text-orange-800',
};

export default function ExcelTemplatePage() {
    const { user } = useAuthStore();
    const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
    const [unitName, setUnitName] = useState('');
    const [year, setYear] = useState((new Date().getFullYear() + 543).toString());
    const [generating, setGenerating] = useState(false);

    const handleToggleTemplate = (id: string) => {
        setSelectedTemplates(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedTemplates.length === TEMPLATE_TYPES.length) {
            setSelectedTemplates([]);
        } else {
            setSelectedTemplates(TEMPLATE_TYPES.map(t => t.id));
        }
    };

    const generateCSV = (template: typeof TEMPLATE_TYPES[0]) => {
        const header = template.columns.join(',');
        const sampleRow = template.columns.map(() => '').join(',');
        return `${header}\n${sampleRow}\n${sampleRow}\n${sampleRow}`;
    };

    const handleGenerate = async () => {
        if (selectedTemplates.length === 0) {
            toast.error('กรุณาเลือกอย่างน้อย 1 template');
            return;
        }

        setGenerating(true);

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate each selected template
        selectedTemplates.forEach(templateId => {
            const template = TEMPLATE_TYPES.find(t => t.id === templateId);
            if (!template) return;

            const csvContent = generateCSV(template);
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `PMQA_${year}_${template.id}_${unitName || 'template'}.csv`;
            link.click();
        });

        toast.success(`สร้าง ${selectedTemplates.length} Template สำเร็จ!`);
        setGenerating(false);
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            Excel Template Generator
                        </h1>
                        <p className="text-muted-foreground">สร้าง Template สำหรับเก็บข้อมูล (App 2.3)</p>
                    </div>
                </div>

                {/* Configuration */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            ตั้งค่า Template
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ชื่อหน่วยงาน (ย่อ)</Label>
                                <Input
                                    value={unitName}
                                    onChange={(e) => setUnitName(e.target.value)}
                                    placeholder="เช่น กอ.รมน.กทม."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ปี พ.ศ.</Label>
                                <Input
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>เลือก Template</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                {selectedTemplates.length === TEMPLATE_TYPES.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                            </Button>
                        </div>
                        <CardDescription>เลือก Template ที่ต้องการดาวน์โหลด</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {TEMPLATE_TYPES.map((template) => (
                                <div
                                    key={template.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTemplates.includes(template.id)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleToggleTemplate(template.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedTemplates.includes(template.id)}
                                            onCheckedChange={() => handleToggleTemplate(template.id)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{template.name}</span>
                                                {selectedTemplates.includes(template.id) && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                            <Badge className={CATEGORY_COLORS[template.category]}>{template.category}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Selected */}
                {selectedTemplates.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>ตัวอย่างคอลัมน์</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedTemplates.map(templateId => {
                                    const template = TEMPLATE_TYPES.find(t => t.id === templateId);
                                    if (!template) return null;
                                    return (
                                        <div key={templateId} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="font-medium mb-2">{template.name}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {template.columns.map((col, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">{col}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Generate Button */}
                <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleGenerate}
                    disabled={generating || selectedTemplates.length === 0}
                >
                    {generating ? (
                        <>กำลังสร้าง Template...</>
                    ) : (
                        <>
                            <Download className="h-5 w-5 mr-2" />
                            ดาวน์โหลด {selectedTemplates.length} Template
                        </>
                    )}
                </Button>
            </div>
        </ProtectedRoute>
    );
}
