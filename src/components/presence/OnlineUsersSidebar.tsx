'use client';

/**
 * Online Users Sidebar Component
 * Shows real-time online users with search and filter capabilities
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { usePresenceStore } from '@/stores/presence-store';
import { Users, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface OnlineUsersSidebarProps {
    className?: string;
}

export function OnlineUsersSidebar({ className }: OnlineUsersSidebarProps) {
    const {
        isLoading,
        isSidebarOpen,
        searchQuery,
        filterRole,
        filterUnit,
        toggleSidebar,
        setSearchQuery,
        setFilterRole,
        setFilterUnit,
        getFilteredUsers,
    } = usePresenceStore();

    const [showFilters, setShowFilters] = useState(false);
    const filteredUsers = getFilteredUsers();

    // Get unique roles and units for filters
    const uniqueRoles = Array.from(new Set(filteredUsers.map(u => u.role))).filter(Boolean) as string[];
    const uniqueUnits = Array.from(new Set(filteredUsers.map(u => u.unitCategory))).filter((unit): unit is string => Boolean(unit));

    const formatLastSeen = (timestamp: any) => {
        if (!timestamp) return 'ไม่ทราบ';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return formatDistanceToNow(date, { locale: th, addSuffix: true });
        } catch {
            return 'ไม่ทราบ';
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'reviewer': return 'bg-blue-100 text-blue-700';
            case 'editor': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'admin': return 'ผู้ดูแลระบบ';
            case 'reviewer': return 'ผู้ตรวจสอบ';
            case 'editor': return 'ผู้แก้ไข';
            case 'viewer': return 'ผู้ชมเท่านั้น';
            default: return role;
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                    'fixed top-20 z-40 transition-all duration-300 shadow-lg hover:shadow-xl',
                    isSidebarOpen ? 'right-[320px]' : 'right-4'
                )}
                title={isSidebarOpen ? 'ซ่อนผู้ใช้ออนไลน์' : 'แสดงผู้ใช้ออนไลน์'}
            >
                {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {/* Sidebar */}
            <div
                className={cn(
                    'fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white border-l border-slate-200 shadow-xl z-30 transition-transform duration-300 ease-in-out',
                    'hidden lg:block',
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
                    className
                )}
            >
                <Card className="h-full border-0 rounded-none">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-green-600" />
                            ผู้ใช้ออนไลน์
                            {!isLoading && (
                                <Badge className="ml-auto bg-green-500">{filteredUsers.length}</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>ผู้ใช้งานที่ออนไลน์ในขณะนี้</CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อหรืออีเมล..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {showFilters ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
                        </Button>

                        {/* Filters */}
                        {showFilters && (
                            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                        บทบาท
                                    </label>
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="ทุกบทบาท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกบทบาท</SelectItem>
                                            {uniqueRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleDisplayName(role)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                        หน่วยงาน
                                    </label>
                                    <Select value={filterUnit} onValueChange={setFilterUnit}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="ทุกหน่วยงาน" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกหน่วยงาน</SelectItem>
                                            {uniqueUnits.map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(filterRole !== 'all' || filterUnit !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFilterRole('all');
                                            setFilterUnit('all');
                                        }}
                                        className="w-full text-xs"
                                    >
                                        ล้างตัวกรอง
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Users List */}
                        <ScrollArea className="h-[calc(100vh-22rem)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    {searchQuery || filterRole !== 'all' || filterUnit !== 'all'
                                        ? 'ไม่พบผู้ใช้ตามเงื่อนไขที่ค้นหา'
                                        : 'ไม่มีผู้ใช้ออนไลน์ในขณะนี้'}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.userId}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <UserAvatar
                                                displayName={user.displayName}
                                                email={user.email}
                                                isOnline={user.isOnline}
                                                size="md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {user.displayName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {user.email}
                                                </div>
                                                {user.unitName && (
                                                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {user.unitName}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Badge
                                                        className={cn('text-xs px-1.5 py-0', getRoleBadgeColor(user.role))}
                                                    >
                                                        {getRoleDisplayName(user.role)}
                                                    </Badge>
                                                    {user.lastActivity && (
                                                        <span className="text-xs text-muted-foreground">
                                                            · {formatLastSeen(user.lastActivity)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
