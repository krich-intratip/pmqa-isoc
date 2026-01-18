'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Unit, UnitCategory, UnitFunction } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES, UNIT_TYPES } from '@/lib/auth/role-helper';
import { Map, Plus, Building2, LayoutGrid } from 'lucide-react';

export default function NetworkMapperPage() {
    const { user } = useAuthStore();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [unitCode, setUnitCode] = useState('');
    const [unitName, setUnitName] = useState('');
    const [category, setCategory] = useState<UnitCategory>('Provincial');
    const [func, setFunc] = useState<UnitFunction>('Operational');
    const [region, setRegion] = useState('');

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'units'), orderBy('category'), orderBy('name'));
            const querySnapshot = await getDocs(q);
            const data: Unit[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Unit);
            });
            setUnits(data);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลหน่วยงานไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const handleAddUnit = async () => {
        if (!unitName || !category) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setIsAdding(true);
        try {
            await addDoc(collection(db, 'units'), {
                code: unitCode || `UNIT-${Date.now()}`,
                name: unitName,
                category,
                function: func,
                region: region || null,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Add other defaults
                aggregationRule: 'separate'
            });
            toast.success('เพิ่มหน่วยงานสำเร็จ');
            setUnitName('');
            setUnitCode('');
            fetchUnits();
        } catch (error) {
            toast.error('บันทึกไม่สำเร็จ');
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Map className="h-8 w-8 text-indigo-600" />
                            Network Scope Mapper
                        </h1>
                        <p className="text-muted-foreground">บริหารจัดการโครงสร้างหน่วยงานในเครือข่าย กอ.รมน.</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2"><Plus className="h-4 w-4" /> เพิ่มหน่วยงานใหม่</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>เพิ่มหน่วยงานใหม่</DialogTitle>
                                <DialogDescription>
                                    ระบุรายละเอียดของหน่วยงานเพื่อเพิ่มเข้าสู่ระบบ
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">ชื่อหน่วยงาน</Label>
                                    <Input id="name" value={unitName} onChange={(e) => setUnitName(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">รหัส (ถ้ามี)</Label>
                                    <Input id="code" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">ประเภท</Label>
                                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="เลือกประเภท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Central">ส่วนกลาง</SelectItem>
                                            <SelectItem value="Regional">ภาค</SelectItem>
                                            <SelectItem value="Provincial">จังหวัด</SelectItem>
                                            <SelectItem value="Center">ศูนย์ฯ</SelectItem>
                                            <SelectItem value="DirectUnit">นขต.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="function" className="text-right">หน้าที่</Label>
                                    <Select value={func} onValueChange={(v: any) => setFunc(v)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="เลือกหน้าที่" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Operational">ปฏิบัติงาน (Operational)</SelectItem>
                                            <SelectItem value="Monitoring">ติดตาม/กำกับ (Monitoring)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(category === 'Regional' || category === 'Provincial') && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="region" className="text-right">ภาค</Label>
                                        <Select value={region} onValueChange={setRegion}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="เลือกภาค" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">ภาค 1</SelectItem>
                                                <SelectItem value="2">ภาค 2</SelectItem>
                                                <SelectItem value="3">ภาค 3</SelectItem>
                                                <SelectItem value="4">ภาค 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleAddUnit} disabled={isAdding}>
                                    {isAdding ? 'Saving...' : 'บันทึก'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs defaultValue="list" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="list" className="gap-2"><LayoutGrid className="h-4 w-4" /> รายการหน่วยงาน</TabsTrigger>
                        <TabsTrigger value="hierarchy" className="gap-2"><Building2 className="h-4 w-4" /> โครงสร้างองค์กร</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list">
                        <Card>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>ชื่อหน่วยงาน</TableHead>
                                            <TableHead>ประเภท</TableHead>
                                            <TableHead>หน้าที่</TableHead>
                                            <TableHead>ภาค</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {units.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-mono text-xs">{u.code}</TableCell>
                                                <TableCell className="font-medium">{u.name}</TableCell>
                                                <TableCell>{u.category}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${u.function === 'Operational' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {u.function}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{u.region ? `ภาค ${u.region}` : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                        {units.length === 0 && !loading && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    ยังไม่มีข้อมูลหน่วยงาน
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hierarchy">
                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-slate-50 text-slate-400">
                            Interactive Tree Visualization (Coming Soon in App 0.1 Update)
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
