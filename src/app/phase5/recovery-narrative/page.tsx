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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Sparkles, Copy, Save, Loader2, TrendingUp, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react';
import { generateSARContent } from '@/lib/google/ai-api';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import ExportEbookButton from '@/components/export/ExportEbookButton';

interface KPISummary {
    kpiCode: string;
    kpiName: string;
    baseline: number;
    target: number;
    current: number;
    unit: string;
    trend: 'improving' | 'declining' | 'stable';
    gap: number;
}

const NARRATIVE_TYPES = [
    { id: 'success', label: 'Success Story', description: 'เล่าเรื่องความสำเร็จและปัจจัยแห่งความสำเร็จ' },
    { id: 'gap_analysis', label: 'Gap Analysis', description: 'วิเคราะห์ช่องว่างและสาเหตุที่ไม่บรรลุเป้าหมาย' },
    { id: 'recovery_plan', label: 'Recovery Plan', description: 'แผนการปรับปรุงและกลับมาสู่เส้นทาง' },
    { id: 'comprehensive', label: 'Comprehensive', description: 'สรุปรวมทั้งผลสำเร็จ ปัญหา และแผนปรับปรุง' },
];

export default function RecoveryNarrativePage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const { apiKey, selectedModel } = useAIConfigStore();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [kpiSummaries, setKpiSummaries] = useState<KPISummary[]>([]);
    const [selectedNarrativeType, setSelectedNarrativeType] = useState('comprehensive');
    const [additionalContext, setAdditionalContext] = useState('');
    const [generatedNarrative, setGeneratedNarrative] = useState('');

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    useEffect(() => {
        fetchKPIData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.unitId, selectedCycle]);

    const fetchKPIData = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            setKpiSummaries([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const kpiQ = query(
                collection(db, 'kpi_definitions'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id)
            );
            const kpiSnap = await getDocs(kpiQ);
            const kpiDefs: Array<Record<string, unknown> & { id: string }> = [];
            kpiSnap.forEach(d => kpiDefs.push({ id: d.id, ...d.data() }));

            const dataQ = query(collection(db, 'kpi_data'), where('unitId', '==', user.unitId));
            const dataSnap = await getDocs(dataQ);
            const dataMap = new Map<string, Record<string, unknown>>();
            dataSnap.forEach(d => {
                const data = d.data();
                const key = data.kpiId;
                const existing = dataMap.get(key);
                if (!existing || (data.period && existing.period && data.period > existing.period)) {
                    dataMap.set(key, data);
                }
            });

            const summaries: KPISummary[] = kpiDefs.map(kpi => {
                const latestData = dataMap.get(kpi.id);
                const current = typeof latestData?.value === 'number' ? latestData.value : 0;
                const baseline = typeof kpi.baseline === 'number' ? kpi.baseline : 0;
                const target = typeof kpi.target === 'number' ? kpi.target : 0;

                let trend: 'improving' | 'declining' | 'stable' = 'stable';
                if (kpi.direction === 'up') {
                    trend = current > baseline ? 'improving' : current < baseline ? 'declining' : 'stable';
                } else if (kpi.direction === 'down') {
                    trend = current < baseline ? 'improving' : current > baseline ? 'declining' : 'stable';
                }

                const gap = target - current;

                return {
                    kpiCode: typeof kpi.code === 'string' ? kpi.code : '',
                    kpiName: typeof kpi.name === 'string' ? kpi.name : '',
                    baseline,
                    target,
                    current,
                    unit: typeof kpi.unit === 'string' ? kpi.unit : '',
                    trend,
                    gap,
                };
            });

            setKpiSummaries(summaries);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            toast.error('กรุณาตั้งค่า Gemini API Key ที่ Settings > AI Config');
            return;
        }

        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        if (kpiSummaries.length === 0) {
            toast.error('ไม่มีข้อมูล KPI - กรุณาสร้างและกรอกข้อมูล KPI ก่อน');
            return;
        }

        setGenerating(true);
        try {
            const narrativeType = NARRATIVE_TYPES.find(t => t.id === selectedNarrativeType);

            // Prepare KPI summary for AI
            const kpiSummaryText = kpiSummaries.map(k =>
                `- ${k.kpiCode}: ${k.kpiName}\n  Baseline: ${k.baseline} ${k.unit}, เป้าหมาย: ${k.target} ${k.unit}, ผลปัจจุบัน: ${k.current} ${k.unit}\n  แนวโน้ม: ${k.trend === 'improving' ? 'ดีขึ้น' : k.trend === 'declining' ? 'แย่ลง' : 'คงที่'}, Gap: ${k.gap} ${k.unit}`
            ).join('\n\n');

            const prompt = `คุณเป็นผู้เชี่ยวชาญด้านการเขียนรายงาน Self Assessment Report (SAR) สำหรับ PMQA 4.0

ประเภทบทวิเคราะห์: ${narrativeType?.label} - ${narrativeType?.description}

ข้อมูล KPI และผลลัพธ์:
${kpiSummaryText}

${additionalContext ? `\nบริบทเพิ่มเติม:\n${additionalContext}` : ''}

กรุณาเขียนบทวิเคราะห์ผลลัพธ์สำหรับหมวด 7 โดย:
${selectedNarrativeType === 'success' ? `
1. เน้นย้ำความสำเร็จที่โดดเด่น
2. อธิบายปัจจัยแห่งความสำเร็จ
3. บทเรียนที่ได้รับ
4. แนวทางการสานต่อความสำเร็จ
` : selectedNarrativeType === 'gap_analysis' ? `
1. ระบุ KPI ที่ไม่บรรลุเป้าหมาย
2. วิเคราะห์สาเหตุของช่องว่าง
3. ผลกระทบที่อาจเกิดขึ้น
4. ข้อจำกัดและอุปสรรค
` : selectedNarrativeType === 'recovery_plan' ? `
1. สรุปปัญหาและช่องว่างหลัก
2. เสนอแนวทางการปรับปรุงที่เป็นรูปธรรม
3. กำหนดเป้าหมายและตัวชี้วัดความสำเร็จ
4. แผนการติดตามและรายงาน
` : `
1. สรุปภาพรวมผลการดำเนินงาน
2. ไฮไลท์ความสำเร็จที่สำคัญ
3. วิเคราะห์ปัญหาและอุปสรรค
4. แนวทางการพัฒนาต่อเนื่อง
5. บทสรุปและข้อเสนอแนะ
`}

ใช้ภาษาราชการที่เป็นทางการ อ้างอิงข้อมูล KPI ที่ให้มา ความยาว 400-600 คำ

เขียนบทวิเคราะห์:`;

            const content = await generateSARContent(apiKey, selectedModel, prompt);
            setGeneratedNarrative(content);
            toast.success('สร้างบทวิเคราะห์สำเร็จ');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
            toast.error(errorMessage);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedNarrative.trim()) {
            toast.error('ไม่มีบทวิเคราะห์ที่จะบันทึก');
            return;
        }
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        try {
            await addDoc(collection(db, 'recovery_narratives'), {
                unitId: user!.unitId,
                cycleId: selectedCycle.id,
                narrativeType: selectedNarrativeType,
                content: generatedNarrative,
                createdAt: serverTimestamp(),
            });
            toast.success('บันทึกบทวิเคราะห์สำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedNarrative);
        toast.success('คัดลอกบทวิเคราะห์แล้ว');
    };

    const improvingCount = kpiSummaries.filter(k => k.trend === 'improving').length;
    const decliningCount = kpiSummaries.filter(k => k.trend === 'declining').length;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <BookOpen className="h-8 w-8 text-amber-600" />
                            Recovery Narrative Builder
                        </h1>
                        <p className="text-muted-foreground">สร้างบทวิเคราะห์ผลลัพธ์ด้วย AI (App 5.2)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-amber-700 border-amber-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-sm">
                            Model: {selectedModel || 'ไม่ได้ตั้งค่า'}
                        </Badge>
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
                        {/* KPI Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>สรุปข้อมูล KPI</CardTitle>
                                <CardDescription>ภาพรวมผลการดำเนินงาน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-4">กำลังโหลด...</div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">ตัวชี้วัดทั้งหมด:</span>
                                            <Badge variant="outline">{kpiSummaries.length}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                แนวโน้มดีขึ้น:
                                            </span>
                                            <Badge className="bg-green-100 text-green-800">{improvingCount}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm flex items-center gap-1">
                                                <TrendingDown className="h-4 w-4 text-red-600" />
                                                ต้องปรับปรุง:
                                            </span>
                                            <Badge className="bg-red-100 text-red-800">{decliningCount}</Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>ตั้งค่าบทวิเคราะห์</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>ประเภทบทวิเคราะห์</Label>
                                    <Select value={selectedNarrativeType} onValueChange={setSelectedNarrativeType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NARRATIVE_TYPES.map(type => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    <div>
                                                        <div className="font-medium">{type.label}</div>
                                                        <div className="text-xs text-muted-foreground">{type.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>บริบทเพิ่มเติม (ถ้ามี)</Label>
                                    <Textarea
                                        value={additionalContext}
                                        onChange={(e) => setAdditionalContext(e.target.value)}
                                        placeholder="เช่น: โครงการสำคัญที่ดำเนินการ, อุปสรรคที่พบ, ปัจจัยภายนอกที่มีผล..."
                                        rows={6}
                                    />
                                </div>
                                <Button onClick={handleGenerate} disabled={generating} className="w-full gap-2">
                                    {generating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            กำลังสร้าง...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            สร้างบทวิเคราะห์
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Generated Narrative */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>บทวิเคราะห์ที่สร้าง</CardTitle>
                                        <CardDescription>
                                            {NARRATIVE_TYPES.find(t => t.id === selectedNarrativeType)?.label}
                                        </CardDescription>
                                    </div>
                                    {generatedNarrative && (
                                        <div className="flex gap-2">
                                            <ExportEbookButton
                                                data={{
                                                    cycleName: selectedCycle?.name || '',
                                                    unitName: user?.unitId || 'Unknown Unit',
                                                    sections: [{
                                                        id: '7.1',
                                                        title: 'หมวด 7: ผลลัพธ์การดำเนินการ',
                                                        content: generatedNarrative,
                                                        evidences: [] // Add evidences if available
                                                    }]
                                                }}
                                            />
                                            <Button size="sm" variant="outline" onClick={handleCopy}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={handleSave}>
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {generatedNarrative ? (
                                    <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border min-h-[500px]">
                                        <pre className="whitespace-pre-wrap font-sans text-slate-700">{generatedNarrative}</pre>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-muted-foreground">
                                        <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                        <p>เลือกประเภทบทวิเคราะห์และคลิก &ldquo;สร้างบทวิเคราะห์&rdquo;</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
