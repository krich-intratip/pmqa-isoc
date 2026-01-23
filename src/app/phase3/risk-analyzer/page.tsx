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
import { AlertTriangle, Plus, Trash2, Edit, Shield } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface RiskItem {
    id: string;
    unitId: string;
    code: string;
    name: string;
    description: string;
    category: 'strategic' | 'operational' | 'financial' | 'compliance' | 'reputation';
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    riskLevel: number;
    mitigation: string;
    owner: string;
    status: 'identified' | 'mitigating' | 'monitored' | 'closed';
    createdAt: Timestamp;
}

const CATEGORIES = [
    { value: 'strategic', label: 'ความเสี่ยงเชิงกลยุทธ์', color: 'bg-purple-100 text-purple-800' },
    { value: 'operational', label: 'ความเสี่ยงด้านปฏิบัติการ', color: 'bg-blue-100 text-blue-800' },
    { value: 'financial', label: 'ความเสี่ยงด้านการเงิน', color: 'bg-green-100 text-green-800' },
    { value: 'compliance', label: 'ความเสี่ยงด้านกฎระเบียบ', color: 'bg-orange-100 text-orange-800' },
    { value: 'reputation', label: 'ความเสี่ยงด้านชื่อเสียง', color: 'bg-red-100 text-red-800' },
];

const LIKELIHOOD_LABELS = ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];
const IMPACT_LABELS = ['น้อยมาก', 'น้อย', 'ปานกลาง', 'มาก', 'รุนแรง'];

