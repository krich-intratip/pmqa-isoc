'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth/role-helper';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';

// PMQA Categories 1-7 (Standard)
const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1: การนำองค์การ' },
    { id: 2, name: 'หมวด 2: การวางแผนเชิงยุทธศาสตร์' },
    { id: 3, name: 'หมวด 3: การให้ความสำคัญกับผู้รับบริการและผู้มีส่วนได้ส่วนเสีย' },
    { id: 4, name: 'หมวด 4: การวัด การวิเคราะห์ และการจัดการความรู้' },
    { id: 5, name: 'หมวด 5: การมุ่งเน้นบุคลากร' },
    { id: 6, name: 'หมวด 6: การมุ่งเน้นระบบปฏิบัติการ' },
    { id: 7, name: 'หมวด 7: ผลลัพธ์การดำเนินการ' },
];

interface Assignment {
    categoryId: number;
    userId: string;
    userDisplayName: string;
    userEmail: string;
}

export default function OwnerMatrixPage() {
    const { user } = useAuthStore();
    const [unitUsers, setUnitUsers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch users in the same unit
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.unitId) return;

            setLoading(true);
            try {
                // 1. Get Users in Unit
                const usersQ = query(collection(db, 'users'), where('unitId', '==', user.unitId), where('status', '==', 'approved'));
                const usersSnap = await getDocs(usersQ);
                const usersData: User[] = [];
                usersSnap.forEach(d => usersData.push(d.data() as User));
                setUnitUsers(usersData);

                // 2. Get Existing Assignments
                // Assuming we store this in a 'assignments' collection or similar, simpler for now:
                // We might store 'assignments' map inside the 'unit' document or a subcollection
                // For this demo, let's assume we fetch a doc 'units/{unitId}/settings/owner-matrix'
                // But to be simpler/standard, let's make a collection 'owner_assignments'
                // where(unitId == unitId)

                // Simulating fetch or creating empty structure if standardizing
                // Real implementation would fetch from DB
            } catch (error) {
                console.error(error);
                toast.error('โหลดข้อมูลไม่สำเร็จ');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleAssign = (categoryId: number, userId: string) => {
        const selectedUser = unitUsers.find(u => u.uid === userId);
        if (!selectedUser) return;

        setAssignments(prev => {
            // Remove existing assignment for this category if single owner policy (optional)
            // For now, let's assume 1 owner per category for simplicity, or just replace
            const filtered = prev.filter(a => a.categoryId !== categoryId);
            return [...filtered, {
                categoryId,
                userId,
                userDisplayName: selectedUser.displayName,
                userEmail: selectedUser.email
            }];
        });
    };

    const handleSave = async () => {
        if (!user?.unitId) return;
        setSaving(true);
        try {
            // Save to Firestore: units/{unitId}/assignments/pmqa_owners (doc)
            const docRef = doc(db, `units/${user.unitId}/assignments`, 'pmqa_owners');
            await setDoc(docRef, {
                updatedAt: serverTimestamp(),
                updatedBy: user.uid,
                assignments: assignments
            });
            toast.success('บันทึกข้อมูลสำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('บันทึกไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.REGIONAL, ROLES.PROVINCIAL]}> {/* Expanded roles */}
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Users className="h-8 w-8 text-indigo-600" />
                            Owner Matrix Helper
                        </h1>
                        <p className="text-muted-foreground">กำหนดผู้รับผิดชอบรายหมวด (PMQA Categories Dashboard)</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? 'Saving...' : 'บันทึกการมอบหมาย'}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>ตารางมอบหมายงาน (Assignment Matrix)</CardTitle>
                        <CardDescription>
                            เลือกบุคลากรในหน่วยงานของท่านเพื่อรับผิดชอบแต่ละหมวด
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {unitUsers.length === 0 ? (
                            <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                <p>ไม่พบรายชื่อบุคลากรในหน่วยงาน กรุณารอให้เจ้าหน้าที่คนอื่น ลงทะเบียนและได้รับการอนุมัติก่อน</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">หมวดที่</TableHead>
                                        <TableHead>ชื่อหมวด (Category)</TableHead>
                                        <TableHead className="w-[300px]">ผู้รับผิดชอบ (Owner)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {PMQA_CATEGORIES.map((cat) => {
                                        const assignment = assignments.find(a => a.categoryId === cat.id);
                                        return (
                                            <TableRow key={cat.id}>
                                                <TableCell className="font-bold text-center bg-slate-50">{cat.id}</TableCell>
                                                <TableCell className="font-medium">{cat.name}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={assignment?.userId || ''}
                                                        onValueChange={(val) => handleAssign(cat.id, val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="เลือกผู้รับผิดชอบ..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {unitUsers.map((u) => (
                                                                <SelectItem key={u.uid} value={u.uid}>
                                                                    {u.displayName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    {assignment && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
