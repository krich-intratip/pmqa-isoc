'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Star, Megaphone, Save, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { Announcement, AnnouncementSlot } from '@/types/database';

const SLOT_CONFIG: Record<AnnouncementSlot, { icon: React.ReactNode; label: string; description: string }> = {
    what_is_pmqa: {
        icon: <BookOpen className="h-5 w-5" />,
        label: 'PMQA 4.0 คืออะไร',
        description: 'อธิบายความหมายและวัตถุประสงค์ของ PMQA 4.0',
    },
    why_important: {
        icon: <Star className="h-5 w-5" />,
        label: 'ความสำคัญของ PMQA',
        description: 'อธิบายว่า PMQA สำคัญและจำเป็นอย่างไร',
    },
    announcement: {
        icon: <Megaphone className="h-5 w-5" />,
        label: 'ประกาศสำคัญ',
        description: 'นโยบายของผู้บังคับบัญชาเกี่ยวกับงาน PMQA',
    },
};

interface SlotEditorProps {
    slot: AnnouncementSlot;
    announcement: Announcement | null;
    onSave: (data: Partial<Announcement>) => Promise<void>;
    saving: boolean;
}

function SlotEditor({ slot, announcement, onSave, saving }: SlotEditorProps) {
    const config = SLOT_CONFIG[slot];
    const [title, setTitle] = useState(announcement?.title || config.label);
    const [content, setContent] = useState(announcement?.content || '');
    const [link, setLink] = useState(announcement?.link || '');
    const [linkText, setLinkText] = useState(announcement?.linkText || '');
    const [isActive, setIsActive] = useState(announcement?.isActive ?? true);

    useEffect(() => {
        setTitle(announcement?.title || config.label);
        setContent(announcement?.content || '');
        setLink(announcement?.link || '');
        setLinkText(announcement?.linkText || '');
        setIsActive(announcement?.isActive ?? true);
    }, [announcement, config.label]);

    const handleSave = () => {
        onSave({
            slot,
            title,
            content,
            link: link || undefined,
            linkText: linkText || undefined,
            isActive,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`active-${slot}`}>แสดงบน Dashboard</Label>
                    <Switch
                        id={`active-${slot}`}
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                </div>

                <div>
                    <Label htmlFor={`title-${slot}`}>หัวข้อ</Label>
                    <Input
                        id={`title-${slot}`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={config.label}
                    />
                </div>

                <div>
                    <Label htmlFor={`content-${slot}`}>เนื้อหา</Label>
                    <Textarea
                        id={`content-${slot}`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="ใส่เนื้อหาที่ต้องการแสดง..."
                        rows={5}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`link-${slot}`}>ลิงก์ (ถ้ามี)</Label>
                        <Input
                            id={`link-${slot}`}
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <Label htmlFor={`linkText-${slot}`}>ข้อความปุ่ม</Label>
                        <Input
                            id={`linkText-${slot}`}
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="อ่านเพิ่มเติม"
                        />
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    บันทึก
                </Button>
            </CardContent>
        </Card>
    );
}

export function AnnouncementManager() {
    const { user } = useAuthStore();
    const [announcements, setAnnouncements] = useState<Record<AnnouncementSlot, Announcement | null>>({
        what_is_pmqa: null,
        why_important: null,
        announcement: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'announcements'));
            const data: Record<AnnouncementSlot, Announcement | null> = {
                what_is_pmqa: null,
                why_important: null,
                announcement: null,
            };

            snapshot.forEach((docSnap) => {
                const announcement = { id: docSnap.id, ...docSnap.data() } as Announcement;
                if (announcement.slot in data) {
                    data[announcement.slot] = announcement;
                }
            });

            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('ไม่สามารถโหลดข้อมูลประกาศได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: Partial<Announcement>) => {
        if (!user || !data.slot) return;

        setSaving(true);
        try {
            const docId = data.slot; // Use slot as document ID for simplicity
            const docRef = doc(db, 'announcements', docId);

            await setDoc(docRef, {
                ...data,
                id: docId,
                updatedAt: Timestamp.now(),
                updatedBy: user.uid,
                updatedByName: user.displayName || user.email,
            }, { merge: true });

            toast.success('บันทึกเรียบร้อยแล้ว');
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>ข้อมูลที่บันทึกจะแสดงบน Dashboard สำหรับผู้ใช้ทุกคน</span>
            </div>

            <Tabs defaultValue="what_is_pmqa" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="what_is_pmqa" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">PMQA คืออะไร</span>
                    </TabsTrigger>
                    <TabsTrigger value="why_important" className="gap-2">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">ความสำคัญ</span>
                    </TabsTrigger>
                    <TabsTrigger value="announcement" className="gap-2">
                        <Megaphone className="h-4 w-4" />
                        <span className="hidden sm:inline">ประกาศ</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="what_is_pmqa" className="mt-4">
                    <SlotEditor
                        slot="what_is_pmqa"
                        announcement={announcements.what_is_pmqa}
                        onSave={handleSave}
                        saving={saving}
                    />
                </TabsContent>

                <TabsContent value="why_important" className="mt-4">
                    <SlotEditor
                        slot="why_important"
                        announcement={announcements.why_important}
                        onSave={handleSave}
                        saving={saving}
                    />
                </TabsContent>

                <TabsContent value="announcement" className="mt-4">
                    <SlotEditor
                        slot="announcement"
                        announcement={announcements.announcement}
                        onSave={handleSave}
                        saving={saving}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
