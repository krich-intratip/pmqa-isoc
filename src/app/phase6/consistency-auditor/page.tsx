'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

interface AuditCheck {
    id: string;
    category: string;
    checkName: string;
    description: string;
    status: 'pass' | 'warning' | 'fail' | 'pending';
    details: string;
    linkedItems: string[];
}


export default function ConsistencyAuditorPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [loading, setLoading] = useState(false);
    const [auditResults, setAuditResults] = useState<AuditCheck[]>([]);
    const [lastAuditTime, setLastAuditTime] = useState<Date | null>(null);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const runAudit = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }
        setLoading(true);

        try {
            const results: AuditCheck[] = [];

            // Check 1: Context Pack
            const contextSnap = await getDocs(query(collection(db, 'context_packs'), where('unitId', '==', user.unitId)));
            const hasContext = contextSnap.size > 0;
            results.push({
                id: 'org-profile',
                category: 'หมวด 1',
                checkName: 'ความครบถ้วนของข้อมูลองค์กร',
                description: 'ตรวจสอบ Context Pack มีข้อมูลครบถ้วน',
                status: hasContext ? 'pass' : 'fail',
                details: hasContext ? 'พบข้อมูล Context Pack' : 'ยังไม่มีข้อมูล Context Pack',
                linkedItems: ['/phase3/context-pack'],
            });

            // Check 2: Strategy-KPI Links
            const strategySnap = await getDocs(query(collection(db, 'strategy_links'), where('unitId', '==', user.unitId)));
            const strategyCount = strategySnap.size;
            results.push({
                id: 'strategy-kpi',
                category: 'หมวด 2',
                checkName: 'ความเชื่อมโยง Strategy-KPI',
                description: 'ทุก Strategy ต้องมี KPI รองรับ',
                status: strategyCount >= 3 ? 'pass' : strategyCount > 0 ? 'warning' : 'fail',
                details: `พบ ${strategyCount} การเชื่อมโยง`,
                linkedItems: ['/phase3/strategy-linker'],
            });

            // Check 3: KPI Definitions
            const kpiSnap = await getDocs(query(collection(db, 'kpi_definitions'), where('unitId', '==', user.unitId)));
            const kpiCount = kpiSnap.size;
            let kpiWithData = 0;
            kpiSnap.forEach(d => {
                const data = d.data();
                if (data.baseline !== undefined && data.target !== undefined) kpiWithData++;
            });
            results.push({
                id: 'kpi-data',
                category: 'หมวด 4',
                checkName: 'ข้อมูล KPI ครบถ้วน',
                description: 'ทุก KPI ต้องมีข้อมูล Baseline และ Target',
                status: kpiCount > 0 && kpiWithData === kpiCount ? 'pass' : kpiCount > 0 ? 'warning' : 'fail',
                details: `${kpiWithData}/${kpiCount} KPI มีข้อมูลครบ`,
                linkedItems: ['/phase2/kpi-dictionary'],
            });

            // Check 4: Evidence
            const evidenceSnap = await getDocs(query(collection(db, 'evidence'), where('unitId', '==', user.unitId)));
            const evidenceCount = evidenceSnap.size;
            results.push({
                id: 'evidence-complete',
                category: 'หมวด 1-6',
                checkName: 'หลักฐานครบทุกหมวด',
                description: 'มีหลักฐานอ้างอิงครบทุกหมวด',
                status: evidenceCount >= 10 ? 'pass' : evidenceCount > 0 ? 'warning' : 'fail',
                details: `พบ ${evidenceCount} รายการหลักฐาน`,
                linkedItems: ['/phase1/evidence'],
            });

            // Check 5: KPI Results Data
            const kpiDataSnap = await getDocs(query(collection(db, 'kpi_data'), where('unitId', '==', user.unitId)));
            const dataCount = kpiDataSnap.size;
            results.push({
                id: 'results-trend',
                category: 'หมวด 7',
                checkName: 'ผลลัพธ์มีแนวโน้ม',
                description: 'ข้อมูลผลลัพธ์แสดงแนวโน้มและเปรียบเทียบ',
                status: dataCount >= kpiCount ? 'pass' : dataCount > 0 ? 'warning' : 'fail',
                details: `พบ ${dataCount} รายการข้อมูลผลลัพธ์`,
                linkedItems: ['/phase5/results-pack'],
            });

            // Check 6: Risks
            const riskSnap = await getDocs(query(collection(db, 'risks'), where('unitId', '==', user.unitId)));
            let risksWithMitigation = 0;
            riskSnap.forEach(d => {
                const data = d.data();
                if (data.mitigation && data.mitigation.trim()) risksWithMitigation++;
            });
            results.push({
                id: 'risk-mitigation',
                category: 'หมวด 6',
                checkName: 'ความเสี่ยงมีแผนจัดการ',
                description: 'ทุกความเสี่ยงต้องมีแผนตอบสนอง',
                status: riskSnap.size > 0 && risksWithMitigation === riskSnap.size ? 'pass' :
                    riskSnap.size > 0 ? 'warning' : 'pending',
                details: riskSnap.size > 0 ? `${risksWithMitigation}/${riskSnap.size} มีแผนจัดการ` : 'ยังไม่มีข้อมูลความเสี่ยง',
                linkedItems: ['/phase3/risk-analyzer'],
            });

            // Check 7: SAR Content
            const sarSnap = await getDocs(query(collection(db, 'sar_contents'), where('unitId', '==', user.unitId)));
            const sarCount = sarSnap.size;
            results.push({
                id: 'sar-coverage',
                category: 'SAR',
                checkName: 'เนื้อหา SAR ครบถ้วน',
                description: 'มีเนื้อหา SAR สำหรับทุกหัวข้อย่อย',
                status: sarCount >= 10 ? 'pass' : sarCount > 0 ? 'warning' : 'fail',
                details: `พบ ${sarCount} เนื้อหา SAR`,
                linkedItems: ['/phase4/sar-writer'],
            });

            // Check 8: Owner Matrix
            const ownerSnap = await getDocs(query(collection(db, 'owner_matrix'), where('unitId', '==', user.unitId)));
            const ownerCount = ownerSnap.size;
            results.push({
                id: 'owner-assigned',
                category: 'การกำกับ',
                checkName: 'มีผู้รับผิดชอบทุกหมวด',
                description: 'ทุกหมวดต้องมี Owner กำหนด',
                status: ownerCount >= 7 ? 'pass' : ownerCount > 0 ? 'warning' : 'fail',
                details: `กำหนดผู้รับผิดชอบแล้ว ${ownerCount} หมวด`,
                linkedItems: ['/phase0/owner-matrix'],
            });

            setAuditResults(results);
            setLastAuditTime(new Date());
            toast.success('ตรวจสอบเสร็จสิ้น');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const passCount = auditResults.filter(r => r.status === 'pass').length;
    const warningCount = auditResults.filter(r => r.status === 'warning').length;
    const failCount = auditResults.filter(r => r.status === 'fail').length;
    const overallScore = auditResults.length > 0
        ? Math.round((passCount * 100 + warningCount * 50) / auditResults.length)
        : 0;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <ShieldCheck className="h-8 w-8 text-blue-600" />
                            Cross-Consistency Auditor
                        </h1>
                        <p className="text-muted-foreground">ตรวจสอบความสอดคล้องข้ามหมวด (App 6.1)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-blue-700 border-blue-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Button onClick={runAudit} disabled={loading || !selectedCycle} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'กำลังตรวจสอบ...' : 'เริ่มตรวจสอบ'}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                            <div className="text-3xl font-bold text-blue-600">{overallScore}%</div>
                            <div className="text-sm text-muted-foreground">คะแนนความพร้อม</div>
                            <Progress value={overallScore} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <span className="text-2xl font-bold text-green-600">{passCount}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">ผ่านเกณฑ์</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                <span className="text-2xl font-bold text-yellow-600">{warningCount}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">ควรปรับปรุง</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-6 w-6 text-red-600" />
                                <span className="text-2xl font-bold text-red-600">{failCount}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">ต้องดำเนินการ</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            ผลการตรวจสอบ
                        </CardTitle>
                        <CardDescription>
                            {lastAuditTime
                                ? `ตรวจสอบล่าสุด: ${lastAuditTime.toLocaleString('th-TH')}`
                                : 'คลิก "เริ่มตรวจสอบ" เพื่อดูผลการตรวจสอบ'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {auditResults.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ShieldCheck className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p>คลิกปุ่ม &ldquo;เริ่มตรวจสอบ&rdquo; เพื่อวิเคราะห์ความสอดคล้อง</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">หมวด</TableHead>
                                        <TableHead>รายการตรวจสอบ</TableHead>
                                        <TableHead>รายละเอียด</TableHead>
                                        <TableHead className="text-center">สถานะ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditResults.map((result) => (
                                        <TableRow key={result.id}>
                                            <TableCell>
                                                <Badge variant="outline">{result.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{result.checkName}</div>
                                                <div className="text-xs text-muted-foreground">{result.description}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{result.details}</TableCell>
                                            <TableCell className="text-center">
                                                {result.status === 'pass' && <Badge className="bg-green-100 text-green-800">ผ่าน</Badge>}
                                                {result.status === 'warning' && <Badge className="bg-yellow-100 text-yellow-800">ควรปรับปรุง</Badge>}
                                                {result.status === 'fail' && <Badge className="bg-red-100 text-red-800">ต้องดำเนินการ</Badge>}
                                                {result.status === 'pending' && <Badge className="bg-slate-100 text-slate-600">รอข้อมูล</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
