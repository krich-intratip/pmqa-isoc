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
import { GitBranch, Plus, Trash2, Edit, Link2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface StrategyLink {
    id: string;
    unitId: string;
    strategyCode: string;
    strategyName: string;
    strategyLevel: 'national' | 'ministry' | 'department' | 'unit';
    linkedKPIs: {
        kpiId: string;
        kpiCode: string;
        kpiName: string;
        linkStrength: 'direct' | 'indirect';
    }[];
    pmqaCategories: number[];
    description: string;
    createdAt: Timestamp;
}

const STRATEGY_LEVELS = [
    { value: 'national', label: 'ยุทธศาสตร์ชาติ', color: 'bg-red-100 text-red-800' },
    { value: 'ministry', label: 'แผนระดับกระทรวง', color: 'bg-orange-100 text-orange-800' },
    { value: 'department', label: 'แผนระดับกรม', color: 'bg-blue-100 text-blue-800' },
    { value: 'unit', label: 'แผนระดับหน่วย', color: 'bg-green-100 text-green-800' },
];

const PMQA_CATEGORIES = [
    { id: 1, name: 'หมวด 1' },
    { id: 2, name: 'หมวด 2' },
    { id: 3, name: 'หมวด 3' },
    { id: 4, name: 'หมวด 4' },
    { id: 5, name: 'หมวด 5' },
    { id: 6, name: 'หมวด 6' },
    { id: 7, name: 'หมวด 7' },
];

export default function StrategyLinkerPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [links, setLinks] = useState<StrategyLink[]>([]);
    const [kpiList, setKpiList] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<StrategyLink | null>(null);

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formName, setFormName] = useState('');
    const [formLevel, setFormLevel] = useState<StrategyLink['strategyLevel']>('unit');
    const [formDescription, setFormDescription] = useState('');
    const [formSelectedKPIs, setFormSelectedKPIs] = useState<string[]>([]);
    const [formCategories, setFormCategories] = useState<number[]>([]);

    const fetchData = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            setLinks([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch strategy links with cycleId filter
            const linkQ = query(
                collection(db, 'strategy_links'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id)
            );
            const linkSnap = await getDocs(linkQ);
            const linkData: StrategyLink[] = [];
            linkSnap.forEach(d => linkData.push({ id: d.id, ...d.data() } as StrategyLink));
            setLinks(linkData);

            // Fetch KPIs for linking
            const kpiQ = query(collection(db, 'kpi_definitions'), where('unitId', '==', user.unitId));
            const kpiSnap = await getDocs(kpiQ);
            const kpis: Record<string, unknown>[] = [];
            kpiSnap.forEach(d => kpis.push({ id: d.id, ...d.data() }));
            setKpiList(kpis);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedCycle]);

    const resetForm = () => {
        setFormCode('');
        setFormName('');
        setFormLevel('unit');
        setFormDescription('');
        setFormSelectedKPIs([]);
        setFormCategories([]);
        setEditingLink(null);
    };

    const handleEdit = (link: StrategyLink) => {
        setEditingLink(link);
        setFormCode(link.strategyCode);
        setFormName(link.strategyName);
        setFormLevel(link.strategyLevel);
        setFormDescription(link.description);
        setFormSelectedKPIs(link.linkedKPIs.map(k => k.kpiId));
        setFormCategories(link.pmqaCategories);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formCode || !formName) {
            toast.error('กรุณากรอกรหัสและชื่อยุทธศาสตร์');
            return;
        }
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setSaving(true);
        try {
            const linkedKPIs = formSelectedKPIs.map(kpiId => {
                const kpi = kpiList.find(k => k.id === kpiId);
                return {
                    kpiId,
                    kpiCode: kpi?.code || '',
                    kpiName: kpi?.name || '',
                    linkStrength: 'direct' as const,
                };
            });

            const linkData = {
                unitId: user!.unitId,
                cycleId: selectedCycle.id,
                strategyCode: formCode,
                strategyName: formName,
                strategyLevel: formLevel,
                linkedKPIs,
                pmqaCategories: formCategories,
                description: formDescription,
            };

            if (editingLink) {
                await updateDoc(doc(db, 'strategy_links', editingLink.id), linkData);
                toast.success('อัปเดตการเชื่อมโยงสำเร็จ');
            } else {
                await addDoc(collection(db, 'strategy_links'), {
                    ...linkData,
                    createdAt: serverTimestamp(),
                });
                toast.success('เพิ่มการเชื่อมโยงสำเร็จ');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบการเชื่อมโยงนี้?')) return;
        try {
            await deleteDoc(doc(db, 'strategy_links', id));
            toast.success('ลบสำเร็จ');
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const toggleKPI = (kpiId: string) => {
        setFormSelectedKPIs(prev =>
            prev.includes(kpiId) ? prev.filter(id => id !== kpiId) : [...prev, kpiId]
        );
    };

    const toggleCategory = (catId: number) => {
        setFormCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const totalKPIsLinked = links.reduce((sum, l) => sum + l.linkedKPIs.length, 0);

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <GitBranch className="h-8 w-8 text-purple-600" />
                            Strategy-to-KPI Linker
                        </h1>
                        <p className="text-muted-foreground">เชื่อมโยงยุทธศาสตร์กับตัวชี้วัด (App 3.3)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedCycle && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">รอบการประเมิน</p>
                                <p className="font-semibold text-purple-700">{selectedCycle.name || `ปี ${selectedCycle.year}`}</p>
                            </div>
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" disabled={!selectedCycle}>
                                    <Plus className="h-4 w-4" /> เพิ่มการเชื่อมโยง
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingLink ? 'แก้ไขการเชื่อมโยง' : 'เพิ่มการเชื่อมโยงใหม่'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>รหัส</Label>
                                            <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="S-001" />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label>ยุทธศาสตร์/เป้าหมาย</Label>
                                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ชื่อยุทธศาสตร์หรือเป้าหมาย" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>ระดับยุทธศาสตร์</Label>
                                            <select value={formLevel} onChange={(e) => setFormLevel(e.target.value as StrategyLink['strategyLevel'])} className="w-full border rounded-md p-2">
                                                {STRATEGY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>หมวด PMQA ที่เกี่ยวข้อง</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {PMQA_CATEGORIES.map(cat => (
                                                    <Badge
                                                        key={cat.id}
                                                        variant={formCategories.includes(cat.id) ? 'default' : 'outline'}
                                                        className="cursor-pointer"
                                                        onClick={() => toggleCategory(cat.id)}
                                                    >
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รายละเอียด</Label>
                                        <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="อธิบายความเชื่อมโยง" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เลือก KPI ที่เชื่อมโยง ({formSelectedKPIs.length} รายการ)</Label>
                                        <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                                            {kpiList.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-4">ยังไม่มี KPI - กรุณาสร้างใน KPI Dictionary ก่อน</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {kpiList.map(kpi => {
                                                        const kpiId = kpi.id as string;
                                                        const kpiCode = kpi.code as string;
                                                        const kpiName = kpi.name as string;
                                                        return (
                                                            <div
                                                                key={kpiId}
                                                                className={`p-2 rounded-lg cursor-pointer transition-colors ${formSelectedKPIs.includes(kpiId)
                                                                    ? 'bg-purple-100 border-purple-300 border'
                                                                    : 'bg-slate-50 hover:bg-slate-100'
                                                                    }`}
                                                                onClick={() => toggleKPI(kpiId)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-sm">{kpiCode}</span>
                                                                    <span className="text-sm">{kpiName}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
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

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold">{links.length}</div>
                                <div className="text-sm text-muted-foreground">ยุทธศาสตร์ที่เชื่อมโยง</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-blue-600">{totalKPIsLinked}</div>
                                <div className="text-sm text-muted-foreground">KPI ที่เชื่อมโยง</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">{kpiList.length}</div>
                                <div className="text-sm text-muted-foreground">KPI ทั้งหมด</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-orange-600">
                                    {kpiList.length > 0 ? Math.round((totalKPIsLinked / Math.max(kpiList.length, 1)) * 100) : 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">อัตราการเชื่อมโยง</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Links Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5" /> การเชื่อมโยงยุทธศาสตร์-KPI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">กำลังโหลด...</div>
                            ) : links.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>ยังไม่มีการเชื่อมโยง - คลิก &ldquo;เพิ่มการเชื่อมโยง&rdquo; เพื่อเริ่มต้น</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">รหัส</TableHead>
                                            <TableHead>ยุทธศาสตร์/เป้าหมาย</TableHead>
                                            <TableHead>ระดับ</TableHead>
                                            <TableHead>หมวด PMQA</TableHead>
                                            <TableHead>KPI ที่เชื่อมโยง</TableHead>
                                            <TableHead className="text-right">จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {links.map((link) => (
                                            <TableRow key={link.id}>
                                                <TableCell className="font-mono">{link.strategyCode}</TableCell>
                                                <TableCell className="font-medium">{link.strategyName}</TableCell>
                                                <TableCell>
                                                    <Badge className={STRATEGY_LEVELS.find(l => l.value === link.strategyLevel)?.color}>
                                                        {STRATEGY_LEVELS.find(l => l.value === link.strategyLevel)?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {link.pmqaCategories.map(catId => (
                                                            <Badge key={catId} variant="outline" className="text-xs">{catId}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {link.linkedKPIs.slice(0, 3).map(kpi => (
                                                            <Badge key={kpi.kpiId} variant="secondary" className="text-xs">{kpi.kpiCode}</Badge>
                                                        ))}
                                                        {link.linkedKPIs.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">+{link.linkedKPIs.length - 3}</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(link)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(link.id)}>
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
            </div>
        </ProtectedRoute>
    );
}
