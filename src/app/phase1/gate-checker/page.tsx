'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Eye, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Evidence } from '@/types/database';
import { toast } from 'sonner';
import { ROLES, canApproveEvidence } from '@/lib/auth/role-helper';

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1' },
    { id: 2, name: 'หมวด 2' },
    { id: 3, name: 'หมวด 3' },
    { id: 4, name: 'หมวด 4' },
    { id: 5, name: 'หมวด 5' },
    { id: 6, name: 'หมวด 6' },
    { id: 7, name: 'หมวด 7' },
];

export default function EvidenceGateCheckerPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [pendingEvidence, setPendingEvidence] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
    const [feedback, setFeedback] = useState('');
    const [processing, setProcessing] = useState(false);

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const fetchPending = async () => {
        if (!user) return;

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            setPendingEvidence([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Reviewers see pending evidence from their unit or all if admin
            // v1.6.0: Always filter by cycle
            let q;
            if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.CENTRAL_ADMIN) {
                q = query(
                    collection(db, 'evidence'),
                    where('verificationStatus', '==', 'pending'),
                    where('cycleId', '==', selectedCycle.id) // v1.6.0
                );
            } else {
                q = query(
                    collection(db, 'evidence'),
                    where('unitId', '==', user.unitId),
                    where('verificationStatus', '==', 'pending'),
                    where('cycleId', '==', selectedCycle.id) // v1.6.0
                );
            }

            const snap = await getDocs(q);
            const data: Evidence[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as Evidence));
            setPendingEvidence(data);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [user, selectedCycle]); // v1.6.0: Re-fetch when cycle changes

    const handleVerify = async (status: 'verified' | 'rejected') => {
        if (!selectedEvidence || !user) return;
        setProcessing(true);

        try {
            await updateDoc(doc(db, 'evidence', selectedEvidence.id), {
                verificationStatus: status,
                verifiedBy: user.uid,
                verifiedAt: serverTimestamp(),
                feedback: feedback || null,
                completeness: status === 'verified' ? 'complete' : 'gap_found',
            });

            toast.success(status === 'verified' ? 'อนุมัติหลักฐานแล้ว' : 'ปฏิเสธหลักฐาน - ส่งกลับแก้ไข');
            setSelectedEvidence(null);
            setFeedback('');
            fetchPending();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setProcessing(false);
        }
    };

    const canReview = user && canApproveEvidence(user.role);

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.REVIEWER]}>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
                            <ShieldCheck className="h-8 w-8 text-purple-600" />
                            Evidence Gate Checker
                        </h1>
                        <p className="text-muted-foreground">ตรวจสอบและอนุมัติหลักฐาน (Phase 1.3)</p>
                    </div>
                    {selectedCycle && (
                        <Badge variant="outline" className="text-indigo-700 border-indigo-200">
                            รอบ: {selectedCycle.name || selectedCycle.year}
                        </Badge>
                    )}
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

                <Card>
                    <CardHeader>
                        <CardTitle>หลักฐานที่รอการตรวจสอบ ({pendingEvidence.length})</CardTitle>
                        <CardDescription>
                            คลิก "ตรวจสอบ" เพื่อดูรายละเอียดและอนุมัติหรือปฏิเสธ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : pendingEvidence.length === 0 ? (
                            <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                                <p className="font-medium">ไม่มีหลักฐานที่รอตรวจสอบ</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">หมวด</TableHead>
                                        <TableHead className="w-[100px]">เกณฑ์</TableHead>
                                        <TableHead>หลักฐาน</TableHead>
                                        <TableHead className="w-[100px]">ประเภท</TableHead>
                                        <TableHead className="text-right w-[120px]">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingEvidence.map((ev) => (
                                        <TableRow key={ev.id}>
                                            <TableCell>
                                                <Badge variant="outline">{PMQA_CATEGORIES.find(c => c.id === ev.categoryId)?.name}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{ev.criteriaId}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{ev.title}</div>
                                                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="h-3 w-3" /> ดูเอกสาร
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{ev.type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" onClick={() => { setSelectedEvidence(ev); setFeedback(''); }}>
                                                            <Eye className="h-4 w-4 mr-1" /> ตรวจสอบ
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>ตรวจสอบหลักฐาน</DialogTitle>
                                                            <DialogDescription>
                                                                {selectedEvidence?.title} ({selectedEvidence?.criteriaId})
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                                <div className="text-sm text-muted-foreground mb-1">ลิงก์หลักฐาน:</div>
                                                                <a href={selectedEvidence?.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                                    {selectedEvidence?.url}
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium">ข้อเสนอแนะ / หมายเหตุ</label>
                                                                <Textarea
                                                                    value={feedback}
                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                    placeholder="กรอกข้อเสนอแนะ (ถ้ามี)..."
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter className="gap-2">
                                                            <Button variant="destructive" onClick={() => handleVerify('rejected')} disabled={processing}>
                                                                <XCircle className="h-4 w-4 mr-1" /> ปฏิเสธ
                                                            </Button>
                                                            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify('verified')} disabled={processing}>
                                                                <CheckCircle2 className="h-4 w-4 mr-1" /> อนุมัติ
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
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
