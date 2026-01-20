'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save, Loader2, Building2, Target, Users, Lightbulb } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface ContextPack {
    unitId: string;
    // Organization Profile
    orgProfile: {
        mission: string;
        vision: string;
        values: string;
        coreCompetencies: string;
        serviceArea: string;
    };
    // Stakeholders
    stakeholders: {
        customers: string;
        partners: string;
        suppliers: string;
        community: string;
    };
    // Strategic Context
    strategicContext: {
        strategicChallenges: string;
        strategicAdvantages: string;
        keyOpportunities: string;
        externalFactors: string;
    };
    // Performance Improvement
    performanceContext: {
        learningNeeds: string;
        processImprovement: string;
        innovationFocus: string;
        knowledgeManagement: string;
    };
    updatedAt: Timestamp;
}

const TABS = [
    { id: 'profile', label: 'องค์กร', icon: Building2 },
    { id: 'stakeholders', label: 'ผู้มีส่วนได้ส่วนเสีย', icon: Users },
    { id: 'strategic', label: 'บริบทเชิงกลยุทธ์', icon: Target },
    { id: 'performance', label: 'การพัฒนา', icon: Lightbulb },
];

export default function ContextPackPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Form state
    const [orgProfile, setOrgProfile] = useState({
        mission: '',
        vision: '',
        values: '',
        coreCompetencies: '',
        serviceArea: '',
    });
    const [stakeholders, setStakeholders] = useState({
        customers: '',
        partners: '',
        suppliers: '',
        community: '',
    });
    const [strategicContext, setStrategicContext] = useState({
        strategicChallenges: '',
        strategicAdvantages: '',
        keyOpportunities: '',
        externalFactors: '',
    });
    const [performanceContext, setPerformanceContext] = useState({
        learningNeeds: '',
        processImprovement: '',
        innovationFocus: '',
        knowledgeManagement: '',
    });

    const fetchData = async () => {
        if (!user?.unitId) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'context_packs', user.unitId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as ContextPack;
                setOrgProfile(data.orgProfile);
                setStakeholders(data.stakeholders);
                setStrategicContext(data.strategicContext);
                setPerformanceContext(data.performanceContext);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSave = async () => {
        if (!user?.unitId) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'context_packs', user.unitId), {
                unitId: user.unitId,
                orgProfile,
                stakeholders,
                strategicContext,
                performanceContext,
                updatedAt: serverTimestamp(),
            });
            toast.success('บันทึก Context Pack สำเร็จ');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const getCompletionRate = () => {
        const allFields = [
            ...Object.values(orgProfile),
            ...Object.values(stakeholders),
            ...Object.values(strategicContext),
            ...Object.values(performanceContext),
        ];
        const filled = allFields.filter(v => v.trim() !== '').length;
        return Math.round((filled / allFields.length) * 100);
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <FileText className="h-8 w-8 text-sky-600" />
                            Context Pack Builder
                        </h1>
                        <p className="text-muted-foreground">รวบรวมบริบทองค์กรสำหรับ SAR (App 3.1)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            {getCompletionRate()}% สมบูรณ์
                        </Badge>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            บันทึก
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">กำลังโหลด...</div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4 mb-6">
                            {TABS.map(tab => (
                                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" /> ข้อมูลองค์กร
                                    </CardTitle>
                                    <CardDescription>ข้อมูลพื้นฐานขององค์กรสำหรับ SAR หมวด P</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>พันธกิจ (Mission)</Label>
                                        <Textarea value={orgProfile.mission} onChange={(e) => setOrgProfile({ ...orgProfile, mission: e.target.value })} placeholder="พันธกิจหลักขององค์กร" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>วิสัยทัศน์ (Vision)</Label>
                                        <Textarea value={orgProfile.vision} onChange={(e) => setOrgProfile({ ...orgProfile, vision: e.target.value })} placeholder="วิสัยทัศน์ขององค์กร" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ค่านิยม (Values)</Label>
                                        <Textarea value={orgProfile.values} onChange={(e) => setOrgProfile({ ...orgProfile, values: e.target.value })} placeholder="ค่านิยมหลักขององค์กร" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>สมรรถนะหลัก (Core Competencies)</Label>
                                        <Textarea value={orgProfile.coreCompetencies} onChange={(e) => setOrgProfile({ ...orgProfile, coreCompetencies: e.target.value })} placeholder="ความสามารถหลักที่ทำให้องค์กรแตกต่าง" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>พื้นที่ให้บริการ/ภารกิจ</Label>
                                        <Textarea value={orgProfile.serviceArea} onChange={(e) => setOrgProfile({ ...orgProfile, serviceArea: e.target.value })} placeholder="ขอบเขตภารกิจและพื้นที่ให้บริการ" rows={2} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="stakeholders">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" /> ผู้มีส่วนได้ส่วนเสีย
                                    </CardTitle>
                                    <CardDescription>ข้อมูลผู้รับบริการและผู้มีส่วนได้ส่วนเสียสำหรับ SAR หมวด 3</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>ผู้รับบริการ (Customers)</Label>
                                        <Textarea value={stakeholders.customers} onChange={(e) => setStakeholders({ ...stakeholders, customers: e.target.value })} placeholder="กลุ่มผู้รับบริการหลัก ความต้องการ และความคาดหวัง" rows={4} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>พันธมิตร (Partners)</Label>
                                        <Textarea value={stakeholders.partners} onChange={(e) => setStakeholders({ ...stakeholders, partners: e.target.value })} placeholder="หน่วยงานพันธมิตรและความร่วมมือ" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ผู้ส่งมอบ (Suppliers)</Label>
                                        <Textarea value={stakeholders.suppliers} onChange={(e) => setStakeholders({ ...stakeholders, suppliers: e.target.value })} placeholder="หน่วยงานที่สนับสนุนทรัพยากร" rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ชุมชน/สังคม</Label>
                                        <Textarea value={stakeholders.community} onChange={(e) => setStakeholders({ ...stakeholders, community: e.target.value })} placeholder="ความรับผิดชอบต่อสังคมและชุมชน" rows={2} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="strategic">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" /> บริบทเชิงกลยุทธ์
                                    </CardTitle>
                                    <CardDescription>ความท้าทาย ข้อได้เปรียบ และโอกาสสำหรับ SAR หมวด 2</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>ความท้าทายเชิงกลยุทธ์ (Strategic Challenges)</Label>
                                        <Textarea value={strategicContext.strategicChallenges} onChange={(e) => setStrategicContext({ ...strategicContext, strategicChallenges: e.target.value })} placeholder="ความท้าทายหลักที่องค์กรเผชิญ" rows={4} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ข้อได้เปรียบเชิงกลยุทธ์ (Strategic Advantages)</Label>
                                        <Textarea value={strategicContext.strategicAdvantages} onChange={(e) => setStrategicContext({ ...strategicContext, strategicAdvantages: e.target.value })} placeholder="จุดแข็งและข้อได้เปรียบขององค์กร" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>โอกาสสำคัญ (Key Opportunities)</Label>
                                        <Textarea value={strategicContext.keyOpportunities} onChange={(e) => setStrategicContext({ ...strategicContext, keyOpportunities: e.target.value })} placeholder="โอกาสสำคัญสำหรับการพัฒนาองค์กร" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ปัจจัยภายนอก (PESTEL)</Label>
                                        <Textarea value={strategicContext.externalFactors} onChange={(e) => setStrategicContext({ ...strategicContext, externalFactors: e.target.value })} placeholder="ปัจจัยภายนอกที่มีผลกระทบ (การเมือง เศรษฐกิจ สังคม เทคโนโลยี สิ่งแวดล้อม กฎหมาย)" rows={4} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="performance">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5" /> การพัฒนาและนวัตกรรม
                                    </CardTitle>
                                    <CardDescription>ข้อมูลด้านการเรียนรู้และปรับปรุงสำหรับ SAR หมวด 4-5</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>ความต้องการด้านการเรียนรู้</Label>
                                        <Textarea value={performanceContext.learningNeeds} onChange={(e) => setPerformanceContext({ ...performanceContext, learningNeeds: e.target.value })} placeholder="ความต้องการพัฒนาบุคลากรและทักษะที่จำเป็น" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>การปรับปรุงกระบวนการ</Label>
                                        <Textarea value={performanceContext.processImprovement} onChange={(e) => setPerformanceContext({ ...performanceContext, processImprovement: e.target.value })} placeholder="แนวทางการปรับปรุงกระบวนการทำงานหลัก" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>จุดเน้นด้านนวัตกรรม</Label>
                                        <Textarea value={performanceContext.innovationFocus} onChange={(e) => setPerformanceContext({ ...performanceContext, innovationFocus: e.target.value })} placeholder="นวัตกรรมที่องค์กรมุ่งเน้น" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>การจัดการความรู้</Label>
                                        <Textarea value={performanceContext.knowledgeManagement} onChange={(e) => setPerformanceContext({ ...performanceContext, knowledgeManagement: e.target.value })} placeholder="แนวทางการจัดการและถ่ายทอดความรู้ในองค์กร" rows={3} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </ProtectedRoute>
    );
}
