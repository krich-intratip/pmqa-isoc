'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { ActivityLog, ActivityAction, ActivityResourceType, User } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth/role-helper';
import { Activity, Search, Download, Filter, Calendar } from 'lucide-react';
import {
    getActivityLogs,
    exportActivityLogsToCSV,
    getActionLabel,
    getResourceTypeLabel,
    ActivityLogQueryOptions,
} from '@/lib/activity-log/activity-helper';

export default function ActivityLogPage() {
    const { user } = useAuthStore();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('all');
    const [filterResourceType, setFilterResourceType] = useState<string>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const options: ActivityLogQueryOptions = {
                pageSize: 1000, // Fetch large batch, filter client-side
                sortBy: 'timestamp',
                sortOrder: 'desc',
            };

            if (filterAction !== 'all') {
                options.action = filterAction as ActivityAction;
            }

            if (filterResourceType !== 'all') {
                options.resourceType = filterResourceType as ActivityResourceType;
            }

            if (filterDateFrom) {
                options.startDate = new Date(filterDateFrom);
            }

            if (filterDateTo) {
                const endDate = new Date(filterDateTo);
                endDate.setHours(23, 59, 59, 999); // End of day
                options.endDate = endDate;
            }

            const result = await getActivityLogs(options);
            setLogs(result.logs);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            toast.error('ไม่สามารถดึงข้อมูล Activity Log ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN].includes(user.role)) {
            fetchLogs();
        }
    }, [user, filterAction, filterResourceType, filterDateFrom, filterDateTo]);

    // Client-side filtering and pagination
    useEffect(() => {
        let result = [...logs];

        // Search by keyword
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(
                (log) =>
                    log.userName?.toLowerCase().includes(lowerSearch) ||
                    log.userEmail?.toLowerCase().includes(lowerSearch) ||
                    log.resourceName?.toLowerCase().includes(lowerSearch) ||
                    log.unitName?.toLowerCase().includes(lowerSearch) ||
                    log.details?.description?.toLowerCase().includes(lowerSearch)
            );
        }

        // Calculate pagination
        const totalResults = result.length;
        setTotalPages(Math.ceil(totalResults / pageSize));

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        result = result.slice(startIndex, endIndex);

        setFilteredLogs(result);
    }, [searchTerm, logs, page, pageSize]);

    const handleExport = () => {
        const csvContent = exportActivityLogsToCSV(filteredLogs);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast.success('ส่งออกข้อมูลเรียบร้อยแล้ว');
    };

    const getActionBadge = (action: ActivityAction) => {
        const colorMap: Record<ActivityAction, string> = {
            login: 'bg-blue-100 text-blue-800',
            logout: 'bg-gray-100 text-gray-800',
            create: 'bg-green-100 text-green-800',
            update: 'bg-yellow-100 text-yellow-800',
            delete: 'bg-red-100 text-red-800',
            upload: 'bg-purple-100 text-purple-800',
            download: 'bg-indigo-100 text-indigo-800',
            view: 'bg-teal-100 text-teal-800',
            approve: 'bg-green-100 text-green-800',
            reject: 'bg-red-100 text-red-800',
            enable: 'bg-green-100 text-green-800',
            disable: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge className={colorMap[action] || 'bg-gray-100 text-gray-800'}>
                {getActionLabel(action)}
            </Badge>
        );
    };

    const getResourceTypeBadge = (resourceType: ActivityResourceType) => {
        return <Badge variant="outline">{getResourceTypeLabel(resourceType)}</Badge>;
    };

    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return '-';
        return timestamp.toDate().toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN]}>
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-600" />
                                    Activity Log
                                </CardTitle>
                                <CardDescription>
                                    ประวัติการใช้งานและกิจกรรมของผู้ใช้ทั้งหมดในระบบ
                                </CardDescription>
                            </div>
                            <Button onClick={handleExport} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                ส่งออก CSV
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="space-y-4 mt-6">
                            {/* Search */}
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ค้นหาชื่อผู้ใช้, อีเมล, ชื่อข้อมูล..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Select value={filterAction} onValueChange={setFilterAction}>
                                    <SelectTrigger>
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="การกระทำ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกการกระทำ</SelectItem>
                                        <SelectItem value="login">เข้าสู่ระบบ</SelectItem>
                                        <SelectItem value="logout">ออกจากระบบ</SelectItem>
                                        <SelectItem value="create">สร้าง</SelectItem>
                                        <SelectItem value="update">แก้ไข</SelectItem>
                                        <SelectItem value="delete">ลบ</SelectItem>
                                        <SelectItem value="upload">อัปโหลด</SelectItem>
                                        <SelectItem value="download">ดาวน์โหลด</SelectItem>
                                        <SelectItem value="approve">อนุมัติ</SelectItem>
                                        <SelectItem value="reject">ปฏิเสธ</SelectItem>
                                        <SelectItem value="enable">เปิดใช้งาน</SelectItem>
                                        <SelectItem value="disable">ปิดใช้งาน</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterResourceType} onValueChange={setFilterResourceType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ประเภทข้อมูล" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">ทุกประเภท</SelectItem>
                                        <SelectItem value="user">ผู้ใช้งาน</SelectItem>
                                        <SelectItem value="cycle">รอบการประเมิน</SelectItem>
                                        <SelectItem value="evidence">หลักฐาน</SelectItem>
                                        <SelectItem value="unit">หน่วยงาน</SelectItem>
                                        <SelectItem value="file">ไฟล์</SelectItem>
                                        <SelectItem value="system">ระบบ</SelectItem>
                                        <SelectItem value="auth">การยืนยันตัวตน</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div>
                                    <Input
                                        type="date"
                                        placeholder="วันที่เริ่มต้น"
                                        value={filterDateFrom}
                                        onChange={(e) => setFilterDateFrom(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Input
                                        type="date"
                                        placeholder="วันที่สิ้นสุด"
                                        value={filterDateTo}
                                        onChange={(e) => setFilterDateTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span>
                                    ทั้งหมด: <strong className="text-foreground">{logs.length}</strong> รายการ
                                </span>
                                <span>
                                    แสดง:{' '}
                                    <strong className="text-foreground">{filteredLogs.length}</strong>{' '}
                                    รายการ
                                </span>
                                {totalPages > 1 && (
                                    <span>
                                        หน้า: <strong className="text-foreground">{page}</strong> /{' '}
                                        {totalPages}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">กำลังโหลด...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                ไม่พบข้อมูล Activity Log
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">วันที่/เวลา</TableHead>
                                            <TableHead>ผู้ใช้งาน</TableHead>
                                            <TableHead>การกระทำ</TableHead>
                                            <TableHead>ประเภทข้อมูล</TableHead>
                                            <TableHead>ชื่อข้อมูล</TableHead>
                                            <TableHead>รายละเอียด</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatTimestamp(log.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {log.userName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {log.userEmail}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getActionBadge(log.action)}</TableCell>
                                                <TableCell>
                                                    {getResourceTypeBadge(log.resourceType)}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {log.resourceName || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                    {log.details?.description || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                        >
                                            ก่อนหน้า
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            หน้า {page} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                        >
                                            ถัดไป
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
