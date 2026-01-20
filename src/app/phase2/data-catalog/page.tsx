'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useCycleStore } from '@/stores/cycle-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Plus, Trash2, Edit, ExternalLink, FileSpreadsheet, Server, Cloud, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface DataSource {
    id: string;
    unitId: string;
    cycleId: string; // v1.6.0: Added cycle support
    name: string;
    description: string;
    type: 'database' | 'spreadsheet' | 'api' | 'manual' | 'other';
    location: string; // URL or path
    owner: string;
    frequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'adhoc';
    relatedKPIs: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

const DATA_TYPES = [
    { value: 'database', label: 'ฐานข้อมูล', icon: Server },
    { value: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
    { value: 'api', label: 'API', icon: Cloud },
    { value: 'manual', label: 'บันทึกด้วยมือ', icon: Edit },
    { value: 'other', label: 'อื่นๆ', icon: Database },
];

const FREQUENCIES = [
    { value: 'realtime', label: 'Realtime' },
    { value: 'daily', label: 'รายวัน' },
    { value: 'weekly', label: 'รายสัปดาห์' },
    { value: 'monthly', label: 'รายเดือน' },
    { value: 'quarterly', label: 'รายไตรมาส' },
    { value: 'yearly', label: 'รายปี' },
    { value: 'adhoc', label: 'ตามความต้องการ' },
];

export default function DataSourceCatalogPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [sources, setSources] = useState<DataSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<DataSource | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<DataSource['type']>('spreadsheet');
    const [formLocation, setFormLocation] = useState('');
    const [formOwner, setFormOwner] = useState('');
    const [formFrequency, setFormFrequency] = useState<DataSource['frequency']>('monthly');
    const [formKPIs, setFormKPIs] = useState('');

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const fetchSources = async () => {
        if (!user?.unitId) return;

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            setSources([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'data_sources'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id) // v1.6.0
            );
            const snap = await getDocs(q);
            const data: DataSource[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as DataSource));
            setSources(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedCycle]); // v1.6.0: Re-fetch when cycle changes

    const resetForm = () => {
        setFormName('');
        setFormDescription('');
        setFormType('spreadsheet');
        setFormLocation('');
        setFormOwner('');
        setFormFrequency('monthly');
        setFormKPIs('');
        setEditingSource(null);
    };

    const handleEdit = (source: DataSource) => {
        setEditingSource(source);
        setFormName(source.name);
        setFormDescription(source.description);
        setFormType(source.type);
        setFormLocation(source.location);
        setFormOwner(source.owner);
        setFormFrequency(source.frequency);
        setFormKPIs(source.relatedKPIs.join(', '));
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formName || !formLocation) {
            toast.error('กรุณากรอกชื่อและที่อยู่ข้อมูล');
            return;
        }

        if (!user?.unitId) {
            toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
            return;
        }

        // v1.6.0: Require cycle selection
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setSaving(true);
        try {
            const sourceData = {
                unitId: user.unitId,
                cycleId: selectedCycle.id, // v1.6.0
                name: formName,
                description: formDescription,
                type: formType,
                location: formLocation,
                owner: formOwner,
                frequency: formFrequency,
                relatedKPIs: formKPIs.split(',').map(k => k.trim()).filter(Boolean),
                updatedAt: serverTimestamp(),
            };

            if (editingSource) {
                await updateDoc(doc(db, 'data_sources', editingSource.id), sourceData);
                toast.success('อัปเดตแหล่งข้อมูลสำเร็จ');
            } else {
                await addDoc(collection(db, 'data_sources'), {
                    ...sourceData,
                    createdAt: serverTimestamp(),
                });
                toast.success('เพิ่มแหล่งข้อมูลสำเร็จ');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchSources();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบแหล่งข้อมูลนี้?')) return;
        try {
            await deleteDoc(doc(db, 'data_sources', id));
            toast.success('ลบสำเร็จ');
            fetchSources();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const getTypeIcon = (type: DataSource['type']) => {
        const typeInfo = DATA_TYPES.find(t => t.value === type);
        const Icon = typeInfo?.icon || Database;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Database className="h-8 w-8 text-blue-600" />
                            Data Source Catalog
                        </h1>
                        <p className="text-muted-foreground">จัดทำคลังแหล่งข้อมูล (App 2.1)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCycle && (
                            <Badge variant="outline" className="text-indigo-700 border-indigo-200">
                                รอบ: {selectedCycle.name || selectedCycle.year}
                            </Badge>
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" disabled={!selectedCycle}>
                                    <Plus className="h-4 w-4" /> เพิ่มแหล่งข้อมูล
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>{editingSource ? 'แก้ไขแหล่งข้อมูล' : 'เพิ่มแหล่งข้อมูลใหม่'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">ชื่อ</Label>
                                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="col-span-3" placeholder="ชื่อแหล่งข้อมูล" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">ประเภท</Label>
                                        <select value={formType} onChange={(e) => setFormType(e.target.value as DataSource['type'])} className="col-span-3 border rounded-md p-2">
                                            {DATA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">ที่อยู่/URL</Label>
                                        <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="col-span-3" placeholder="URL หรือ Path" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">ผู้รับผิดชอบ</Label>
                                        <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} className="col-span-3" placeholder="ชื่อผู้รับผิดชอบ" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">ความถี่</Label>
                                        <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value as DataSource['frequency'])} className="col-span-3 border rounded-md p-2">
                                            {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">KPIs ที่เกี่ยวข้อง</Label>
                                        <Input value={formKPIs} onChange={(e) => setFormKPIs(e.target.value)} className="col-span-3" placeholder="KPI1, KPI2, ..." />
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label className="text-right">คำอธิบาย</Label>
                                        <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="col-span-3" placeholder="รายละเอียดเพิ่มเติม" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
                            <div className="text-sm text-muted-foreground">แหล่งข้อมูลทั้งหมด</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-green-600">{sources.filter(s => s.type === 'spreadsheet').length}</div>
                            <div className="text-sm text-muted-foreground">Spreadsheet</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-purple-600">{sources.filter(s => s.type === 'database').length}</div>
                            <div className="text-sm text-muted-foreground">Database</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-orange-600">{sources.filter(s => s.type === 'api').length}</div>
                            <div className="text-sm text-muted-foreground">API</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการแหล่งข้อมูล</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : sources.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg">
                                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>ยังไม่มีแหล่งข้อมูล - คลิก "เพิ่มแหล่งข้อมูล" เพื่อเริ่มต้น</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead>ชื่อแหล่งข้อมูล</TableHead>
                                        <TableHead>ผู้รับผิดชอบ</TableHead>
                                        <TableHead>ความถี่</TableHead>
                                        <TableHead>KPIs</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sources.map((source) => (
                                        <TableRow key={source.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    {getTypeIcon(source.type)}
                                                    {DATA_TYPES.find(t => t.value === source.type)?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{source.name}</div>
                                                {source.location && (
                                                    <a href={source.location} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1">
                                                        <ExternalLink className="h-3 w-3" /> {source.location.substring(0, 40)}...
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell>{source.owner || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{FREQUENCIES.find(f => f.value === source.frequency)?.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {source.relatedKPIs.slice(0, 3).map(kpi => (
                                                        <Badge key={kpi} variant="outline" className="text-xs">{kpi}</Badge>
                                                    ))}
                                                    {source.relatedKPIs.length > 3 && <Badge variant="outline" className="text-xs">+{source.relatedKPIs.length - 3}</Badge>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(source)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(source.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
