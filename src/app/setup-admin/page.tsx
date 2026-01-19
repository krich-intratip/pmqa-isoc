'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'krich.intratip@gmail.com';

export default function SetupAdminPage() {
    const [status, setStatus] = useState<'checking' | 'not_logged_in' | 'wrong_user' | 'ready' | 'setting_up' | 'done' | 'already_admin' | 'error'>('checking');
    const [message, setMessage] = useState('');
    const [userInfo, setUserInfo] = useState<{ uid: string; email: string; displayName: string } | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            // Wait for auth to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            const currentUser = auth.currentUser;

            if (!currentUser) {
                setStatus('not_logged_in');
                setMessage('กรุณา Login ด้วย Google ก่อน');
                return;
            }

            if (currentUser.email !== ADMIN_EMAIL) {
                setStatus('wrong_user');
                setMessage(`คุณ login ด้วย ${currentUser.email} ซึ่งไม่ใช่ admin email`);
                return;
            }

            setUserInfo({
                uid: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || ''
            });

            // Check if already admin
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'super_admin' && userData.status === 'approved') {
                    setStatus('already_admin');
                    setMessage('คุณเป็น Admin แล้ว!');
                    return;
                }
            }

            setStatus('ready');
            setMessage('พร้อมตั้งค่า Admin');
        };

        checkUser();
    }, []);

    const setupAdmin = async () => {
        if (!userInfo) return;

        setStatus('setting_up');
        setMessage('กำลังตั้งค่า Admin...');

        try {
            const userRef = doc(db, 'users', userInfo.uid);
            await setDoc(userRef, {
                uid: userInfo.uid,
                email: userInfo.email,
                displayName: userInfo.displayName || 'Krich Intratip',
                photoURL: auth.currentUser?.photoURL || '',
                role: 'super_admin',
                unitId: 'central',
                status: 'approved',
                permissions: [
                    'manage_users',
                    'approve_users',
                    'manage_units',
                    'manage_evidence',
                    'approve_evidence',
                    'manage_ai_config',
                    'view_all_data',
                    'export_data',
                    'manage_settings'
                ],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                isActive: true,
                metadata: {
                    position: 'System Administrator',
                    department: 'กอ.รมน.',
                    phone: ''
                }
            }, { merge: true });

            setStatus('done');
            setMessage('ตั้งค่า Admin สำเร็จ! กรุณา refresh หน้าเพื่อใช้งาน');
        } catch (error) {
            console.error('Setup admin error:', error);
            setStatus('error');
            setMessage(`เกิดข้อผิดพลาด: ${error}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-indigo-100 w-fit">
                        <Shield className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl">Setup Admin</CardTitle>
                    <CardDescription>ตั้งค่าผู้ดูแลระบบ PMQA 4.0</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Display */}
                    <div className={`p-4 rounded-lg ${status === 'done' || status === 'already_admin'
                            ? 'bg-green-50 border border-green-200'
                            : status === 'error' || status === 'wrong_user' || status === 'not_logged_in'
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-blue-50 border border-blue-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {(status === 'done' || status === 'already_admin') ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (status === 'error' || status === 'wrong_user' || status === 'not_logged_in') ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                                <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            )}
                            <span className={`font-medium ${status === 'done' || status === 'already_admin'
                                    ? 'text-green-800'
                                    : status === 'error' || status === 'wrong_user' || status === 'not_logged_in'
                                        ? 'text-red-800'
                                        : 'text-blue-800'
                                }`}>
                                {message}
                            </span>
                        </div>
                    </div>

                    {/* User Info */}
                    {userInfo && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-500">User Information</p>
                            <p className="font-medium">{userInfo.displayName}</p>
                            <p className="text-sm text-slate-600">{userInfo.email}</p>
                            <p className="text-xs text-slate-400 font-mono mt-1">UID: {userInfo.uid}</p>
                        </div>
                    )}

                    {/* Action Button */}
                    {status === 'ready' && (
                        <Button
                            onClick={setupAdmin}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            ตั้งค่าเป็น Super Admin
                        </Button>
                    )}

                    {status === 'not_logged_in' && (
                        <Button
                            onClick={() => window.location.href = '/auth/login'}
                            className="w-full"
                        >
                            ไปหน้า Login
                        </Button>
                    )}

                    {(status === 'done' || status === 'already_admin') && (
                        <Button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            ไปหน้า Dashboard
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
