'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { User } from '@/types/database';
import { getUserProfile, signInWithGoogle as signInWithGoogleAuth } from '@/lib/firebase/auth';
import { usePresenceStore } from '@/stores/presence-store';
import { logLogout } from '@/lib/activity-log/activity-logger';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { startPresenceTracking, stopPresenceTracking } = usePresenceStore();

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

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithGoogleAuth();
            if (result.isNew) {
                router.push('/profile?status=pending');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error signing in with Google', error);
            throw error;
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
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
