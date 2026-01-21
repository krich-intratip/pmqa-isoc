'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { usePresenceStore } from '@/stores/presence-store';
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
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface OnlineUsersButtonProps {
    className?: string;
}

export default function OnlineUsersButton({ className }: OnlineUsersButtonProps) {
    const { user } = useAuthStore();
    // Get online users directly from store - already filtered by lastActivity
    const activeUsers = usePresenceStore((state) => state.onlineUsers);
    const isLoading = usePresenceStore((state) => state.isLoading);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const isAdmin = user && canManageUsers(user.role);

    const handleUserClick = (targetUser: { userId: string; email: string; displayName: string }) => {
        if (isAdmin && targetUser.userId !== user?.uid) {
            router.push(`/admin/users?search=${encodeURIComponent(targetUser.email || targetUser.displayName)}`);
            setIsOpen(false);
        }
    };

    const formatLastActive = (ts: { toDate: () => Date } | null) => {
        if (!ts) return 'เมื่อสักครู่';
        try {
            return formatDistanceToNow(ts.toDate(), { addSuffix: true, locale: th });
        } catch {
            return 'เมื่อสักครู่';
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {isLoading ? (
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
                        <Circle className="h-2 w-2 text-muted-foreground animate-pulse" />
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">...</span>
                    </Button>
                ) : activeUsers.length === 0 ? (
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
                            const isMe = u.userId === user?.uid;
                            const canClick = isAdmin && !isMe;

                            return (
                                <div
                                    key={u.userId}
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
                                            <AvatarImage src={''} />
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
                                            {formatLastActive(u.lastActivity)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xxs">
                                                {u.role || 'viewer'}
                                            </Badge>
                                            {u.unitName && (
                                                <Badge variant="outline" className="text-xxs">
                                                    {u.unitName}
                                                </Badge>
                                            )}
                                        </div>
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
