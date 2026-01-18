'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const { signInWithGoogle, loading } = useAuth();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">เข้าสู่ระบบ</CardTitle>
                    <CardDescription>
                        ระบบประเมินผลการพัฒนาคุณภาพการบริหารจัดการภาครัฐ 4.0 (PMQA 4.0)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 text-center">
                        กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อเริ่มการประเมินและบันทึกข้อมูล
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
                        onClick={signInWithGoogle}
                        disabled={loading}
                    >
                        <Image
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google Logo"
                            width={24}
                            height={24}
                            className="mr-3 bg-white rounded-full p-0.5"
                        />
                        {loading ? 'กำลังโหลด...' : 'เข้าสู่ระบบด้วย Google'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
