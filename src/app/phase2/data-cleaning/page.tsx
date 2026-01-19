'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, AlertTriangle, CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface DataIssue {
    id: string;
    kpiId: string;
    kpiCode: string;
    kpiName: string;
    period: string;
    value: number;
    target: number;
    issueType: 'outlier' | 'missing' | 'duplicate' | 'invalid';
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
    resolved: boolean;
}

export default function DataCleaningPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [issues, setIssues] = useState<DataIssue[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // v1.6.0: Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const analyzeData = async () => {
        if (!user?.unitId) return;

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setAnalyzing(true);

        try {
            // Fetch KPI data with cycle filter
            const dataQ = query(
                collection(db, 'kpi_data'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id) // v1.6.0
            );
            const dataSnap = await getDocs(dataQ);
            const allData: any[] = [];
            dataSnap.forEach(d => allData.push({ id: d.id, ...d.data() }));

            // Analyze for issues
            const foundIssues: DataIssue[] = [];

            // Check for outliers (values that are too far from target)
            allData.forEach(data => {
                if (!data.value && data.value !== 0) {
                    foundIssues.push({
                        id: data.id,
                        kpiId: data.kpiId,
                        kpiCode: data.kpiCode,
                        kpiName: data.kpiName,
                        period: data.period,
                        value: data.value,
                        target: data.target,
                        issueType: 'missing',
                        severity: 'high',
                        suggestion: 'กรุณากรอกค่าข้อมูล',
                        resolved: false,
                    });
                } else if (data.value > data.target * 10 || data.value < data.target * 0.01) {
                    foundIssues.push({
                        id: data.id,
                        kpiId: data.kpiId,
                        kpiCode: data.kpiCode,
                        kpiName: data.kpiName,
                        period: data.period,
                        value: data.value,
                        target: data.target,
                        issueType: 'outlier',
                        severity: 'medium',
                        suggestion: `ค่า ${data.value} อาจผิดปกติ ควรตรวจสอบอีกครั้ง`,
                        resolved: false,
                    });
                } else if (data.value < 0) {
                    foundIssues.push({
                        id: data.id,
                        kpiId: data.kpiId,
                        kpiCode: data.kpiCode,
                        kpiName: data.kpiName,
                        period: data.period,
                        value: data.value,
                        target: data.target,
                        issueType: 'invalid',
                        severity: 'high',
                        suggestion: 'ค่าติดลบไม่ถูกต้อง',
                        resolved: false,
                    });
                }
            });

            // Check for duplicates
            const periodMap = new Map<string, any[]>();
            allData.forEach(data => {
                const key = `${data.kpiId}-${data.period}`;
                if (!periodMap.has(key)) periodMap.set(key, []);
                periodMap.get(key)!.push(data);
            });

            periodMap.forEach((entries, key) => {
                if (entries.length > 1) {
                    entries.slice(1).forEach(dup => {
                        foundIssues.push({
                            id: dup.id,
                            kpiId: dup.kpiId,
                            kpiCode: dup.kpiCode,
                            kpiName: dup.kpiName,
                            period: dup.period,
                            value: dup.value,
                            target: dup.target,
                            issueType: 'duplicate',
                            severity: 'medium',
                            suggestion: 'ข้อมูลซ้ำซ้อน ควรลบออก',
                            resolved: false,
                        });
                    });
                }
            });

            setIssues(foundIssues);
            toast.success(`พบ ${foundIssues.length} ปัญหา`);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async (issueId: string) => {
        if (!confirm('ต้องการลบข้อมูลนี้?')) return;
        try {
            await deleteDoc(doc(db, 'kpi_data', issueId));
            setIssues(issues.filter(i => i.id !== issueId));
            toast.success('ลบข้อมูลสำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleResolve = async (issueId: string) => {
        setIssues(issues.map(i => i.id === issueId ? { ...i, resolved: true } : i));
        toast.success('ทำเครื่องหมายว่าแก้ไขแล้ว');
    };

    const getIssueBadge = (type: DataIssue['issueType']) => {
        switch (type) {
            case 'outlier': return <Badge className="bg-yellow-100 text-yellow-800">ค่าผิดปกติ</Badge>;
            case 'missing': return <Badge className="bg-red-100 text-red-800">ข้อมูลหาย</Badge>;
            case 'duplicate': return <Badge className="bg-purple-100 text-purple-800">ซ้ำซ้อน</Badge>;
            case 'invalid': return <Badge className="bg-red-100 text-red-800">ไม่ถูกต้อง</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    const getSeverityBadge = (severity: DataIssue['severity']) => {
        switch (severity) {
            case 'high': return <Badge className="bg-red-500 text-white">สูง</Badge>;
            case 'medium': return <Badge className="bg-yellow-500 text-white">กลาง</Badge>;
            case 'low': return <Badge className="bg-green-500 text-white">ต่ำ</Badge>;
        }
    };

    const unresolvedCount = issues.filter(i => !i.resolved).length;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Sparkles className="h-8 w-8 text-violet-600" />
                            Data Cleaning Assistant
                        </h1>
                        <p className="text-muted-foreground">ตรวจสอบและทำความสะอาดข้อมูล (App 2.5)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-violet-700 border-violet-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Button onClick={analyzeData} disabled={analyzing || !selectedCycle} className="gap-2 bg-violet-600 hover:bg-violet-700">
                            <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
                            {analyzing ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ข้อมูล'}
                        </Button>
                    </div>
                </div>

                {/* v1.6.0: Warning if no cycle selected */}
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-violet-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{issues.length}</div>
                            <div className="text-sm text-muted-foreground">ปัญหาทั้งหมด</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-red-600">{issues.filter(i => i.severity === 'high' && !i.resolved).length}</div>
                            <div className="text-sm text-muted-foreground">ความรุนแรงสูง</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-yellow-600">{issues.filter(i => i.severity === 'medium' && !i.resolved).length}</div>
                            <div className="text-sm text-muted-foreground">ความรุนแรงกลาง</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-600">{issues.filter(i => i.resolved).length}</div>
                            <div className="text-sm text-muted-foreground">แก้ไขแล้ว</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Issues Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการปัญหา ({unresolvedCount} รายการที่ยังไม่แก้ไข)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {issues.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">คลิก "วิเคราะห์ข้อมูล" เพื่อเริ่มตรวจสอบ</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>KPI</TableHead>
                                        <TableHead>งวด</TableHead>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead>ความรุนแรง</TableHead>
                                        <TableHead>ค่า</TableHead>
                                        <TableHead>คำแนะนำ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {issues.map((issue) => (
                                        <TableRow key={issue.id} className={issue.resolved ? 'opacity-50' : ''}>
                                            <TableCell>
                                                <div className="font-mono text-sm">{issue.kpiCode}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{issue.kpiName}</div>
                                            </TableCell>
                                            <TableCell>{issue.period}</TableCell>
                                            <TableCell>{getIssueBadge(issue.issueType)}</TableCell>
                                            <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                                            <TableCell className="font-mono">{issue.value}</TableCell>
                                            <TableCell className="text-sm">{issue.suggestion}</TableCell>
                                            <TableCell className="text-right">
                                                {issue.resolved ? (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> แก้ไขแล้ว
                                                    </Badge>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleResolve(issue.id)}>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        {issue.issueType === 'duplicate' && (
                                                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(issue.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
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
