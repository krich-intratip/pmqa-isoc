'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { signInWithGoogleRedirect } from '@/lib/firebase/auth';

export default function LoginPage() {
    const { signInWithGoogle, loading, authError, clearAuthError } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        clearAuthError();
        try {
            await signInWithGoogle();
        } catch {
            // Error is handled by AuthContext
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleRedirectSignIn = async () => {
        setIsSigningIn(true);
        clearAuthError();
        try {
            await signInWithGoogleRedirect();
        } catch {
            setIsSigningIn(false);
        }
    };

    const isLoading = loading || isSigningIn;

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
                    <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground text-center">
                        กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อเริ่มการประเมินและบันทึกข้อมูล
                    </div>

                    {authError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {/* Main login button */}
                    <Button
                        className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
                        onClick={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        ) : (
                            <Image
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google Logo"
                                width={24}
                                height={24}
                                className="mr-3 bg-white rounded-full p-0.5"
                            />
                        )}
                        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                    </Button>

                    {/* Fallback button for popup-blocked browsers */}
                    <Button
                        variant="outline"
                        className="w-full h-10 text-sm"
                        onClick={handleRedirectSignIn}
                        disabled={isLoading}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        เข้าสู่ระบบแบบ Redirect (หาก Popup ไม่ทำงาน)
                    </Button>

                    {/* Help text */}
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        หาก Popup ถูกบล็อก ให้อนุญาต Popup สำหรับเว็บไซต์นี้ หรือใช้ปุ่ม Redirect
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
