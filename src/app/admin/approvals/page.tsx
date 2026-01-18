'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUnitLabel } from '@/lib/hierarchy/unit-helper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES, canManageUsers } from '@/lib/auth/role-helper';

export default function AdminApprovalsPage() {
    const { user } = useAuthStore();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
                // Filter out users who haven't submitted request details yet (raw logins)
                const userData = doc.data() as User;
                if (userData.requestDetails) {
                    users.push(userData);
                }
            });
            setPendingUsers(users);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && canManageUsers(user.role)) {
            fetchPendingUsers();
        }
    }, [user]);

    const handleApprove = async (userId: string, requestedRole: string, requestedUnitId: string) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'approved',
                role: requestedRole as any,
                unitId: requestedUnitId,
                updatedAt: serverTimestamp(),
            });
            toast.success('อนุมัติผู้ใช้งานเรียบร้อยแล้ว');
            fetchPendingUsers();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('ยืนยันที่จะไม่อนุมัติผู้ใช้งานนี้?')) return;
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'rejected',
                updatedAt: serverTimestamp(),
            });
            toast.success('ปฏิเสธผู้ใช้งานแล้ว');
            fetchPendingUsers();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>อนุมัติสิทธิ์การใช้งาน (Pending Approvals)</CardTitle>
                        <CardDescription>รายการผู้ขอใช้งานระบบที่รอการอนุมัติ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">กำลังโหลด...</div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">ไม่มีรายการที่รออนุมัติ</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>วันเวลาที่ขอ</TableHead>
                                        <TableHead>ชื่อ-นามสกุล</TableHead>
                                        <TableHead>หน่วยงานที่ขอ</TableHead>
                                        <TableHead>บทบาท</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingUsers.map((u) => (
                                        <TableRow key={u.uid}>
                                            <TableCell>
                                                {u.requestDetails?.submittedAt?.seconds
                                                    ? new Date(u.requestDetails.submittedAt.seconds * 1000).toLocaleDateString('th-TH')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.displayName}</span>
                                                    <span className="text-xs text-muted-foreground">{u.email}</span>
                                                    <span className="text-xs text-muted-foreground">{u.metadata?.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {/* Identify Unit Name using Helper or ID for now */}
                                                {u.requestDetails?.requestedUnitId}
                                            </TableCell>
                                            <TableCell>{u.requestDetails?.requestedRole}</TableCell>
                                            <TableCell><Badge className="bg-yellow-500">รออนุมัติ</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="default" onClick={() => handleApprove(u.uid, u.requestDetails!.requestedRole, u.requestDetails!.requestedUnitId)}>
                                                    อนุมัติ
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(u.uid)}>
                                                    ไม่อนุมัติ
                                                </Button>
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
