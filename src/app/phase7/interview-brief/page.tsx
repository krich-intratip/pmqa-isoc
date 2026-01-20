'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import { useAIConfigStore } from '@/stores/ai-config-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Presentation, Sparkles, Copy, Download, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { generateSARContent } from '@/lib/google/ai-api';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

const BRIEF_SECTIONS = [
    { id: 'overview', label: 'ภาพรวมหน่วยงาน', description: 'วิสัยทัศน์ พันธกิจ โครงสร้าง' },
    { id: 'highlights', label: 'ไฮไลท์ผลงาน', description: 'ความสำเร็จที่โดดเด่น' },
    { id: 'kpi', label: 'สรุป KPI สำคัญ', description: 'ตัวชี้วัดหลักและผลการดำเนินงาน' },
    { id: 'improvements', label: 'การพัฒนาปรับปรุง', description: 'สิ่งที่พัฒนาจากปีก่อน' },
    { id: 'challenges', label: 'ความท้าทาย', description: 'อุปสรรคและแนวทางแก้ไข' },
    { id: 'plans', label: 'แผนงานอนาคต', description: 'ทิศทางและเป้าหมาย' },
];

export default function InterviewBriefPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const { apiKey, selectedModel } = useAIConfigStore();
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSections, setSelectedSections] = useState<string[]>(BRIEF_SECTIONS.map(s => s.id));
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [generatedBrief, setGeneratedBrief] = useState('');
    const [orgData, setOrgData] = useState<{
        context: Record<string, unknown> | null;
        kpis: Record<string, unknown>[];
    } | null>(null);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        fetchOrgData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.unitId, selectedCycle]);

    const fetchOrgData = async () => {
        if (!user?.unitId) return;
        setLoading(true);
        try {
            // Fetch context pack
            const contextSnap = await getDocs(query(collection(db, 'context_packs'), where('unitId', '==', user.unitId)));
            let contextData: Record<string, unknown> | null = null;
            contextSnap.forEach(d => contextData = d.data());

            // Fetch KPI summary
            const kpiSnap = await getDocs(query(collection(db, 'kpi_definitions'), where('unitId', '==', user.unitId)));
            const kpis: Record<string, unknown>[] = [];
            kpiSnap.forEach(d => kpis.push(d.data()));

            setOrgData({ context: contextData, kpis });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (id: string) => {
        setSelectedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า Gemini API Key ที่ Settings > AI Config');
            return;
        }

        setGenerating(true);
        try {
            const selectedLabels = BRIEF_SECTIONS.filter(s => selectedSections.includes(s.id)).map(s => s.label);

            const orgName = orgData?.context && typeof orgData.context.orgName === 'string' ? orgData.context.orgName : 'ไม่ระบุ';
            const vision = orgData?.context && typeof orgData.context.vision === 'string' ? orgData.context.vision : 'ไม่ระบุ';
            const mission = orgData?.context && typeof orgData.context.mission === 'string' ? orgData.context.mission : 'ไม่ระบุ';

            const contextInfo = orgData?.context ? `
ข้อมูลองค์กร:
- ชื่อ: ${orgName}
- วิสัยทัศน์: ${vision}
- พันธกิจ: ${mission}
` : 'ไม่มีข้อมูล Context Pack';

            const kpiInfo = orgData?.kpis && orgData.kpis.length > 0 ? `
KPI จำนวน ${orgData.kpis.length} ตัว
` : 'ไม่มีข้อมูล KPI';

            const prompt = `คุณเป็นที่ปรึกษาผู้เชี่ยวชาญด้าน PMQA 4.0 กรุณาสร้าง Interview Brief สำหรับเตรียมรับการตรวจประเมิน

${contextInfo}
${kpiInfo}

หัวข้อที่ต้องการ: ${selectedLabels.join(', ')}

${additionalNotes ? `หมายเหตุเพิ่มเติม: ${additionalNotes}` : ''}

กรุณาสร้าง Interview Brief ประกอบด้วย:
1. Executive Summary (สรุปสำหรับผู้บริหาร 2-3 ประโยค)
2. เนื้อหาตามหัวข้อที่เลือก (แต่ละหัวข้อ 3-5 bullet points)
3. Key Messages (ประเด็นหลักที่ต้องสื่อสาร)
4. คำถามที่อาจถูกถาม (พร้อมแนวทางตอบ)

ใช้ภาษาที่กระชับ ชัดเจน เหมาะสำหรับนำไปใช้บรรยายในห้องประชุม
ความยาวประมาณ 500-800 คำ`;

            const content = await generateSARContent(apiKey, selectedModel, prompt);
            setGeneratedBrief(content);
            toast.success('สร้าง Interview Brief สำเร็จ');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
            toast.error(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedBrief);
        toast.success('คัดลอกแล้ว');
    };

    const handleDownload = () => {
        const blob = new Blob([generatedBrief], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Interview_Brief_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('ดาวน์โหลดสำเร็จ');
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Presentation className="h-8 w-8 text-rose-600" />
                            Interview Brief Generator
                        </h1>
                        <p className="text-muted-foreground">สร้างเอกสารเตรียมรับการตรวจประเมิน (App 7.1)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-rose-700 border-rose-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Badge variant="outline">Model: {selectedModel || 'ไม่ได้ตั้งค่า'}</Badge>
                    </div>
                </div>

                {/* Warning if no cycle selected */}
                {!selectedCycle && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-800">ยังไม่ได้เลือกรอบการประเมิน</p>
                                    <p className="text-sm text-yellow-700">กรุณาเลือกรอบการประเมินจาก Header ด้านบน</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Configuration */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>เลือกหัวข้อ</CardTitle>
                                <CardDescription>เลือกหัวข้อที่ต้องการรวมใน Brief</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {BRIEF_SECTIONS.map((section) => (
                                        <div key={section.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <Checkbox
                                                checked={selectedSections.includes(section.id)}
                                                onCheckedChange={() => toggleSection(section.id)}
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <div className="font-medium text-sm">{section.label}</div>
                                                <div className="text-xs text-muted-foreground">{section.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>หมายเหตุเพิ่มเติม</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="ระบุประเด็นพิเศษที่ต้องการเน้น หรือบริบทเฉพาะ..."
                                    rows={4}
                                />
                                <Button onClick={handleGenerate} disabled={generating} className="w-full mt-4 gap-2">
                                    {generating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            กำลังสร้าง...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            สร้าง Interview Brief
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Generated Brief */}
                    <Card className="h-fit">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Interview Brief</CardTitle>
                                    <CardDescription>เอกสารเตรียมรับการตรวจประเมิน</CardDescription>
                                </div>
                                {generatedBrief && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={handleCopy}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleDownload}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {generatedBrief ? (
                                <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border min-h-[500px]">
                                    <pre className="whitespace-pre-wrap font-sans text-slate-700">{generatedBrief}</pre>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-muted-foreground">
                                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>เลือกหัวข้อและคลิก &ldquo;สร้าง Interview Brief&rdquo;</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
