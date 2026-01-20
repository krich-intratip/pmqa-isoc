'use client';

// Force dynamic rendering to avoid Firebase initialization during build
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { User, Unit } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getUnitLabel } from '@/lib/hierarchy/unit-helper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES, canManageUsers, getRoleDisplay } from '@/lib/auth/role-helper';
import { Edit, UserCheck, XSquare } from 'lucide-react';

export default function AdminApprovalsPage() {
    const { user } = useAuthStore();
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form states for editing before approval
    const [editRole, setEditRole] = useState<User['role']>('read_only');
    const [editUnitId, setEditUnitId] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [editDepartment, setEditDepartment] = useState('');
    const [editPhone, setEditPhone] = useState('');

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

    const fetchUnits = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'units'));
            const unitsData: Unit[] = [];
            querySnapshot.forEach((docSnap) => {
                unitsData.push({ id: docSnap.id, ...docSnap.data() } as Unit);
            });
            setUnits(unitsData);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    useEffect(() => {
        if (user && canManageUsers(user.role)) {
            fetchPendingUsers();
            fetchUnits();
        }
    }, [user]);

    const handleEditBeforeApproval = (targetUser: User) => {
        setEditingUser(targetUser);
        setEditRole(targetUser.requestDetails?.requestedRole as User['role'] || 'read_only');
        setEditUnitId(targetUser.requestDetails?.requestedUnitId || '');
        setEditPosition(targetUser.metadata?.position || '');
        setEditDepartment(targetUser.metadata?.department || '');
        setEditPhone(targetUser.metadata?.phone || '');
        setEditDialogOpen(true);
    };

    const handleSaveAndApprove = async () => {
        if (!editingUser) return;

        if (!editRole) {
            toast.error('กรุณาเลือกบทบาท');
            return;
        }

        try {
            // Build metadata object without undefined values
            const metadataUpdate: any = {};
            if (editPosition && editPosition.trim()) metadataUpdate.position = editPosition.trim();
            if (editDepartment && editDepartment.trim()) metadataUpdate.department = editDepartment.trim();
            if (editPhone && editPhone.trim()) metadataUpdate.phone = editPhone.trim();

            const updateData: any = {
                status: 'approved',
                role: editRole,
                isActive: true,
                updatedAt: serverTimestamp(),
            };

            if (editUnitId && editUnitId.trim()) {
                updateData.unitId = editUnitId.trim();
            }

            if (Object.keys(metadataUpdate).length > 0) {
                updateData.metadata = metadataUpdate;
            }

            await updateDoc(doc(db, 'users', editingUser.uid), updateData);

            toast.success('อนุมัติผู้ใช้งานเรียบร้อยแล้ว');
            setEditDialogOpen(false);
            setEditingUser(null);
            fetchPendingUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
        }
    };

    const handleApprove = async (userId: string, requestedRole: string, requestedUnitId: string) => {
        if (!confirm('ยืนยันการอนุมัติผู้ใช้นี้ตามข้อมูลที่ร้องขอ?')) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'approved',
                role: requestedRole as any,
                unitId: requestedUnitId || null,
                isActive: true,
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
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditBeforeApproval(u)}
                                                    title="แก้ไขข้อมูลก่อนอนุมัติ"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    แก้ไข
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleApprove(u.uid, u.requestDetails!.requestedRole, u.requestDetails!.requestedUnitId)}
                                                    title="อนุมัติตามที่ขอ"
                                                >
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    อนุมัติ
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(u.uid)}>
                                                    <XSquare className="h-3 w-3 mr-1" />
                                                    ปฏิเสธ
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Before Approval Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>แก้ไขข้อมูลก่อนอนุมัติ</DialogTitle>
                            <DialogDescription>
                                กำหนดบทบาท หน่วยงาน และข้อมูลเพิ่มเติมก่อนอนุมัติผู้ใช้งาน
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {editingUser && (
                                <>
                                    <div className="p-3 bg-slate-50 rounded-md">
                                        <div className="text-sm font-medium">{editingUser.displayName}</div>
                                        <div className="text-xs text-muted-foreground">{editingUser.email}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>บทบาท *</Label>
                                            <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="central_admin">ผู้ดูแลส่วนกลาง</SelectItem>
                                                    <SelectItem value="regional_coordinator">ผู้ประสานงานภาค</SelectItem>
                                                    <SelectItem value="provincial_staff">เจ้าหน้าที่จังหวัด</SelectItem>
                                                    <SelectItem value="data_owner">เจ้าของข้อมูล</SelectItem>
                                                    <SelectItem value="reviewer">ผู้ตรวจสอบ</SelectItem>
                                                    <SelectItem value="read_only">ผู้เข้าชม</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>หน่วยงาน</Label>
                                            <Select value={editUnitId} onValueChange={setEditUnitId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกหน่วยงาน" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">ไม่ระบุ</SelectItem>
                                                    {units.map(unit => (
                                                        <SelectItem key={unit.id} value={unit.id}>
                                                            {unit.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>ตำแหน่ง</Label>
                                            <Input
                                                value={editPosition}
                                                onChange={(e) => setEditPosition(e.target.value)}
                                                placeholder="เช่น นักวิเคราะห์"
                                            />
                                        </div>
                                        <div>
                                            <Label>ฝ่าย/แผนก</Label>
                                            <Input
                                                value={editDepartment}
                                                onChange={(e) => setEditDepartment(e.target.value)}
                                                placeholder="เช่น ฝ่ายวิชาการ"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>เบอร์โทรศัพท์</Label>
                                        <Input
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="เช่น 081-234-5678"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button onClick={handleSaveAndApprove}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                บันทึกและอนุมัติ
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
