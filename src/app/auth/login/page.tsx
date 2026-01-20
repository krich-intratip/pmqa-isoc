'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { APP_VERSION } from '@/config/version';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { user, isNew } = await signInWithGoogle();

            if (user.status === 'pending') {
                if (isNew || !user.requestDetails) {
                    // Redirect to register/request page if pending and new (or missing details)
                    router.push('/auth/register');
                    toast.info('กรุณากรอกข้อมูลเพื่อขอสิทธิ์ใช้งาน');
                } else {
                    // Pending but submitted request -> wait approval
                    // Maybe redirect to a specific 'pending approval' status page?
                    // For now, let them go to register page to check status or edit?
                    // Or dashboard with limited view?
                    // Logic says: Register page can handle "You have already requested" state.
                    router.push('/auth/register');
                }
            } else if (user.status === 'approved' || user.role === 'super_admin') {
                router.push('/dashboard');
                toast.success(`ยินดีต้อนรับ ${user.displayName}`);
            } else if (user.status === 'rejected') {
                toast.error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
            } else {
                // Fallback
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            const err = error as { code?: string };
            const errorMessage = err?.code === 'auth/popup-closed-by-user'
                ? 'คุณปิด popup ก่อนเข้าสู่ระบบ'
                : err?.code === 'auth/unauthorized-domain'
                    ? 'Domain ไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ'
                    : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
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
        </div>
    );
}
