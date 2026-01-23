'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { rtdb } from '@/lib/firebase/config';
import { ref, onValue, set, onDisconnect, remove } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LivePresenceProps {
    sectionId: string; // e.g., "sar-edit-phase1" or "dashboard"
}

interface ActiveUser {
    uid: string;
    displayName: string;
    photoURL?: string;
    lastActive: number;
    sectionId: string;
}

export default function LivePresence({ sectionId }: LivePresenceProps) {
    const { user } = useAuthStore();
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

    useEffect(() => {
        if (!user || !rtdb) return;

        // Reference to the presence list for this section
        const presenceRef = ref(rtdb, `presence/${sectionId}`);
        // Reference to myself
        const myRef = ref(rtdb, `presence/${sectionId}/${user.uid}`);

        // 1. Set my status to online
        set(myRef, {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            lastActive: Date.now(),
            sectionId: sectionId
        });

        // 2. Remove me when I disconnect
        onDisconnect(myRef).remove();

        // 3. Listen for changes in this section
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const users = Object.values(data) as ActiveUser[];
                // Filter out stale users (> 5 min inactive) and myself (optional, but good to see myself too)
                const now = Date.now();
                const active = users.filter(u => now - u.lastActive < 5 * 60 * 1000);
                setActiveUsers(active);
            } else {
                setActiveUsers([]);
            }
        });

        // Cleanup: remove myself when component unmounts
        return () => {
            remove(myRef);
            unsubscribe();
        };
    }, [user, sectionId]);

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded-full border border-border shadow-sm">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline-block">Viewing:</span>
            <div className="flex -space-x-2">
                <TooltipProvider delayDuration={0}>
                    {activeUsers.map((u) => (
                        <Tooltip key={u.uid}>
                            <TooltipTrigger asChild>
                                <Avatar className="h-6 w-6 border-2 border-background ring-1 ring-border cursor-default">
                                    <AvatarImage src={u.photoURL} />
                                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-[10px] text-indigo-700 dark:text-indigo-400">
                                        {u.displayName?.substring(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {u.displayName} {u.uid === user?.uid && '(You)'}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
            {activeUsers.length > 3 && (
                <span className="text-xs text-muted-foreground ml-1">+{activeUsers.length - 3}</span>
            )}
        </div>
    );
}
