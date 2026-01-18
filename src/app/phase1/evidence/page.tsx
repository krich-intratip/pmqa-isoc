'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Link as LinkIcon, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Evidence } from '@/types/database';
import { toast } from 'sonner';

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1: การนำองค์การ' },
    { id: 2, name: 'หมวด 2: การวางแผนเชิงยุทธศาสตร์' },
    { id: 3, name: 'หมวด 3: การให้ความสำคัญกับผู้รับบริการและผู้มีส่วนได้ส่วนเสีย' },
    { id: 4, name: 'หมวด 4: การวัด การวิเคราะห์ และการจัดการความรู้' },
    { id: 5, name: 'หมวด 5: การมุ่งเน้นบุคลากร' },
    { id: 6, name: 'หมวด 6: การมุ่งเน้นระบบปฏิบัติการ' },
    { id: 7, name: 'หมวด 7: ผลลัพธ์การดำเนินการ' },
];

export default function EvidenceRegisterPage() {
    const { user } = useAuthStore();
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Dialog State
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newCriteria, setNewCriteria] = useState('');
    const [newType, setNewType] = useState<'link' | 'file'>('link');

    const fetchEvidence = async (catId: number) => {
        if (!user?.unitId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'evidence'),
                where('unitId', '==', user.unitId),
                where('categoryId', '==', catId)
            );
            const snap = await getDocs(q);
            const data: Evidence[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as Evidence));
            setEvidenceList(data);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvidence(selectedCategory);
    }, [selectedCategory, user]);

    const handleAddEvidence = async () => {
        if (!newTitle || !newUrl || !newCriteria) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!user?.unitId || !user?.uid) {
            toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
            return;
        }

        setIsAdding(true);
        try {
            const newEvidence: Partial<Evidence> = {
                unitId: user.unitId,
                categoryId: selectedCategory,
                criteriaId: newCriteria,
                type: newType,
                title: newTitle,
                url: newUrl,
                uploadedBy: user.uid,
                uploadedAt: serverTimestamp() as Timestamp,
                verificationStatus: 'pending',
                completeness: 'partial',
            };

            await addDoc(collection(db, 'evidence'), newEvidence);
            toast.success('เพิ่มหลักฐานสำเร็จ');

            // Reset form
            setNewTitle('');
            setNewUrl('');
            fetchEvidence(selectedCategory);
        } catch (error) {
            console.error(error);
            toast.error('บันทึกไม่สำเร็จ');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
                    <FileText className="h-8 w-8 text-indigo-600" />
                    Evidence Register
                </h1>
                <p className="text-muted-foreground mb-6">เริ่มนำเข้าหลักฐานการดำเนินการ (Phase 1)</p>

                <Tabs value={selectedCategory.toString()} onValueChange={(v) => setSelectedCategory(Number(v))}>
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="mb-6 h-auto flex-wrap justify-start">
                            {PMQA_CATEGORIES.map(cat => (
                                <TabsTrigger key={cat.id} value={cat.id.toString()} className="px-4 py-2">
                                    หมวด {cat.id}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{PMQA_CATEGORIES.find(c => c.id === selectedCategory)?.name}</CardTitle>
                                <CardDescription>รายการหลักฐานที่นำเข้าระบบแล้ว</CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="gap-2"><Plus className="h-4 w-4" /> เพิ่มหลักฐานใหม่</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>เพิ่มหลักฐานใหม่ (หมวด {selectedCategory})</DialogTitle>
                                        <DialogDescription>ระบุรายละเอียดเอกสารหรือลิงค์หลักฐาน</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">หัวข้อหลักฐาน</Label>
                                            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="col-span-3" placeholder="เช่น แผนยุทธศาสตร์ปี 69" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">เกณฑ์ย่อย (ID)</Label>
                                            <Input value={newCriteria} onChange={e => setNewCriteria(e.target.value)} className="col-span-3" placeholder="เช่น 2.1 ก(1)" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">ประเภท</Label>
                                            <Select value={newType} onValueChange={(v: 'link' | 'file') => setNewType(v)}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="link">Link (Google Drive/Web)</SelectItem>
                                                    <SelectItem value="file">File Upload (Demo)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label className="text-right">URL / Path</Label>
                                            <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} className="col-span-3" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddEvidence} disabled={isAdding}>
                                            {isAdding ? 'Saving...' : 'บันทึก'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Criteria ID</TableHead>
                                        <TableHead>หลักฐาน</TableHead>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">วันที่นำเข้า</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evidenceList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono bg-slate-50">{item.criteriaId}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.title}</div>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-[300px] block">
                                                    {item.url}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                {item.type === 'link' ? <LinkIcon className="h-4 w-4 text-slate-400" /> : <Upload className="h-4 w-4 text-slate-400" />}
                                            </TableCell>
                                            <TableCell>
                                                {item.verificationStatus === 'verified' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> ผ่าน</Badge>}
                                                {item.verificationStatus === 'pending' && <Badge variant="outline" className="text-amber-600 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" /> รอตรวจ</Badge>}
                                                {item.verificationStatus === 'rejected' && <Badge variant="destructive">แก้ไข</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-sm">
                                                {item.uploadedAt?.toDate().toLocaleDateString('th-TH')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {evidenceList.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                ยังไม่มีหลักฐานในหมวดนี้
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
