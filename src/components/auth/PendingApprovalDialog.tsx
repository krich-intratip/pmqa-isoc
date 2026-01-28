'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Mail, LogOut } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

interface PendingApprovalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail?: string;
    isNewRegistration?: boolean;
}

export function PendingApprovalDialog({
    open,
    onOpenChange,
    userEmail,
    isNewRegistration = false,
}: PendingApprovalDialogProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/auth/login');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        {isNewRegistration ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        ) : (
                            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">
                        {isNewRegistration
                            ? 'ลงทะเบียนสำเร็จ!'
                            : 'รอการอนุมัติ'}
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-3 pt-2">
                        {isNewRegistration ? (
                            <>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    ระบบได้รับข้อมูลการลงทะเบียนของท่านเรียบร้อยแล้ว
                                </p>
                                <p>
                                    กรุณารอการอนุมัติจากผู้ดูแลระบบ
                                    <br />
                                    ระบบจะแจ้งผลการอนุมัติผ่านอีเมล
                                </p>
                            </>
                        ) : (
                            <p>
                                บัญชีของท่านอยู่ในระหว่างรอการอนุมัติ
                                <br />
                                กรุณารอการตรวจสอบจากผู้ดูแลระบบ
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>อีเมลที่ลงทะเบียน: <strong>{userEmail}</strong></span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">ระหว่างรอการอนุมัติ ท่านสามารถ:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>เข้าดูหน้าคู่มือการใช้งาน</li>
                            <li>เข้าดูหน้าเกี่ยวกับระบบ (About)</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            onOpenChange(false);
                            router.push('/help');
                        }}
                    >
                        ไปที่หน้าคู่มือ
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        ออกจากระบบ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
