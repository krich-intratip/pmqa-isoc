'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Link as LinkIcon, FileText, CheckCircle, AlertTriangle, Download, Trash2, History, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Evidence, FileVersion } from '@/types/database';
import { toast } from 'sonner';
import { canDeleteFiles } from '@/lib/auth/role-helper';
import { getVersionHistory, addNewVersion, deleteVersion, revertToVersion, formatFileSize, formatUploadDate } from '@/lib/file-version/file-version-helper';

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
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(false);

    // User permission check
    const isAdmin = user ? canDeleteFiles(user.role) : false;

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    // Add Dialog State
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newCriteria, setNewCriteria] = useState('');
    const [newType, setNewType] = useState<'link' | 'file'>('link');

    // Update Dialog State
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
    const [updateUrl, setUpdateUrl] = useState('');
    const [updateNotes, setUpdateNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // History Dialog State
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [versionHistory, setVersionHistory] = useState<FileVersion[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchEvidence = async (catId: number) => {
        if (!user?.unitId) return;

        // If no cycle selected, show message
        if (!selectedCycle) {
            setEvidenceList([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'evidence'),
                where('unitId', '==', user.unitId),
                where('categoryId', '==', catId),
                where('cycleId', '==', selectedCycle.id)
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
    }, [selectedCategory, user, selectedCycle]);

    const handleAddEvidence = async () => {
        if (!newTitle || !newUrl || !newCriteria) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!user?.unitId || !user?.uid) {
            toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
            return;
        }

        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อนเพิ่มหลักฐาน');
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
                cycleId: selectedCycle.id,
                uploadedBy: user.uid,
                uploadedAt: serverTimestamp() as Timestamp,
                verificationStatus: 'pending',
                completeness: 'partial',
                // Version System fields
                currentVersion: 1,
                totalVersions: 1,
                lastUpdatedAt: serverTimestamp() as Timestamp,
                lastUpdatedBy: user.uid,
            };

            const docRef = await addDoc(collection(db, 'evidence'), newEvidence);

            // Create initial version record
            await addDoc(collection(db, 'file_versions'), {
                evidenceId: docRef.id,
                version: 1,
                fileName: newTitle,
                fileUrl: newUrl,
                fileSize: 0,
                mimeType: newType === 'link' ? 'text/uri-list' : 'application/octet-stream',
                uploadedBy: user.uid,
                uploadedByName: user.displayName || 'Unknown',
                uploadedAt: serverTimestamp(),
                notes: 'เวอร์ชันเริ่มต้น',
                isLatest: true
            });

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

    // Handle Update (Add new version)
    const handleOpenUpdate = (evidence: Evidence) => {
        setSelectedEvidence(evidence);
        setUpdateUrl('');
        setUpdateNotes('');
        setUpdateDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedEvidence || !updateUrl) {
            toast.error('กรุณากรอก URL ใหม่');
            return;
        }

        if (!user?.uid || !user?.displayName) {
            toast.error('กรุณาเข้าสู่ระบบ');
            return;
        }

        setIsUpdating(true);
        try {
            await addNewVersion(
                selectedEvidence.id,
                {
                    fileName: selectedEvidence.title,
                    fileUrl: updateUrl,
                    fileSize: 0,
                    mimeType: selectedEvidence.type === 'link' ? 'text/uri-list' : 'application/octet-stream'
                },
                user.uid,
                user.displayName,
                updateNotes
            );

            toast.success('อัปเดตเวอร์ชันใหม่สำเร็จ');
            setUpdateDialogOpen(false);
            fetchEvidence(selectedCategory);
        } catch (error) {
            console.error(error);
            toast.error('อัปเดตไม่สำเร็จ');
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle View History
    const handleViewHistory = async (evidence: Evidence) => {
        setSelectedEvidence(evidence);
        setLoadingHistory(true);
        setHistoryDialogOpen(true);

        try {
            const history = await getVersionHistory(evidence.id);
            setVersionHistory(history);
        } catch (error) {
            console.error(error);
            toast.error('โหลดประวัติไม่สำเร็จ');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Handle Download
    const handleDownload = (url: string, title: string) => {
        window.open(url, '_blank');
        toast.success(`กำลังดาวน์โหลด: ${title}`);
    };

    // Handle Delete (Admin only)
    const handleDelete = async (evidence: Evidence) => {
        if (!isAdmin) {
            toast.error('ไม่มีสิทธิ์ลบไฟล์');
            return;
        }

        if (!confirm(`ต้องการลบ "${evidence.title}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }

        try {
            // Delete all versions first
            const versions = await getVersionHistory(evidence.id);
            for (const version of versions) {
                await deleteDoc(doc(db, 'file_versions', version.id));
            }

            // Delete evidence document
            await deleteDoc(doc(db, 'evidence', evidence.id));

            toast.success('ลบหลักฐานสำเร็จ');
            fetchEvidence(selectedCategory);
        } catch (error) {
            console.error(error);
            toast.error('ลบไม่สำเร็จ');
        }
    };

    // Handle Revert Version (Admin only)
    const handleRevert = async (versionId: string) => {
        if (!isAdmin || !selectedEvidence) {
            toast.error('ไม่มีสิทธิ์ย้อนกลับเวอร์ชัน');
            return;
        }

        try {
            await revertToVersion(selectedEvidence.id, versionId, user!.role);
            toast.success('ย้อนกลับเวอร์ชันสำเร็จ');

            // Refresh history
            const history = await getVersionHistory(selectedEvidence.id);
            setVersionHistory(history);
            fetchEvidence(selectedCategory);
        } catch (error) {
            console.error(error);
            toast.error('ย้อนกลับไม่สำเร็จ');
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-slate-800">
                            <FileText className="h-8 w-8 text-indigo-600" />
                            Evidence Register
                        </h1>
                        <p className="text-muted-foreground">เริ่มนำเข้าหลักฐานการดำเนินการ (Phase 1)</p>
                    </div>
                    {selectedCycle && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">รอบการประเมิน</p>
                            <p className="font-semibold text-indigo-700">{selectedCycle.name || `ปี ${selectedCycle.year}`}</p>
                        </div>
                    )}
                </div>

                {!selectedCycle && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-800">ยังไม่ได้เลือกรอบการประเมิน</p>
                                    <p className="text-sm text-yellow-700">กรุณาเลือกรอบการประเมินจาก Header ด้านบน หรือติดต่อ Admin เพื่อสร้างรอบการประเมินใหม่</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                        <TableHead className="w-[80px]">เกณฑ์</TableHead>
                                        <TableHead>หลักฐาน</TableHead>
                                        <TableHead className="w-[70px]">ประเภท</TableHead>
                                        <TableHead className="w-[70px]">Version</TableHead>
                                        <TableHead className="w-[100px]">สถานะ</TableHead>
                                        <TableHead className="w-[140px]">อัปเดตล่าสุด</TableHead>
                                        <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evidenceList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono bg-slate-50">{item.criteriaId}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.title}</div>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-[250px] block">
                                                    {item.url}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                {item.type === 'link' ? <LinkIcon className="h-4 w-4 text-slate-400" /> : <Upload className="h-4 w-4 text-slate-400" />}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    v{item.currentVersion || 1}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.verificationStatus === 'verified' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> ผ่าน</Badge>}
                                                {item.verificationStatus === 'pending' && <Badge variant="outline" className="text-amber-600 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" /> รอตรวจ</Badge>}
                                                {item.verificationStatus === 'rejected' && <Badge variant="destructive">แก้ไข</Badge>}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatUploadDate(item.lastUpdatedAt || item.uploadedAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDownload(item.url, item.title)}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            ดาวน์โหลด
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenUpdate(item)}>
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            อัปเดตเวอร์ชัน
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewHistory(item)}>
                                                            <History className="h-4 w-4 mr-2" />
                                                            ประวัติ ({item.totalVersions || 1} เวอร์ชัน)
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    ลบ
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {evidenceList.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                ยังไม่มีหลักฐานในหมวดนี้
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Tabs>

                {/* Update Version Dialog */}
                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>อัปเดตเวอร์ชันใหม่</DialogTitle>
                            <DialogDescription>
                                {selectedEvidence?.title} - ปัจจุบัน v{selectedEvidence?.currentVersion || 1}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">URL ใหม่</Label>
                                <Input
                                    value={updateUrl}
                                    onChange={e => setUpdateUrl(e.target.value)}
                                    className="col-span-3"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">หมายเหตุ</Label>
                                <Textarea
                                    value={updateNotes}
                                    onChange={e => setUpdateNotes(e.target.value)}
                                    className="col-span-3"
                                    placeholder="เช่น แก้ไขข้อมูลตามข้อเสนอแนะ"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>ยกเลิก</Button>
                            <Button onClick={handleUpdate} disabled={isUpdating}>
                                {isUpdating ? 'กำลังบันทึก...' : 'บันทึก v' + ((selectedEvidence?.currentVersion || 1) + 1)}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Version History Dialog */}
                <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>ประวัติเวอร์ชัน</DialogTitle>
                            <DialogDescription>
                                {selectedEvidence?.title}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto">
                            {loadingHistory ? (
                                <div className="text-center py-8 text-muted-foreground">กำลังโหลด...</div>
                            ) : versionHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">ไม่พบประวัติ</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Version</TableHead>
                                            <TableHead>อัปโหลดโดย</TableHead>
                                            <TableHead>วันเวลา</TableHead>
                                            <TableHead>หมายเหตุ</TableHead>
                                            <TableHead className="w-[120px] text-right">จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {versionHistory.map((version) => (
                                            <TableRow key={version.id} className={version.isLatest ? 'bg-green-50' : ''}>
                                                <TableCell>
                                                    <Badge variant={version.isLatest ? 'default' : 'outline'} className="font-mono">
                                                        v{version.version}
                                                        {version.isLatest && ' ✓'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{version.uploadedByName}</TableCell>
                                                <TableCell className="text-sm">
                                                    {formatUploadDate(version.uploadedAt)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                    {version.notes || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDownload(version.fileUrl, `${selectedEvidence?.title} v${version.version}`)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        {isAdmin && !version.isLatest && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevert(version.id)}
                                                                title="ย้อนกลับไปเวอร์ชันนี้"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>ปิด</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
