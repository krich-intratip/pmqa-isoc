'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Mail, Bell, Clock, AlertTriangle, CheckCircle2, XCircle, Send } from 'lucide-react';
import { isEmailServiceReady, queueDeadlineReminders, QueuedEmail } from '@/lib/email/email-service';
import { AssessmentCycle, User } from '@/types/database';

interface EmailNotificationSettingsProps {
    activeCycle?: AssessmentCycle;
}

export default function EmailNotificationSettings({ activeCycle }: EmailNotificationSettingsProps) {
    const [emailServiceReady, setEmailServiceReady] = useState(false);
    const [pendingEmails, setPendingEmails] = useState<QueuedEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingReminders, setSendingReminders] = useState(false);

    // Notification settings (stored in localStorage for now, should be in Firestore)
    const [settings, setSettings] = useState({
        deadlineReminders: true,
        approvalNotifications: true,
        mentionNotifications: true,
        reminderDays: [7, 3, 1], // Days before deadline
    });

    useEffect(() => {
        checkEmailService();
        fetchPendingEmails();
    }, []);

    const checkEmailService = () => {
        setEmailServiceReady(isEmailServiceReady());
    };

    const fetchPendingEmails = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'email_queue'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const emails: QueuedEmail[] = [];
            snapshot.forEach(doc => {
                emails.push({ id: doc.id, ...doc.data() } as QueuedEmail);
            });
            setPendingEmails(emails);
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendDeadlineReminders = async () => {
        if (!activeCycle) {
            toast.error('ไม่มีรอบประเมินที่กำลังดำเนินการ');
            return;
        }

        setSendingReminders(true);
        try {
            // Fetch all approved users
            const usersSnapshot = await getDocs(
                query(collection(db, 'users'), where('status', '==', 'approved'))
            );

            const users: Array<{ email: string; name: string; evidenceCount: number; verifiedCount: number }> = [];
            usersSnapshot.forEach(doc => {
                const user = doc.data() as User;
                users.push({
                    email: user.email,
                    name: user.displayName,
                    evidenceCount: 0, // Would need to fetch actual counts
                    verifiedCount: 0,
                });
            });

            if (users.length === 0) {
                toast.error('ไม่พบผู้ใช้ที่ได้รับการอนุมัติ');
                return;
            }

            // Calculate days left
            const endDate = activeCycle.endDate.toDate();
            const today = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            await queueDeadlineReminders(
                activeCycle.name,
                endDate.toLocaleDateString('th-TH'),
                daysLeft,
                users
            );

            toast.success(`จัดคิวอีเมลแจ้งเตือน ${users.length} ฉบับเรียบร้อยแล้ว`);
            fetchPendingEmails();
        } catch (error) {
            console.error('Error sending reminders:', error);
            toast.error('เกิดข้อผิดพลาดในการส่งแจ้งเตือน');
        } finally {
            setSendingReminders(false);
        }
    };

    const getStatusBadge = (status: QueuedEmail['status']) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />รอส่ง</Badge>;
            case 'sent':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />ส่งแล้ว</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ล้มเหลว</Badge>;
        }
    };

    const getEmailTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            deadline_reminder: 'แจ้งเตือนกำหนดส่ง',
            approval_notification: 'แจ้งอนุมัติบัญชี',
            rejection_notification: 'แจ้งไม่อนุมัติ',
            cycle_start: 'เริ่มรอบประเมิน',
            cycle_end: 'สิ้นสุดรอบประเมิน',
            evidence_verified: 'ตรวจสอบหลักฐาน',
            mention_notification: 'มีคนกล่าวถึง',
            welcome: 'ต้อนรับผู้ใช้ใหม่',
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* Service Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        สถานะบริการอีเมล
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {emailServiceReady ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>บริการอีเมลพร้อมใช้งาน</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-yellow-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span>บริการอีเมลยังไม่พร้อมใช้งาน</span>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                                <p className="font-medium mb-2">ต้องการ Firebase Blaze Plan</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>อัปเกรดเป็น Blaze Plan (pay-as-you-go)</li>
                                    <li>ติดตั้ง Firebase Extension &quot;Trigger Email&quot;</li>
                                    <li>หรือ Deploy Cloud Function สำหรับส่งอีเมล</li>
                                </ul>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    อีเมลจะถูกจัดคิวไว้และส่งอัตโนมัติเมื่อบริการพร้อม
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        ตั้งค่าการแจ้งเตือน
                    </CardTitle>
                    <CardDescription>
                        กำหนดประเภทการแจ้งเตือนที่ต้องการส่งอีเมล
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>แจ้งเตือนกำหนดส่ง</Label>
                            <p className="text-sm text-muted-foreground">ส่งอีเมลเตือนก่อนรอบประเมินสิ้นสุด</p>
                        </div>
                        <Switch
                            checked={settings.deadlineReminders}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, deadlineReminders: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>แจ้งเตือนการอนุมัติ</Label>
                            <p className="text-sm text-muted-foreground">ส่งอีเมลเมื่อบัญชีได้รับการอนุมัติ/ปฏิเสธ</p>
                        </div>
                        <Switch
                            checked={settings.approvalNotifications}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, approvalNotifications: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>แจ้งเตือน @Mention</Label>
                            <p className="text-sm text-muted-foreground">ส่งอีเมลเมื่อมีคนกล่าวถึงในความคิดเห็น</p>
                        </div>
                        <Switch
                            checked={settings.mentionNotifications}
                            onCheckedChange={(checked) => setSettings(s => ({ ...s, mentionNotifications: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Manual Send */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-indigo-600" />
                        ส่งแจ้งเตือนด้วยตนเอง
                    </CardTitle>
                    <CardDescription>
                        ส่งอีเมลแจ้งเตือนไปยังผู้ใช้ทั้งหมด
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeCycle ? (
                        <div className="space-y-3">
                            <p className="text-sm">
                                รอบประเมินปัจจุบัน: <strong>{activeCycle.name}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                สิ้นสุด: {activeCycle.endDate.toDate().toLocaleDateString('th-TH')}
                            </p>
                            <Button
                                onClick={handleSendDeadlineReminders}
                                disabled={sendingReminders}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                {sendingReminders ? 'กำลังส่ง...' : 'ส่งแจ้งเตือนกำหนดส่ง'}
                            </Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">ไม่มีรอบประเมินที่กำลังดำเนินการ</p>
                    )}
                </CardContent>
            </Card>

            {/* Email Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        คิวอีเมล
                    </CardTitle>
                    <CardDescription>
                        อีเมลที่รอส่งและประวัติการส่ง (แสดง 20 รายการล่าสุด)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">กำลังโหลด...</p>
                    ) : pendingEmails.length === 0 ? (
                        <p className="text-muted-foreground">ไม่มีอีเมลในคิว</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ผู้รับ</TableHead>
                                    <TableHead>ประเภท</TableHead>
                                    <TableHead>หัวข้อ</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead>วันที่สร้าง</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingEmails.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{email.toName || '-'}</p>
                                                <p className="text-xs text-muted-foreground">{email.to}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getEmailTypeLabel(email.type)}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                                        <TableCell className="text-sm">
                                            {email.createdAt instanceof Timestamp
                                                ? email.createdAt.toDate().toLocaleString('th-TH')
                                                : '-'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
