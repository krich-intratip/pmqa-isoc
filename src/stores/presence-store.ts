/**
 * Presence Store
 * Manage online/offline users state
 */

import { create } from 'zustand';
import { UserPresence, subscribeToOnlineUsers, initializePresenceTracking } from '@/lib/firebase/presence';

interface PresenceStore {
    onlineUsers: UserPresence[];
    isLoading: boolean;
    isSidebarOpen: boolean;
    searchQuery: string;
    filterRole: string;
    filterUnit: string;

    // Actions
    setOnlineUsers: (users: UserPresence[]) => void;
    setIsLoading: (loading: boolean) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
    setFilterRole: (role: string) => void;
    setFilterUnit: (unit: string) => void;

    // Presence tracking
    startPresenceTracking: (userId: string, userData: {
        displayName: string;
        email: string;
        role: string;
        unitName?: string;
        unitCategory?: string;
    }) => void;
    stopPresenceTracking: () => void;

    // Filtered users
    getFilteredUsers: () => UserPresence[];
}

let unsubscribePresence: (() => void) | null = null;
let unsubscribeTracking: (() => void) | null = null;
let currentUserId: string | null = null;

export const usePresenceStore = create<PresenceStore>((set, get) => ({
    onlineUsers: [],
    isLoading: true,
    isSidebarOpen: true,
    searchQuery: '',
    filterRole: 'all',
    filterUnit: 'all',

    setOnlineUsers: (users) => set({ onlineUsers: users, isLoading: false }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterRole: (role) => set({ filterRole: role }),
    setFilterUnit: (unit) => set({ filterUnit: unit }),

    startPresenceTracking: (userId, userData) => {
        // Unsubscribe existing tracking if user changed
        if (currentUserId && currentUserId !== userId && unsubscribeTracking) {
            unsubscribeTracking();
            unsubscribeTracking = null;
        }

        // Always subscribe to online users
        if (unsubscribePresence) {
            unsubscribePresence();
            unsubscribePresence = null;
        }
        
        // Subscribe to presence - this gets all users active in last 5 minutes
        unsubscribePresence = subscribeToOnlineUsers((users) => {
            get().setOnlineUsers(users);
        });

        // Initialize presence tracking for current user
        if (!unsubscribeTracking || currentUserId !== userId) {
            if (unsubscribeTracking) {
                unsubscribeTracking();
            }
            unsubscribeTracking = initializePresenceTracking(userId, userData);
            currentUserId = userId;
        }
    },

    stopPresenceTracking: () => {
        if (unsubscribePresence) {
            unsubscribePresence();
            unsubscribePresence = null;
        }
        if (unsubscribeTracking) {
            unsubscribeTracking();
            unsubscribeTracking = null;
            currentUserId = null;
        }
    },

    getFilteredUsers: () => {
        const { onlineUsers, searchQuery, filterRole, filterUnit } = get();

        return onlineUsers.filter((user) => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Role filter
            const matchesRole = filterRole === 'all' || user.role === filterRole;

            // Unit filter
            const matchesUnit = filterUnit === 'all' || user.unitCategory === filterUnit;

            return matchesSearch && matchesRole && matchesUnit;
        });
    },
}));
