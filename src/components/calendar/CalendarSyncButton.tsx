'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Loader2, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { AssessmentCycle } from '@/types/database';
import { getGoogleAccessToken, syncCycleToCalendar } from '@/lib/google/calendar-helper';
import { toast } from 'sonner';

interface CalendarSyncButtonProps {
    cycle: AssessmentCycle;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function CalendarSyncButton({
    cycle,
    variant = 'outline',
    size = 'sm',
}: CalendarSyncButtonProps) {
    const [open, setOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        eventsCreated: number;
        errors: string[];
    } | null>(null);

    const handleSync = async () => {
        setSyncing(true);
        setResult(null);

        try {
            // Get Google access token (will show popup for consent)
            const accessToken = await getGoogleAccessToken();

            if (!accessToken) {
                toast.error('ไม่สามารถเชื่อมต่อ Google Calendar ได้');
                setSyncing(false);
                return;
            }

            // Sync cycle to calendar
            const syncResult = await syncCycleToCalendar(accessToken, cycle);
            setResult(syncResult);

            if (syncResult.success) {
                toast.success(`เพิ่ม ${syncResult.eventsCreated} รายการใน Calendar แล้ว`);
            } else {
                toast.error('เกิดข้อผิดพลาดบางส่วน');
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('เกิดข้อผิดพลาดในการ sync');
            setResult({
                success: false,
                eventsCreated: 0,
                errors: ['Unexpected error occurred'],
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setResult(null);
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={() => setOpen(true)}
                className="gap-2"
            >
                <Calendar className="h-4 w-4" />
                Sync Calendar
            </Button>

            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            Sync ไปยัง Google Calendar
                        </DialogTitle>
                        <DialogDescription>
                            เพิ่มวันเริ่มต้นและวันสิ้นสุดของรอบประเมินไปยัง Google Calendar พร้อมการแจ้งเตือน
                        </DialogDescription>
                    </DialogHeader>

                    {!result ? (
                        <div className="py-6">
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <h4 className="font-medium text-slate-900">{cycle.name}</h4>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>
                                        🟢 เริ่ม:{' '}
                                        {cycle.startDate.toDate().toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p>
                                        🔴 สิ้นสุด:{' '}
                                        {cycle.endDate.toDate().toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                    📌 จะสร้าง 2 events พร้อมแจ้งเตือนล่วงหน้า 7, 3, 1 วัน
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6">
                            {result.success ? (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-lg font-medium text-green-700">
                                        Sync สำเร็จ!
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        เพิ่ม {result.eventsCreated} รายการใน Google Calendar แล้ว
                                    </p>
                                    <a
                                        href="https://calendar.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                                    >
                                        เปิด Google Calendar
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <p className="text-lg font-medium text-red-700">
                                        เกิดข้อผิดพลาด
                                    </p>
                                    <div className="text-sm text-slate-600">
                                        {result.errors.map((err, i) => (
                                            <p key={i}>{err}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {!result ? (
                            <>
                                <Button variant="outline" onClick={handleClose}>
                                    ยกเลิก
                                </Button>
                                <Button onClick={handleSync} disabled={syncing}>
                                    {syncing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            กำลัง Sync...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Sync Calendar
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleClose}>ปิด</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
