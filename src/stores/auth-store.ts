import { create } from 'zustand';
import { User } from '@/types/database';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '@/lib/firebase/auth';

interface AuthState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch full profile from Firestore
                    const profile = await getUserProfile(firebaseUser.uid);
                    if (profile) {
                        set({ user: profile, loading: false });
                    } else {
                        // Firebase user exists but no Firestore profile yet
                        // This happens when user just signed up but profile creation failed
                        // Set user as null to trigger registration flow
                        console.warn('Firebase user exists but no Firestore profile found:', firebaseUser.uid);
                        set({ user: null, loading: false });
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    set({ user: null, loading: false });
                }
            } else {
                set({ user: null, loading: false });
            }
        });
        return unsubscribe;
    },
}));
