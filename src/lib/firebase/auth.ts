import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Unit } from '@/types/database';
import { logLogin, logLogout } from '@/lib/activity-log/activity-logger';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new pending user
            const newUser: User = {
                uid: user.uid,
                email: user.email!,
                displayName: user.displayName || 'Unknown',
                photoURL: user.photoURL || undefined,
                role: 'read_only', // Default until approved? Or just no role?
                status: 'pending',
                permissions: [],
                createdAt: serverTimestamp() as any,
                updatedAt: serverTimestamp() as any,
                lastLoginAt: serverTimestamp() as any,
                isActive: true
            };

            await setDoc(userRef, newUser);
            return { user: newUser, isNew: true };
        } else {
            // Update last login
            await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
            const userData = userSnap.data() as User;

            // Log login activity (only for approved users)
            if (userData.status === 'approved') {
                try {
                    await logLogin(userData);
                } catch (error) {
                    console.error('Failed to log login activity:', error);
                    // Don't block login if logging fails
                }
            }

            return { user: userData, isNew: false };
        }
    } catch (error) {
        console.error('Error signing in with Google', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out', error);
    }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as User;
    }
    return null;
};
