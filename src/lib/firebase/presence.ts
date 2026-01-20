/**
 * Presence Tracking System
 * Track online/offline status of users using Firestore
 */

import { db } from './config';
import { doc, setDoc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface UserPresence {
    userId: string;
    displayName: string;
    email: string;
    role: string;
    unitName?: string;
    unitCategory?: string;
    isOnline: boolean;
    lastSeen: Timestamp | null;
    lastActivity: Timestamp | null;
}

/**
 * Set user as online
 */
export async function setUserOnline(
    userId: string,
    userData: {
        displayName: string;
        email: string;
        role: string;
        unitName?: string;
        unitCategory?: string;
    }
): Promise<void> {
    const presenceRef = doc(db, 'presence', userId);

    await setDoc(presenceRef, {
        userId,
        displayName: userData.displayName,
        email: userData.email,
        role: userData.role,
        unitName: userData.unitName || '',
        unitCategory: userData.unitCategory || '',
        isOnline: true,
        lastSeen: serverTimestamp(),
        lastActivity: serverTimestamp(),
    });
}

/**
 * Set user as offline
 */
export async function setUserOffline(userId: string): Promise<void> {
    const presenceRef = doc(db, 'presence', userId);

    await updateDoc(presenceRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
    });
}

/**
 * Update user's last activity timestamp
 */
export async function updateUserActivity(userId: string): Promise<void> {
    const presenceRef = doc(db, 'presence', userId);

    await updateDoc(presenceRef, {
        lastActivity: serverTimestamp(),
    });
}

/**
 * Subscribe to online users (real-time)
 */
export function subscribeToOnlineUsers(
    callback: (users: UserPresence[]) => void
): () => void {
    const presenceQuery = query(
        collection(db, 'presence'),
        where('isOnline', '==', true)
    );

    return onSnapshot(presenceQuery, (snapshot) => {
        const onlineUsers: UserPresence[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            onlineUsers.push({
                userId: data.userId,
                displayName: data.displayName,
                email: data.email,
                role: data.role,
                unitName: data.unitName,
                unitCategory: data.unitCategory,
                isOnline: data.isOnline,
                lastSeen: data.lastSeen,
                lastActivity: data.lastActivity,
            });
        });

        callback(onlineUsers);
    });
}

/**
 * Get all users with presence data (including offline)
 */
export async function getAllUsersPresence(): Promise<UserPresence[]> {
    const presenceQuery = query(collection(db, 'presence'));
    const snapshot = await getDocs(presenceQuery);

    const users: UserPresence[] = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
            userId: data.userId,
            displayName: data.displayName,
            email: data.email,
            role: data.role,
            unitName: data.unitName,
            unitCategory: data.unitCategory,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
            lastActivity: data.lastActivity,
        });
    });

    return users;
}

/**
 * Initialize presence tracking for a user
 * Sets up automatic online/offline detection
 */
export function initializePresenceTracking(
    userId: string,
    userData: {
        displayName: string;
        email: string;
        role: string;
        unitName?: string;
        unitCategory?: string;
    }
): () => void {
    // Set user online immediately
    setUserOnline(userId, userData);

    // Update activity every 30 seconds
    const activityInterval = setInterval(() => {
        updateUserActivity(userId);
    }, 30000);

    // Set offline on beforeunload
    const handleBeforeUnload = () => {
        setUserOffline(userId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set offline on visibility change (tab closed/hidden)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            setUserOffline(userId);
        } else {
            setUserOnline(userId, userData);
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
        clearInterval(activityInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setUserOffline(userId);
    };
}
