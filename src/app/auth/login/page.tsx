'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { APP_VERSION } from '@/config/version';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user, loading, initialize } = useAuthStore();
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({ open: false, title: '', message: '' });

    // Initialize auth state
    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, [initialize]);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            if (user.status === 'approved' || user.role === 'super_admin') {
                router.replace('/dashboard');
            } else if (user.status === 'pending') {
                router.replace('/auth/register');
            }
        }
    }, [user, loading, router]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { user, isNew } = await signInWithGoogle();

            // Immediately redirect based on user status
            if (user.status === 'pending') {
                if (isNew || !user.requestDetails) {
                    toast.info('กรุณากรอกข้อมูลเพื่อขอสิทธิ์ใช้งาน');
                    router.replace('/auth/register');
                } else {
                    router.replace('/auth/register');
                }
            } else if (user.status === 'approved' || user.role === 'super_admin') {
                toast.success(`ยินดีต้อนรับ ${user.displayName}`);
                router.replace('/dashboard');
            } else if (user.status === 'rejected') {
                toast.error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
                setIsLoading(false);
            } else {
                // Fallback
                router.replace('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            const err = error as { code?: string; message?: string };

            // ตรวจสอบ error types ต่างๆ
            let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

            if (err?.code === 'auth/popup-closed-by-user') {
                errorMessage = 'คุณปิด popup ก่อนเข้าสู่ระบบ';
            } else if (err?.code === 'auth/unauthorized-domain') {
                errorMessage = 'Domain ไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ';
            } else if (err?.code === 'auth/popup-blocked') {
                errorMessage = 'Popup ถูกบล็อก กรุณาอนุญาต popup สำหรับเว็บไซต์นี้';
            } else if (
                err?.message?.includes('disallowed_useragent') ||
                err?.message?.includes('403') ||
                err?.code === 'auth/web-storage-unsupported'
            ) {
                // Error 403: disallowed_useragent - เปิดจาก WebView ใน LINE/Facebook/Instagram
                errorMessage = 'ไม่สามารถเข้าสู่ระบบผ่านแอปนี้ได้ กรุณาเปิดใน Chrome หรือ Safari';
                setErrorDialog({
                    open: true,
                    title: 'เข้าสู่ระบบไม่สำเร็จ',
                    message: errorMessage + '\n\nกดเมนู ⋮ แล้วเลือก "เปิดใน Chrome" หรือ "Open in Browser"',
                });
                setIsLoading(false);
                return; // Return early เพราะแสดง dialog แล้ว
            }

            // แสดง Error Dialog สำหรับ error อื่นๆ
            setErrorDialog({
                open: true,
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                message: errorMessage + '\n\nรายละเอียด: ' + (err?.message || 'ไม่ทราบสาเหตุ'),
            });
            setIsLoading(false);
        }
    };

    // Show loading if checking auth state or redirecting
    if (loading || (user && (user.status === 'approved' || user.status === 'pending'))) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">กำลังเข้าสู่ระบบ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-background/80 dark:bg-background/90 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-3xl font-bold text-white">QA</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        PMQA 4.0 Platform
                    </CardTitle>
                    <CardDescription className="text-gray-500 font-light">
                        ระบบบริหารจัดการการประเมินผลการปฏิบัติงาน <br /> กอ.รมน. ผ่านระบบเครือข่ายดิจิทัล
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground my-4">
                        เข้าสู่ระบบด้วยบัญชี Google ของท่าน
                    </div>
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-normal hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-slate-200"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-600" />
                        ) : (
                            <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                    </Button>

                    {/* คำแนะนำสำหรับผู้ใช้ที่เปิดจาก LINE/Facebook */}
                    <div className="text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-medium">หากเปิดจาก LINE หรือ Facebook</p>
                        <p className="mt-1 text-amber-500 dark:text-amber-500">
                            กรุณากด <span className="font-bold">⋮</span> แล้วเลือก &quot;เปิดใน Chrome&quot;
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground">
                    <p>
                        สำหรับเจ้าหน้าที่ กอ.รมน. ที่ได้รับอนุญาตเท่านั้น
                    </p>
                    <p className="opacity-50">
                        Version {APP_VERSION.version}
                    </p>
                </CardFooter>
            </Card>

            {/* Error Dialog */}
            <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center text-lg font-semibold">
                            {errorDialog.title}
                        </DialogTitle>
                        <DialogDescription className="text-center whitespace-pre-line pt-2">
                            {errorDialog.message}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}
