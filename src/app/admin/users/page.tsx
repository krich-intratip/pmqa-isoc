'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, updateDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { User, Unit } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES, getRoleDisplay, canManageUsers } from '@/lib/auth/role-helper';
import { Users, Edit, UserX, Search, Filter, Download, CheckSquare, XSquare, UserCheck, ArrowUpDown } from 'lucide-react';
import BulkImportUsers from '@/components/admin/BulkImportUsers';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { sendApprovalNotification, sendRejectionNotification } from '@/lib/notification/notification-helper';

function UsersManagementContent() {
    const searchParams = useSearchParams();
    const { user } = useAuthStore();
    const { logApproveAction, logRejectAction, logUserStatusChangeAction } = useActivityLogger();

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Active tab from URL params or default to 'approved'
    const initialTab = searchParams?.get('filter') || 'approved';
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnitCategory, setFilterUnitCategory] = useState<string>('all');
    const [filterUnitId, setFilterUnitId] = useState<string>('all');
    const [filterRegion, setFilterRegion] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Bulk selection
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    // Form states
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<User['role']>('read_only');
    const [unitId, setUnitId] = useState('');
    const [status, setStatus] = useState<User['status']>('approved');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');
    const [phone, setPhone] = useState('');

    // Fetch all users (including pending for approval workflow)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData: User[] = [];
            querySnapshot.forEach((docSnap) => {
                usersData.push(docSnap.data() as User);
            });
            setUsers(usersData);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
        } finally {
            setLoading(false);
        }
    };

    // Fetch units for filter dropdown
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
            fetchUsers();
            fetchUnits();
        }
    }, [user]);

    // Set active tab from URL params
    useEffect(() => {
        const filterParam = searchParams?.get('filter');
        if (filterParam) {
            setActiveTab(filterParam);
        }
    }, [searchParams]);

    // Filter and sort users
    useEffect(() => {
        let result = [...users];

        // Filter by active tab (status)
        if (activeTab !== 'all') {
            result = result.filter(u => u.status === activeTab);
        }

        // Search by name or email
        if (searchTerm) {
            result = result.filter(u =>
                u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by unit category
        if (filterUnitCategory !== 'all' && filterUnitId !== 'all') {
            const unitData = units.find(unit => unit.id === filterUnitId);
            if (unitData && unitData.category === filterUnitCategory) {
                result = result.filter(u => u.unitId === filterUnitId);
            }
        } else if (filterUnitCategory !== 'all') {
            const filteredUnitIds = units
                .filter(unit => unit.category === filterUnitCategory)
                .map(unit => unit.id);
            result = result.filter(u => u.unitId && filteredUnitIds.includes(u.unitId));
        }

        // Filter by unit ID
        if (filterUnitId !== 'all' && filterUnitCategory === 'all') {
            result = result.filter(u => u.unitId === filterUnitId);
        }

        // Filter by region
        if (filterRegion !== 'all') {
            const regionalUnitIds = units
                .filter(unit => unit.region === filterRegion)
                .map(unit => unit.id);
            result = result.filter(u => u.unitId && regionalUnitIds.includes(u.unitId));
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') {
                const comparison = a.displayName.localeCompare(b.displayName, 'th');
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                // Sort by registration date (createdAt)
                const dateA = a.createdAt?.toMillis() || 0;
                const dateB = b.createdAt?.toMillis() || 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
        });

        setFilteredUsers(result);
    }, [searchTerm, filterUnitCategory, filterUnitId, filterRegion, sortBy, sortOrder, users, units, activeTab]);

    const handleEdit = (editUser: User) => {
        setEditingUser(editUser);
        setDisplayName(editUser.displayName);
        setRole(editUser.role);
        setUnitId(editUser.unitId || '');
        setStatus(editUser.status);
        setPosition(editUser.metadata?.position || '');
        setDepartment(editUser.metadata?.department || '');
        setPhone(editUser.metadata?.phone || '');
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        // Validate required fields
        if (!displayName.trim()) {
            toast.error('กรุณากรอกชื่อ-นามสกุล');
            return;
        }

        if (!role) {
            toast.error('กรุณาเลือกบทบาท');
            return;
        }

        try {
            // Build metadata object without undefined values
            const metadataUpdate: Record<string, string> = {};
            if (position && position.trim()) metadataUpdate.position = position.trim();
            if (department && department.trim()) metadataUpdate.department = department.trim();
            if (phone && phone.trim()) metadataUpdate.phone = phone.trim();

            const updateData: Record<string, unknown> = {
                displayName: displayName.trim(),
                role,
                status,
                isActive: status === 'approved', // Fix: Update isActive based on status
                updatedAt: serverTimestamp(),
            };

            // Only include unitId if it's not empty
            if (unitId && unitId.trim()) {
                updateData.unitId = unitId.trim();
            } else {
                updateData.unitId = null;
            }

            // Only include metadata if there are actual values
            if (Object.keys(metadataUpdate).length > 0) {
                updateData.metadata = metadataUpdate;
            }

            await updateDoc(doc(db, 'users', editingUser.uid), updateData);

            toast.success('อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
            setDialogOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('เกิดข้อผิดพลาดในการอัปเดต');
        }
    };

    const handleApprove = async (targetUser: User) => {
        if (!confirm(`ยืนยันการอนุมัติผู้ใช้ "${targetUser.displayName}"?`)) return;

        // 1. Optimistic UI update - แสดงผลทันที
        setUsers(prev => prev.map(u =>
            u.uid === targetUser.uid ? { ...u, status: 'approved' as const, isActive: true } : u
        ));
        toast.success('อนุมัติผู้ใช้งานเรียบร้อยแล้ว');

        try {
            // 2. ทำงานจริงใน background
            await updateDoc(doc(db, 'users', targetUser.uid), {
                status: 'approved',
                isActive: true,
                updatedAt: serverTimestamp(),
            });

            // 3. Log และ notification แบบ fire-and-forget (ไม่ต้อง await)
            logApproveAction('user', targetUser.uid, targetUser.displayName).catch(console.error);
            sendApprovalNotification(targetUser.uid, user?.displayName || 'ผู้ดูแลระบบ').catch(console.error);
        } catch (error) {
            // 4. Rollback ถ้าผิดพลาด
            console.error(error);
            setUsers(prev => prev.map(u =>
                u.uid === targetUser.uid ? { ...u, status: 'pending' as const, isActive: false } : u
            ));
            toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
        }
    };

    const handleReject = async (targetUser: User) => {
        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ (ถ้ามี):');

        // 1. Optimistic UI update - แสดงผลทันที
        setUsers(prev => prev.map(u =>
            u.uid === targetUser.uid ? { ...u, status: 'rejected' as const, isActive: false } : u
        ));
        toast.success('ปฏิเสธผู้ใช้งานเรียบร้อยแล้ว');

        try {
            // 2. ทำงานจริงใน background
            await updateDoc(doc(db, 'users', targetUser.uid), {
                status: 'rejected',
                isActive: false,
                updatedAt: serverTimestamp(),
            });

            // 3. Log และ notification แบบ fire-and-forget
            logRejectAction('user', targetUser.uid, targetUser.displayName, reason || undefined).catch(console.error);
            sendRejectionNotification(targetUser.uid, user?.displayName || 'ผู้ดูแลระบบ', reason || undefined).catch(console.error);
        } catch (error) {
            // 4. Rollback ถ้าผิดพลาด
            console.error(error);
            setUsers(prev => prev.map(u =>
                u.uid === targetUser.uid ? { ...u, status: 'pending' as const, isActive: false } : u
            ));
            toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
        }
    };

    const handleDisable = async (userId: string, userName: string, currentStatus: User['status']) => {
        const newStatus = currentStatus === 'disabled' ? 'approved' : 'disabled';
        const confirmMsg = newStatus === 'disabled'
            ? 'ยืนยันที่จะปิดการใช้งานผู้ใช้นี้?'
            : 'ยืนยันที่จะเปิดการใช้งานผู้ใช้นี้?';

        if (!confirm(confirmMsg)) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus,
                isActive: newStatus === 'approved',
                updatedAt: serverTimestamp(),
            });

            await logUserStatusChangeAction(userId, userName, newStatus === 'approved' ? 'enabled' : 'disabled');

            toast.success(newStatus === 'disabled' ? 'ปิดการใช้งานแล้ว' : 'เปิดการใช้งานแล้ว');
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    // Bulk actions
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = filteredUsers.map(u => u.uid);
            setSelectedUsers(new Set(allIds));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        const newSelected = new Set(selectedUsers);
        if (checked) {
            newSelected.add(userId);
        } else {
            newSelected.delete(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleBulkApprove = async () => {
        if (selectedUsers.size === 0) {
            toast.error('กรุณาเลือกผู้ใช้งานที่ต้องการอนุมัติ');
            return;
        }

        if (!confirm(`ยืนยันการอนุมัติผู้ใช้ ${selectedUsers.size} คน?`)) return;

        try {
            const batch = writeBatch(db);
            selectedUsers.forEach((userId) => {
                const userRef = doc(db, 'users', userId);
                batch.update(userRef, {
                    status: 'approved',
                    isActive: true,
                    updatedAt: serverTimestamp(),
                });
            });
            await batch.commit();

            // Log activities
            const selectedUsersList = filteredUsers.filter(u => selectedUsers.has(u.uid));
            for (const u of selectedUsersList) {
                await logApproveAction('user', u.uid, u.displayName);
            }

            toast.success(`อนุมัติผู้ใช้งาน ${selectedUsers.size} คนเรียบร้อยแล้ว`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
        }
    };

    const handleBulkReject = async () => {
        if (selectedUsers.size === 0) {
            toast.error('กรุณาเลือกผู้ใช้งานที่ต้องการปฏิเสธ');
            return;
        }

        const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ (ถ้ามี):');

        try {
            const batch = writeBatch(db);
            selectedUsers.forEach((userId) => {
                const userRef = doc(db, 'users', userId);
                batch.update(userRef, {
                    status: 'rejected',
                    isActive: false,
                    updatedAt: serverTimestamp(),
                });
            });
            await batch.commit();

            // Log activities
            const selectedUsersList = filteredUsers.filter(u => selectedUsers.has(u.uid));
            for (const u of selectedUsersList) {
                await logRejectAction('user', u.uid, u.displayName, reason || undefined);
            }

            toast.success(`ปฏิเสธผู้ใช้งาน ${selectedUsers.size} คนเรียบร้อยแล้ว`);
            setSelectedUsers(new Set());
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการปฏิเสธ');
        }
    };

    // Export to CSV
    const handleExport = () => {
        const csvHeaders = ['ชื่อ-นามสกุล', 'อีเมล', 'บทบาท', 'หน่วยงาน', 'สถานะ', 'วันที่สมัคร', 'เข้าใช้งานล่าสุด'];
        const csvRows = filteredUsers.map(u => [
            u.displayName,
            u.email,
            getRoleDisplay(u.role),
            u.unitId || '-',
            getStatusText(u.status),
            u.createdAt ? u.createdAt.toDate().toLocaleDateString('th-TH') : '-',
            u.lastLoginAt ? u.lastLoginAt.toDate().toLocaleDateString('th-TH') : '-',
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Add BOM for Thai characters
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast.success('ส่งออกข้อมูลเรียบร้อยแล้ว');
    };

    const getStatusBadge = (status: User['status']) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">รออนุมัติ</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
            case 'disabled':
                return <Badge className="bg-gray-100 text-gray-800">ปิดใช้งาน</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">ไม่อนุมัติ</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusText = (status: User['status']): string => {
        switch (status) {
            case 'pending': return 'รออนุมัติ';
            case 'approved': return 'อนุมัติแล้ว';
            case 'disabled': return 'ปิดใช้งาน';
            case 'rejected': return 'ไม่อนุมัติ';
            default: return status;
        }
    };

    const getUnitName = (unitId?: string): string => {
        if (!unitId) return '-';
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : unitId;
    };


    const pendingCount = users.filter(u => u.status === 'pending').length;
    const approvedCount = users.filter(u => u.status === 'approved').length;
    const disabledCount = users.filter(u => u.status === 'disabled').length;
    const rejectedCount = users.filter(u => u.status === 'rejected').length;

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    จัดการผู้ใช้งาน
                                </CardTitle>
                                <CardDescription>
                                    อนุมัติ แก้ไข ปิด/เปิดการใช้งาน และจัดการข้อมูลผู้ใช้
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <BulkImportUsers
                                    existingEmails={users.map(u => u.email.toLowerCase())}
                                    onImportComplete={fetchUsers}
                                />
                                <Button onClick={handleExport} variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    ส่งออก CSV
                                </Button>
                            </div>
                        </div>

                        {/* Tabs for different statuses */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                            <TabsList>
                                <TabsTrigger value="pending">
                                    รออนุมัติ {pendingCount > 0 && `(${pendingCount})`}
                                </TabsTrigger>
                                <TabsTrigger value="approved">
                                    อนุมัติแล้ว {approvedCount > 0 && `(${approvedCount})`}
                                </TabsTrigger>
                                <TabsTrigger value="disabled">
                                    ปิดใช้งาน {disabledCount > 0 && `(${disabledCount})`}
                                </TabsTrigger>
                                <TabsTrigger value="rejected">
                                    ไม่อนุมัติ {rejectedCount > 0 && `(${rejectedCount})`}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Search & Filters */}
                        <div className="space-y-4 mt-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ค้นหาชื่อหรืออีเมล..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={sortBy} onValueChange={(v: 'name' | 'date') => setSortBy(v)}>
                                    <SelectTrigger className="w-48">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">เรียงตามชื่อ</SelectItem>
                                        <SelectItem value="date">เรียงตามวันที่สมัคร</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    title={sortOrder === 'asc' ? 'น้อย → มาก' : 'มาก → น้อย'}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Button>
                            </div>

                            {/* Advanced Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select value={filterUnitCategory} onValueChange={setFilterUnitCategory}>
                                    <SelectTrigger>
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="ระดับหน่วยงาน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกระดับ</SelectItem>
                                        <SelectItem value="Central">ส่วนกลาง</SelectItem>
                                        <SelectItem value="Regional">ภาค</SelectItem>
                                        <SelectItem value="Provincial">จังหวัด</SelectItem>
                                        <SelectItem value="Center">ศูนย์</SelectItem>
                                        <SelectItem value="DirectUnit">หน่วยงานสังกัดโดยตรง</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterUnitId} onValueChange={setFilterUnitId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="หน่วยงาน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกหน่วยงาน</SelectItem>
                                        {units.map(unit => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterRegion} onValueChange={setFilterRegion}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ภูมิภาค" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกภาค</SelectItem>
                                        <SelectItem value="1">ภาค 1</SelectItem>
                                        <SelectItem value="2">ภาค 2</SelectItem>
                                        <SelectItem value="3">ภาค 3</SelectItem>
                                        <SelectItem value="4">ภาค 4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bulk Actions */}
                            {selectedUsers.size > 0 && (
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium">
                                        เลือกแล้ว {selectedUsers.size} คน
                                    </span>
                                    {activeTab === 'pending' && (
                                        <>
                                            <Button onClick={handleBulkApprove} size="sm" variant="default">
                                                <CheckSquare className="h-4 w-4 mr-2" />
                                                อนุมัติทั้งหมด
                                            </Button>
                                            <Button onClick={handleBulkReject} size="sm" variant="destructive">
                                                <XSquare className="h-4 w-4 mr-2" />
                                                ปฏิเสธทั้งหมด
                                            </Button>
                                        </>
                                    )}
                                    <Button onClick={() => setSelectedUsers(new Set())} size="sm" variant="outline">
                                        ยกเลิกการเลือก
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                ไม่พบผู้ใช้งานในสถานะนี้
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            {activeTab === 'pending' && (
                                                <Checkbox
                                                    checked={selectedUsers.size === filteredUsers.length}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            )}
                                        </TableHead>
                                        <TableHead>ชื่อ-นามสกุล</TableHead>
                                        <TableHead>อีเมล</TableHead>
                                        <TableHead>บทบาท</TableHead>
                                        <TableHead>หน่วยงาน</TableHead>
                                        <TableHead>วันที่สมัคร</TableHead>
                                        <TableHead>เข้าใช้งานล่าสุด</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u.uid}>
                                            <TableCell>
                                                {activeTab === 'pending' && (
                                                    <Checkbox
                                                        checked={selectedUsers.has(u.uid)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectUser(u.uid, checked as boolean)
                                                        }
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{u.displayName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {u.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getRoleDisplay(u.role)}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {getUnitName(u.unitId)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {u.createdAt
                                                    ? u.createdAt.toDate().toLocaleDateString('th-TH')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {u.lastLoginAt
                                                    ? u.lastLoginAt.toDate().toLocaleDateString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(u.status)}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {activeTab === 'pending' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleApprove(u)}
                                                        >
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            อนุมัติ
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(u)}
                                                        >
                                                            <XSquare className="h-3 w-3 mr-1" />
                                                            ปฏิเสธ
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(u)}
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" /> แก้ไข
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                u.status === 'disabled'
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                            onClick={() =>
                                                                handleDisable(u.uid, u.displayName, u.status)
                                                            }
                                                        >
                                                            <UserX className="h-3 w-3 mr-1" />
                                                            {u.status === 'disabled'
                                                                ? 'เปิดใช้งาน'
                                                                : 'ปิดใช้งาน'}
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
                            <DialogDescription>อัปเดตข้อมูลและสิทธิ์การใช้งาน</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>ชื่อ-นามสกุล</Label>
                                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>บทบาท</Label>
                                    <Select value={role} onValueChange={(v: User['role']) => setRole(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="super_admin">ผู้ดูแลระบบสูงสุด</SelectItem>
                                            <SelectItem value="central_admin">ผู้ดูแลส่วนกลาง</SelectItem>
                                            <SelectItem value="regional_coordinator">
                                                ผู้ประสานงานภาค
                                            </SelectItem>
                                            <SelectItem value="provincial_staff">เจ้าหน้าที่จังหวัด</SelectItem>
                                            <SelectItem value="data_owner">เจ้าของข้อมูล</SelectItem>
                                            <SelectItem value="reviewer">ผู้ตรวจสอบ</SelectItem>
                                            <SelectItem value="read_only">ผู้เข้าชม</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>สถานะ</Label>
                                    <Select value={status} onValueChange={(v: User['status']) => setStatus(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                                            <SelectItem value="disabled">ปิดใช้งาน</SelectItem>
                                            <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>รหัสหน่วยงาน</Label>
                                <Select value={unitId || 'none'} onValueChange={(v) => setUnitId(v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกหน่วยงาน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">ไม่ระบุ</SelectItem>
                                        {units.map(unit => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>ตำแหน่ง</Label>
                                    <Input value={position} onChange={(e) => setPosition(e.target.value)} />
                                </div>
                                <div>
                                    <Label>ฝ่าย/แผนก</Label>
                                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>เบอร์โทรศัพท์</Label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button onClick={handleSave}>บันทึกการแก้ไข</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}

export default function UsersManagementPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8">กำลังโหลด...</div>}>
            <UsersManagementContent />
        </Suspense>
    );
}
