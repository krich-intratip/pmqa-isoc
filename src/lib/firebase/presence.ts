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
    console.log('[Presence] Creating subscription to online users...');
    const presenceQuery = query(
        collection(db, 'presence'),
        where('isOnline', '==', true)
    );

    const unsubscribe = onSnapshot(
        presenceQuery,
        (snapshot) => {
            console.log('[Presence] Snapshot received, size:', snapshot.size, 'docs');
            const onlineUsers: UserPresence[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log('[Presence] Processing doc:', doc.id, 'data:', {
                    userId: data.userId,
                    displayName: data.displayName,
                    isOnline: data.isOnline,
                    lastActivity: data.lastActivity ? 'exists' : 'null'
                });
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

            console.log('[Presence] Snapshot processed:', onlineUsers.length, 'online users');
            console.log('[Presence] Users list:', onlineUsers.map(u => u.displayName));
            callback(onlineUsers);
        },
        (error) => {
            console.error('[Presence] Error subscribing to online users:', error);
            console.error('[Presence] Error code:', error.code);
            console.error('[Presence] Error message:', error.message);
            callback([]); // Return empty array on error
        }
    );

    console.log('[Presence] Subscription created, returning unsubscribe function');
    return unsubscribe;
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
    // Set user online immediately (fire and forget, but log errors)
    setUserOnline(userId, userData).catch((error) => {
        console.error('[Presence] Error setting user online:', error);
    });

    // Update activity every 30 seconds
    const activityInterval = setInterval(() => {
        updateUserActivity(userId).catch((error) => {
            console.error('[Presence] Error updating user activity:', error);
        });
    }, 30000);

    // Set offline on beforeunload
    const handleBeforeUnload = () => {
        // Use sendBeacon for reliable offline detection
        setUserOffline(userId).catch((error) => {
            console.error('[Presence] Error setting user offline:', error);
        });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set offline on visibility change (tab closed/hidden)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            setUserOffline(userId).catch((error) => {
                console.error('[Presence] Error setting user offline:', error);
            });
        } else {
            setUserOnline(userId, userData).catch((error) => {
                console.error('[Presence] Error setting user online:', error);
            });
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
        clearInterval(activityInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setUserOffline(userId).catch((error) => {
            console.error('[Presence] Error setting user offline on cleanup:', error);
        });
    };
}
