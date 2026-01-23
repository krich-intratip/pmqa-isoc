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
 * Subscribe to ALL presence documents (real-time)
 * We filter by lastActivity on the client side to avoid index issues
 * Users active within last 5 minutes are considered "online"
 */
export function subscribeToOnlineUsers(
    callback: (users: UserPresence[]) => void
): () => void {
    // Query ALL presence documents (no filter) to avoid index issues
    const presenceRef = collection(db, 'presence');

    const unsubscribe = onSnapshot(
        presenceRef,
        (snapshot) => {
            const now = Date.now();
            const FIVE_MINUTES = 5 * 60 * 1000;
            const onlineUsers: UserPresence[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                
                // Check if user was active in last 5 minutes
                let isActive = false;
                if (data.lastActivity) {
                    try {
                        const lastActivityTime = data.lastActivity.toDate().getTime();
                        isActive = (now - lastActivityTime) < FIVE_MINUTES;
                    } catch {
                        isActive = false;
                    }
                }

                if (isActive) {
                    onlineUsers.push({
                        userId: data.userId,
                        displayName: data.displayName,
                        email: data.email,
                        role: data.role,
                        unitName: data.unitName,
                        unitCategory: data.unitCategory,
                        isOnline: true, // Mark as online if active
                        lastSeen: data.lastSeen,
                        lastActivity: data.lastActivity,
                    });
                }
            });

            callback(onlineUsers);
        },
        (error) => {
            console.error('[Presence] Error:', error);
            callback([]);
        }
    );

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
 * Updates lastActivity every 30 seconds to indicate user is online
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
    setUserOnline(userId, userData).catch(() => {});

    // Update activity every 30 seconds to keep user "online"
    const activityInterval = setInterval(() => {
        updateUserActivity(userId).catch(() => {});
    }, 30000);

    // Cleanup function - only clear interval, don't set offline
    // User will naturally become "offline" after 5 minutes of inactivity
    return () => {
        clearInterval(activityInterval);
    };
}
