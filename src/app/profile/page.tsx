'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Shield, Building2, Phone, Mail, Calendar, Save, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { getRoleDisplay } from '@/lib/auth/role-helper';
import ThaiUtils from '@/lib/utils/thai-utils';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');

    useEffect(() => {
        if (user?.metadata) {
            setPhone(user.metadata.phone || '');
            setPosition(user.metadata.position || '');
            setDepartment(user.metadata.department || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const updatedMetadata = {
                ...user.metadata,
                phone,
                position,
                department,
            };

            await updateDoc(doc(db, 'users', user.uid), {
                metadata: updatedMetadata,
                updatedAt: serverTimestamp(),
            });

            // Update local state
            setUser({
                ...user,
                metadata: updatedMetadata,
            });

            toast.success('บันทึกข้อมูลสำเร็จ');
            setEditing(false);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = () => {
        switch (user?.status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">รออนุมัติ</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800">ไม่อนุมัติ</Badge>;
            default:
                return <Badge variant="outline">{user?.status}</Badge>;
        }
    };

    if (!user) {
        return <div className="p-8 text-center">กำลังโหลด...</div>;
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <User className="h-8 w-8 text-indigo-600" />
                    โปรไฟล์ของฉัน
                </h1>

                {/* Profile Card */}
                <Card className="overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                    <CardContent className="relative pt-0 pb-6">
                        <div className="absolute -top-12 left-6">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                                    {user.displayName?.substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="mt-14 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{user.displayName}</h2>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge()}
                                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                                    <Settings className="h-4 w-4 mr-1" />
                                    {editing ? 'ยกเลิก' : 'แก้ไข'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Role & Access Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-purple-600" />
                                บทบาทและสิทธิ์
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-muted-foreground">บทบาท</span>
                                <Badge className="bg-purple-100 text-purple-800">{getRoleDisplay(user.role)}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-muted-foreground">สถานะ</span>
                                {getStatusBadge()}
                            </div>
                            {user.lastLoginAt && (
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> เข้าสู่ระบบล่าสุด
                                    </span>
                                    <span className="text-sm">
                                        {ThaiUtils.DateTime.formatThai(new Date((user.lastLoginAt as any).seconds * 1000))}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unit Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building2 className="h-5 w-5 text-teal-600" />
                                หน่วยงาน
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-muted-foreground">รหัสหน่วย</span>
                                <span className="font-mono">{user.unitId || '-'}</span>
                            </div>
                            {user.metadata?.department && (
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-muted-foreground">ฝ่าย/แผนก</span>
                                    <span>{user.metadata.department}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Editable Info */}
                {editing && (
                    <Card className="mt-6 border-indigo-200">
                        <CardHeader>
                            <CardTitle>แก้ไขข้อมูลส่วนตัว</CardTitle>
                            <CardDescription>ข้อมูลเหล่านี้จะแสดงในระบบ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ตำแหน่ง</Label>
                                    <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="เช่น นักวิเคราะห์นโยบาย" />
                                </div>
                                <div className="space-y-2">
                                    <Label>ฝ่าย/แผนก</Label>
                                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="เช่น ฝ่ายยุทธศาสตร์" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" /> เบอร์โทรศัพท์
                                </Label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
                            </div>

                            <Button onClick={handleSave} disabled={saving} className="w-full">
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        บันทึกข้อมูล
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>
    );
}
