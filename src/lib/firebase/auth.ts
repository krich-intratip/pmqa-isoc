import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    AuthError
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/database';
import { Timestamp } from 'firebase/firestore';
import { logLogin } from '@/lib/activity-log/activity-logger';

const googleProvider = new GoogleAuthProvider();
// Calendar scope disabled - requires Google OAuth app verification
// To re-enable, complete verification: https://support.google.com/cloud/answer/13463009
// googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Custom error type for login errors
export interface LoginError {
    code: string;
    message: string;
    isPopupBlocked?: boolean;
}

/**
 * Process user after successful authentication
 * Used by both popup and redirect methods
 */
export const processAuthenticatedUser = async (firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}): Promise<{ user: User; isNew: boolean }> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new pending user
        const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'Unknown',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'read_only',
            status: 'pending',
            permissions: [],
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            lastLoginAt: serverTimestamp() as Timestamp,
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
            }
        }

        return { user: userData, isNew: false };
    }
};

/**
 * Check for redirect result (call this on app load)
 */
export const checkRedirectResult = async (): Promise<{ user: User; isNew: boolean } | null> => {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            return await processAuthenticatedUser(result.user);
        }
        return null;
    } catch (error) {
        console.error('Error getting redirect result:', error);
        return null;
    }
};

/**
 * Sign in with Google - uses popup for immediate response
 * Falls back to redirect if popup is blocked
 */
export const signInWithGoogle = async (): Promise<{ user: User; isNew: boolean } | null> => {
    try {
        console.log('Starting Google Sign-In with popup...');
        const result = await signInWithPopup(auth, googleProvider);
        return await processAuthenticatedUser(result.user);
    } catch (error) {
        const authError = error as AuthError;
        console.error('Popup sign-in failed:', authError.code);

        // If popup blocked or closed, fall back to redirect
        if (authError.code === 'auth/popup-blocked' ||
            authError.code === 'auth/popup-closed-by-user' ||
            authError.code === 'auth/cancelled-popup-request') {
            console.log('Popup failed, falling back to redirect...');
            await signInWithRedirect(auth, googleProvider);
            return null;
        }

        throw error;
    }
};

/**
 * Sign in with Google using popup (alternative method)
 * May not work on all browsers/devices
 */
export const signInWithGooglePopup = async (): Promise<{ user: User; isNew: boolean }> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return await processAuthenticatedUser(result.user);
    } catch (error) {
        const authError = error as AuthError;
        console.error('Popup sign-in failed:', authError.code, authError.message);

        // Provide specific error messages
        if (authError.code === 'auth/popup-closed-by-user') {
            throw {
                code: authError.code,
                message: 'หน้าต่าง Login ถูกปิด กรุณาลองใหม่หรือใช้ปุ่ม Redirect',
                isPopupBlocked: false
            } as LoginError;
        } else if (authError.code === 'auth/popup-blocked') {
            throw {
                code: authError.code,
                message: 'Popup ถูกบล็อก กรุณาอนุญาต Popup หรือใช้ปุ่ม Redirect',
                isPopupBlocked: true
            } as LoginError;
        }

        throw error;
    }
};

/**
 * Sign in with redirect directly (for mobile or known popup-blocked browsers)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
    await signInWithRedirect(auth, googleProvider);
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
