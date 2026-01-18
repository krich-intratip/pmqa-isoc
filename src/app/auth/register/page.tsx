'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ISOC_HIERARCHY, getProvincesByRegion } from '@/lib/hierarchy/unit-helper';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ROLES, UNIT_TYPES } from '@/lib/auth/role-helper';

const formSchema = z.object({
    unitCategory: z.string().min(1, 'กรุณาเลือกประเภทหน่วยงาน'),
    region: z.string().optional(),
    unitId: z.string().min(1, 'กรุณาเลือกหน่วยงาน'),
    desiredRole: z.string().min(1, 'กรุณาเลือกบทบาทที่ต้องการ'),
    fullName: z.string().min(2, 'กรุณาระบุชื่อ-นามสกุล'),
    position: z.string().optional(),
    phone: z.string().min(9, 'กรุณาระบุเกอร์โทรศัพท์'),
});

export default function RegisterPage() {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const [regions, setRegions] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unitCategory: '',
            region: '',
            unitId: '',
            desiredRole: '',
            fullName: user?.displayName || '',
            position: '',
            phone: '',
        },
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
        if (user?.status === 'approved') {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const watchCategory = form.watch('unitCategory');
    const watchRegion = form.watch('region');

    useEffect(() => {
        if (watchCategory === UNIT_TYPES.REGIONAL || watchCategory === UNIT_TYPES.PROVINCIAL) {
            setRegions(ISOC_HIERARCHY.REGIONS);
        } else {
            setRegions([]);
            form.setValue('region', '');
        }
        form.setValue('unitId', '');

        if (watchCategory === UNIT_TYPES.CENTRAL) {
            setUnits(ISOC_HIERARCHY.CENTRAL_UNITS);
        } else if (watchCategory === UNIT_TYPES.CENTER) {
            setUnits(ISOC_HIERARCHY.CENTERS);
        } else if (watchCategory === UNIT_TYPES.REGIONAL) {
            setUnits(ISOC_HIERARCHY.REGIONS.map(r => ({ ...r, id: r.id })));
        }
    }, [watchCategory, form]);

    useEffect(() => {
        if (watchCategory === UNIT_TYPES.PROVINCIAL && watchRegion) {
            const provs = getProvincesByRegion(watchRegion);
            setUnits(provs);
        }
    }, [watchCategory, watchRegion]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: values.fullName,
                'metadata.position': values.position,
                'metadata.phone': values.phone,
                requestDetails: {
                    requestedUnitId: values.unitId,
                    requestedRole: values.desiredRole,
                    submittedAt: serverTimestamp(),
                    category: values.unitCategory,
                },
                isActive: true,
            });
            toast.success('ส่งคำขอเรียบร้อยแล้ว');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    }

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>ลงทะเบียนขอสิทธิ์ใช้งาน</CardTitle>
                    <CardDescription>กรุณากรอกข้อมูลเพื่อระบุสังกัดและบทบาทของท่าน</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อ-นามสกุล</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                                        <FormControl><Input placeholder="08x-xxx-xxxx" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ประเภทหน่วยงาน</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="เลือกประเภท..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value={UNIT_TYPES.CENTRAL}>ส่วนกลาง</SelectItem>
                                                <SelectItem value={UNIT_TYPES.REGIONAL}>ภาค</SelectItem>
                                                <SelectItem value={UNIT_TYPES.PROVINCIAL}>จังหวัด</SelectItem>
                                                <SelectItem value={UNIT_TYPES.CENTER}>ศูนย์ฯ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {(watchCategory === UNIT_TYPES.REGIONAL || watchCategory === UNIT_TYPES.PROVINCIAL) && (
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ภาค</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="เลือกภาค..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {regions.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="unitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>หน่วยงาน</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!units.length}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="เลือกหน่วยงาน..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {units.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="desiredRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>บทบาท</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="เลือกบทบาท..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value={ROLES.PROVINCIAL}>ปฏิบัติงาน (Operational)</SelectItem>
                                                <SelectItem value={ROLES.REGIONAL}>ติดตาม (Coordinator)</SelectItem>
                                                <SelectItem value={ROLES.READ_ONLY}>เข้าชม (Read Only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">ส่งคำขอ</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
