'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { User } from '@/types/database';
import {
    getUserProfile,
    signInWithGoogle as signInWithGoogleAuth,
    checkRedirectResult,
    LoginError
} from '@/lib/firebase/auth';
import { usePresenceStore } from '@/stores/presence-store';
import { logLogout } from '@/lib/activity-log/activity-logger';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    authError: string | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [redirectChecked, setRedirectChecked] = useState(false);
    const router = useRouter();
    const { startPresenceTracking, stopPresenceTracking } = usePresenceStore();

    // Check for redirect result on mount (for redirect-based login)
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await checkRedirectResult();
                if (result) {
                    const authUser = result.user;
                    setUser(authUser);

                    // Redirect based on user status
                    if (authUser.status === 'pending') {
                        router.replace('/auth/register');
                    } else if (authUser.status === 'approved' || authUser.role === 'super_admin') {
                        router.replace('/dashboard');
                    } else if (authUser.status === 'rejected') {
                        // Stay on login page with error
                        setAuthError('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
                    } else {
                        router.replace('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Error handling redirect result:', error);
            } finally {
                setRedirectChecked(true);
            }
        };

        handleRedirectResult();
    }, [router]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch full profile from Firestore
                const profile = await getUserProfile(firebaseUser.uid);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Start real-time presence tracking globally (not only on Dashboard)
    useEffect(() => {
        if (user?.uid) {
            startPresenceTracking(user.uid, {
                displayName: user.displayName || 'ไม่ระบุชื่อ',
                email: user.email || '',
                role: user.role || 'viewer',
                unitName: '', // Will be populated by dashboard if needed
                unitCategory: '', // Will be populated by dashboard if needed
            });

            return () => {
                stopPresenceTracking();
            };
        }

        // If user is null, ensure presence tracking is stopped
        stopPresenceTracking();
    }, [user, startPresenceTracking, stopPresenceTracking]);

    const clearAuthError = useCallback(() => {
        setAuthError(null);
    }, []);

    const signInWithGoogle = async () => {
        setAuthError(null);
        setLoading(true);
        try {
            const result = await signInWithGoogleAuth();

            // If popup succeeded, handle the result
            if (result) {
                setUser(result.user);

                // Redirect based on user status
                if (result.user.status === 'pending') {
                    router.replace('/auth/register');
                } else if (result.user.status === 'approved' || result.user.role === 'super_admin') {
                    router.replace('/dashboard');
                } else if (result.user.status === 'rejected') {
                    setAuthError('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
                    setLoading(false);
                } else {
                    router.replace('/dashboard');
                }
            }
            // If result is null, redirect method was used - page will reload
        } catch (error) {
            setLoading(false);
            const loginError = error as LoginError;

            // User-friendly error messages
            let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';

            if (loginError.code === 'auth/network-request-failed') {
                errorMessage = 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ';
            } else if (loginError.code === 'auth/too-many-requests') {
                errorMessage = 'มีการพยายาม Login มากเกินไป กรุณารอสักครู่แล้วลองใหม่';
            }

            setAuthError(errorMessage);
            console.error('Error signing in with Google:', error);
        }
    };

    const logout = async () => {
        try {
            // Log logout activity before signing out
            if (user && user.status === 'approved') {
                try {
                    await logLogout(user);
                } catch (error) {
                    console.error('Failed to log logout activity:', error);
                    // Don't block logout if logging fails
                }
            }

            await signOut(auth);
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Error signing out', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, logout, clearAuthError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
