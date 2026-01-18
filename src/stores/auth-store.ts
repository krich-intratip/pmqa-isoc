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
                // Fetch full profile from Firestore
                const profile = await getUserProfile(firebaseUser.uid);
                if (profile) {
                    set({ user: profile, loading: false });
                } else {
                    // Fallback if profile doesn't exist yet (e.g. specialized creation flow not finished)
                    set({ loading: false }); // User might be logged in via Firebase but not in DB yet
                }
            } else {
                set({ user: null, loading: false });
            }
        });
        return unsubscribe;
    },
}));
