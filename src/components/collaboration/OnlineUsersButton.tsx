'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { rtdb } from '@/lib/firebase/config';
import { ref, onValue, set, onDisconnect, remove } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Users, Circle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canManageUsers } from '@/lib/auth/role-helper';

interface ActiveUser {
    uid: string;
    displayName: string;
    photoURL?: string;
    lastActive: number;
    sectionId: string;
    role?: string;
    email?: string;
}

interface OnlineUsersButtonProps {
    sectionId?: string;
    className?: string;
}

export default function OnlineUsersButton({ sectionId = 'global-dashboard', className }: OnlineUsersButtonProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const isAdmin = user && canManageUsers(user.role);

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
            email: user.email || '',
            role: user.role || 'viewer',
            lastActive: Date.now(),
            sectionId: sectionId
        });

        // 2. Remove me when I disconnect
        onDisconnect(myRef).remove();

        // 3. Update lastActive every 30 seconds
        const activityInterval = setInterval(() => {
            set(myRef, {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                email: user.email || '',
                role: user.role || 'viewer',
                lastActive: Date.now(),
                sectionId: sectionId
            });
        }, 30000);

        // 4. Listen for changes in this section
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const users = Object.values(data) as ActiveUser[];
                // Filter out stale users (> 5 min inactive)
                const now = Date.now();
                const active = users.filter(u => now - u.lastActive < 5 * 60 * 1000);
                setActiveUsers(active);
            } else {
                setActiveUsers([]);
            }
        });

        // Cleanup
        return () => {
            clearInterval(activityInterval);
            remove(myRef);
            unsubscribe();
        };
    }, [user, sectionId]);

    const handleUserClick = (targetUser: ActiveUser) => {
        if (isAdmin && targetUser.uid !== user?.uid) {
            // Navigate to user management with filter
            router.push(`/admin/users?search=${encodeURIComponent(targetUser.email || targetUser.displayName)}`);
            setIsOpen(false);
        }
    };

    const formatLastActive = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'เมื่อสักครู่';
        if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
        return `${Math.floor(minutes / 60)} ชม.ที่แล้ว`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {activeUsers.length === 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 h-8 rounded-full",
                            "bg-muted/50 hover:bg-muted",
                            "border border-border",
                            className
                        )}
                    >
                        <Circle className="h-2 w-2 text-muted-foreground" />
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">0</span>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 h-8 rounded-full",
                            "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/50",
                            "border border-green-200 dark:border-green-800",
                            className
                        )}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                            {activeUsers.length}
                        </span>
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            ผู้ใช้ออนไลน์
                        </h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {activeUsers.length} คน
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        ผู้ใช้ที่กำลังใช้งานระบบอยู่ในขณะนี้
                    </p>
                </div>
                <ScrollArea className="max-h-[300px]">
                    <div className="p-2 space-y-1">
                        {activeUsers.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">ไม่มีผู้ใช้ออนไลน์ในขณะนี้</p>
                                <p className="text-xs mt-1">กรุณารอสักครู่...</p>
                            </div>
                        ) : (
                            activeUsers.map((u) => {
                                const isMe = u.uid === user?.uid;
                                const canClick = isAdmin && !isMe;

                                return (
                                    <div
                                        key={u.uid}
                                        onClick={() => canClick && handleUserClick(u)}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                            canClick
                                                ? "cursor-pointer hover:bg-muted"
                                                : "cursor-default",
                                            isMe && "bg-primary/5"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={u.photoURL} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                    {u.displayName?.substring(0, 1)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium truncate">
                                                    {u.displayName}
                                                </span>
                                                {isMe && (
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                                        คุณ
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {formatLastActive(u.lastActive)}
                                            </p>
                                        </div>
                                        {canClick && (
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
                {isAdmin && (
                    <div className="p-2 border-t bg-muted/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                                router.push('/admin/users');
                                setIsOpen(false);
                            }}
                        >
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            จัดการผู้ใช้ทั้งหมด
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
