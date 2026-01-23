'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

export function NotificationBell() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        notifications,
        unreadCount,
        subscribeToNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToNotifications(user.uid);
            return () => unsubscribe();
        }
    }, [user?.uid, subscribeToNotifications]);

    const handleNotificationClick = async (notificationId: string, link?: string) => {
        await markAsRead(notificationId);
        if (link) {
            setOpen(false);
            router.push(link);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (user?.uid) {
            await markAllAsRead(user.uid);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'approval':
                return 'bg-emerald-100 text-emerald-700';
            case 'rejection':
                return 'bg-red-100 text-red-700';
            case 'reminder':
                return 'bg-amber-100 text-amber-700';
            case 'evidence':
                return 'bg-blue-100 text-blue-700';
            case 'cycle':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'approval':
                return 'อนุมัติ';
            case 'rejection':
                return 'ปฏิเสธ';
            case 'reminder':
                return 'แจ้งเตือน';
            case 'evidence':
                return 'หลักฐาน';
            case 'cycle':
                return 'รอบประเมิน';
            default:
                return 'ระบบ';
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">การแจ้งเตือน</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            อ่านทั้งหมด
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            ไม่มีการแจ้งเตือน
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification.id, notification.link || undefined)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] px-1.5 py-0 ${getTypeColor(notification.type)}`}
                                                >
                                                    {getTypeLabel(notification.type)}
                                                </Badge>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="font-medium text-sm truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {notification.createdAt?.toDate
                                                    ? formatDistanceToNow(notification.createdAt.toDate(), {
                                                        addSuffix: true,
                                                        locale: th
                                                    })
                                                    : ''}
                                            </p>
                                        </div>
                                        {notification.link && (
                                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 10 && (
                    <div className="px-4 py-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                                setOpen(false);
                                // Can navigate to full notifications page if needed
                            }}
                        >
                            ดูทั้งหมด ({notifications.length})
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