export default function RiskAnalyzerPage() {
    const { user } = useAuthStore();
    const { selectedCycle, fetchCycles } = useCycleStore();
    const [risks, setRisks] = useState<RiskItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

    // Fetch cycles on mount
    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState<RiskItem['category']>('operational');
    const [formLikelihood, setFormLikelihood] = useState<number>(3);
    const [formImpact, setFormImpact] = useState<number>(3);
    const [formMitigation, setFormMitigation] = useState('');
    const [formOwner, setFormOwner] = useState('');

    const fetchRisks = async () => {
        if (!user?.unitId) return;
        if (!selectedCycle) {
            setRisks([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const q = query(
                collection(db, 'risks'),
                where('unitId', '==', user.unitId),
                where('cycleId', '==', selectedCycle.id)
            );
            const snap = await getDocs(q);
            const data: RiskItem[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as RiskItem));
            setRisks(data.sort((a, b) => b.riskLevel - a.riskLevel));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRisks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedCycle]);

    const resetForm = () => {
        setFormCode('');
        setFormName('');
        setFormDescription('');
        setFormCategory('operational');
        setFormLikelihood(3);
        setFormImpact(3);
        setFormMitigation('');
        setFormOwner('');
        setEditingRisk(null);
    };

    const handleEdit = (risk: RiskItem) => {
        setEditingRisk(risk);
        setFormCode(risk.code);
        setFormName(risk.name);
        setFormDescription(risk.description);
        setFormCategory(risk.category);
        setFormLikelihood(risk.likelihood);
        setFormImpact(risk.impact);
        setFormMitigation(risk.mitigation);
        setFormOwner(risk.owner);
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formCode || !formName) {
            toast.error('กรุณากรอกรหัสและชื่อความเสี่ยง');
            return;
        }
        if (!selectedCycle) {
            toast.error('กรุณาเลือกรอบการประเมินก่อน');
            return;
        }

        setSaving(true);
        const riskLevel = formLikelihood * formImpact;

        try {
            const riskData = {
                unitId: user!.unitId,
                code: formCode,
                name: formName,
                description: formDescription,
                category: formCategory,
                likelihood: formLikelihood as 1 | 2 | 3 | 4 | 5,
                impact: formImpact as 1 | 2 | 3 | 4 | 5,
                riskLevel,
                mitigation: formMitigation,
                owner: formOwner,
                status: 'identified' as const,
            };

            if (editingRisk) {
                await updateDoc(doc(db, 'risks', editingRisk.id), riskData);
                toast.success('อัปเดตความเสี่ยงสำเร็จ');
            } else {
                await addDoc(collection(db, 'risks'), {
                    ...riskData,
                    cycleId: selectedCycle.id,
                    createdAt: serverTimestamp(),
                });
                toast.success('เพิ่มความเสี่ยงสำเร็จ');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchRisks();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ต้องการลบความเสี่ยงนี้?')) return;
        try {
            await deleteDoc(doc(db, 'risks', id));
            toast.success('ลบสำเร็จ');
            fetchRisks();
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const getRiskLevelBadge = (level: number) => {
        if (level >= 15) return <Badge className="bg-red-500 text-white">สูงมาก ({level})</Badge>;
        if (level >= 10) return <Badge className="bg-orange-500 text-white">สูง ({level})</Badge>;
        if (level >= 5) return <Badge className="bg-yellow-500 text-white">ปานกลาง ({level})</Badge>;
        return <Badge className="bg-green-500 text-white">ต่ำ ({level})</Badge>;
    };

    const highRisks = risks.filter(r => r.riskLevel >= 15).length;
    const mediumRisks = risks.filter(r => r.riskLevel >= 10 && r.riskLevel < 15).length;
    const lowRisks = risks.filter(r => r.riskLevel < 10).length;

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                            Risk & Foresight Analyzer
                        </h1>
                        <p className="text-muted-foreground">วิเคราะห์ความเสี่ยงและแนวโน้ม (App 3.2)</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedCycle && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">รอบการประเมิน</p>
                                <p className="font-semibold text-orange-700">{selectedCycle.name || `ปี ${selectedCycle.year}`}</p>
                            </div>
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="gap-2" disabled={!selectedCycle}>
                                    <Plus className="h-4 w-4" /> เพิ่มความเสี่ยง
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{editingRisk ? 'แก้ไขความเสี่ยง' : 'เพิ่มความเสี่ยงใหม่'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>รหัส</Label>
                                            <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="R-001" />
                                        </div>
                                        <div className="col-span-3 space-y-2">
                                            <Label>ชื่อความเสี่ยง</Label>
                                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ความเสี่ยงด้าน..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>ประเภท</Label>
                                            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as RiskItem['category'])} className="w-full border rounded-md p-2">
                                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>โอกาสเกิด (1-5)</Label>
                                            <select value={formLikelihood} onChange={(e) => setFormLikelihood(Number(e.target.value))} className="w-full border rounded-md p-2">
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {LIKELIHOOD_LABELS[n - 1]}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ผลกระทบ (1-5)</Label>
                                            <select value={formImpact} onChange={(e) => setFormImpact(Number(e.target.value))} className="w-full border rounded-md p-2">
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} - {IMPACT_LABELS[n - 1]}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                                        <span className="text-muted-foreground">ค่าความเสี่ยง: </span>
                                        {getRiskLevelBadge(formLikelihood * formImpact)}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>รายละเอียด</Label>
                                        <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="อธิบายความเสี่ยง" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>มาตรการจัดการ</Label>
                                        <Textarea value={formMitigation} onChange={(e) => setFormMitigation(e.target.value)} placeholder="แนวทางลดความเสี่ยง" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ผู้รับผิดชอบ</Label>
                                        <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} placeholder="ชื่อผู้รับผิดชอบ" />
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

                    {/* Risk Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="border-l-4 border-l-slate-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold">{risks.length}</div>
                                <div className="text-sm text-muted-foreground">ความเสี่ยงทั้งหมด</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-red-600">{highRisks}</div>
                                <div className="text-sm text-muted-foreground">ระดับสูงมาก (≥15)</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-orange-600">{mediumRisks}</div>
                                <div className="text-sm text-muted-foreground">ระดับสูง (10-14)</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600">{lowRisks}</div>
                                <div className="text-sm text-muted-foreground">ระดับต่ำ-ปานกลาง</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Risk Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" /> ทะเบียนความเสี่ยง
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">กำลังโหลด...</div>
                            ) : risks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>ยังไม่มีความเสี่ยง - คลิก &quot;เพิ่มความเสี่ยง&quot; เพื่อเริ่มต้น</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">รหัส</TableHead>
                                            <TableHead>ความเสี่ยง</TableHead>
                                            <TableHead>ประเภท</TableHead>
                                            <TableHead className="text-center">L×I</TableHead>
                                            <TableHead>ระดับ</TableHead>
                                            <TableHead>ผู้รับผิดชอบ</TableHead>
                                            <TableHead className="text-right">จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {risks.map((risk) => (
                                            <TableRow key={risk.id}>
                                                <TableCell className="font-mono">{risk.code}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{risk.name}</div>
                                                    {risk.mitigation && <div className="text-xs text-muted-foreground truncate max-w-[250px]">มาตรการ: {risk.mitigation}</div>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={CATEGORIES.find(c => c.value === risk.category)?.color}>
                                                        {CATEGORIES.find(c => c.value === risk.category)?.label.split('ด้าน')[1] || risk.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">{risk.likelihood}×{risk.impact}</TableCell>
                                                <TableCell>{getRiskLevelBadge(risk.riskLevel)}</TableCell>
                                                <TableCell>{risk.owner || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(risk)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(risk.id)}>
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
