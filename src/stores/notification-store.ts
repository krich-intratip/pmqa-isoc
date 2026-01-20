import { create } from 'zustand';
import { db } from '@/lib/firebase/config';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    updateDoc,
    Timestamp,
    onSnapshot,
    writeBatch
} from 'firebase/firestore';
import type { Notification } from '@/types/database';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    // Actions
    fetchNotifications: (userId: string) => Promise<void>;
    subscribeToNotifications: (userId: string) => () => void;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: (userId: string) => Promise<void>;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async (userId: string) => {
        if (!userId) return;

        set({ loading: true, error: null });
        try {
            const notifQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const snapshot = await getDocs(notifQuery);
            const notifications: Notification[] = [];
            let unreadCount = 0;

            snapshot.forEach((doc) => {
                const data = doc.data() as Notification;
                notifications.push({ ...data, id: doc.id });
                if (!data.read) unreadCount++;
            });

            set({ notifications, unreadCount, loading: false });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ error: 'Failed to fetch notifications', loading: false });
        }
    },

    subscribeToNotifications: (userId: string) => {
        if (!userId) return () => { };

        const notifQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
            const notifications: Notification[] = [];
            let unreadCount = 0;

            snapshot.forEach((doc) => {
                const data = doc.data() as Notification;
                notifications.push({ ...data, id: doc.id });
                if (!data.read) unreadCount++;
            });

            set({ notifications, unreadCount });
        }, (error) => {
            console.error('Error subscribing to notifications:', error);
        });

        return unsubscribe;
    },

    markAsRead: async (notificationId: string) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, {
                read: true,
                readAt: Timestamp.now()
            });

            // Update local state
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async (userId: string) => {
        try {
            const unreadNotifs = get().notifications.filter((n) => !n.read);
            if (unreadNotifs.length === 0) return;

            const batch = writeBatch(db);
            const now = Timestamp.now();

            unreadNotifs.forEach((notif) => {
                const notifRef = doc(db, 'notifications', notif.id);
                batch.update(notifRef, { read: true, readAt: now });
            });

            await batch.commit();

            // Update local state
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },

    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
    }
}));
