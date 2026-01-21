import { db } from '@/lib/firebase/config';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    Timestamp,
    QueryConstraint,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ActivityLog, ActivityAction, ActivityResourceType } from '@/types/database';

// ==================== Query Options ====================

export interface ActivityLogQueryOptions {
    // Pagination
    pageSize?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;

    // Filters
    userId?: string;
    unitId?: string;
    action?: ActivityAction;
    resourceType?: ActivityResourceType;
    resourceId?: string;

    // Date range
    startDate?: Date;
    endDate?: Date;

    // Sorting
    sortBy?: 'timestamp' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogQueryResult {
    logs: ActivityLog[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

// ==================== Query Functions ====================

/**
 * ดึง Activity Logs จาก Firestore พร้อม pagination และ filters
 */
export async function getActivityLogs(
    options: ActivityLogQueryOptions = {}
): Promise<ActivityLogQueryResult> {
    try {
        const {
            pageSize = 50,
            lastDoc,
            userId,
            unitId,
            action,
            resourceType,
            resourceId,
            startDate,
            endDate,
            sortBy = 'timestamp',
            sortOrder = 'desc',
        } = options;

        const constraints: QueryConstraint[] = [];

        // Filters
        if (userId) {
            constraints.push(where('userId', '==', userId));
        }
        if (unitId) {
            constraints.push(where('unitId', '==', unitId));
        }
        if (action) {
            constraints.push(where('action', '==', action));
        }
        if (resourceType) {
            constraints.push(where('resourceType', '==', resourceType));
        }
        if (resourceId) {
            constraints.push(where('resourceId', '==', resourceId));
        }

        // Date range
        if (startDate) {
            constraints.push(where(sortBy, '>=', Timestamp.fromDate(startDate)));
        }
        if (endDate) {
            constraints.push(where(sortBy, '<=', Timestamp.fromDate(endDate)));
        }

        // Sorting
        constraints.push(orderBy(sortBy, sortOrder));

        // Pagination
        constraints.push(limit(pageSize + 1)); // +1 to check hasMore

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        const q = query(collection(db, 'activityLogs'), ...constraints);
        const snapshot = await getDocs(q);

        const logs: ActivityLog[] = [];
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;

        // Take only pageSize items
        const displayDocs = hasMore ? docs.slice(0, pageSize) : docs;

        displayDocs.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data(),
            } as ActivityLog);
        });

        return {
            logs,
            lastDoc: displayDocs.length > 0 ? displayDocs[displayDocs.length - 1] : null,
            hasMore,
        };
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return {
            logs: [],
            lastDoc: null,
            hasMore: false,
        };
    }
}

/**
 * ดึง Activity Logs ของ User คนใดคนหนึ่ง
 */
export async function getLogsByUser(
    userId: string,
    options: Omit<ActivityLogQueryOptions, 'userId'> = {}
): Promise<ActivityLogQueryResult> {
    return getActivityLogs({
        ...options,
        userId,
    });
}

/**
 * ดึง Activity Logs ของหน่วยงาน
 */
export async function getLogsByUnit(
    unitId: string,
    options: Omit<ActivityLogQueryOptions, 'unitId'> = {}
): Promise<ActivityLogQueryResult> {
    return getActivityLogs({
        ...options,
        unitId,
    });
}

/**
 * ดึง Activity Logs ตาม Action ที่ระบุ
 */
export async function getLogsByAction(
    action: ActivityAction,
    options: Omit<ActivityLogQueryOptions, 'action'> = {}
): Promise<ActivityLogQueryResult> {
    return getActivityLogs({
        ...options,
        action,
    });
}

/**
 * ดึง Activity Logs ตาม Resource Type
 */
export async function getLogsByResourceType(
    resourceType: ActivityResourceType,
    options: Omit<ActivityLogQueryOptions, 'resourceType'> = {}
): Promise<ActivityLogQueryResult> {
    return getActivityLogs({
        ...options,
        resourceType,
    });
}

/**
 * ดึง Activity Logs ในช่วงเวลาที่กำหนด
 */
export async function getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    options: Omit<ActivityLogQueryOptions, 'startDate' | 'endDate'> = {}
): Promise<ActivityLogQueryResult> {
    return getActivityLogs({
        ...options,
        startDate,
        endDate,
    });
}

/**
 * ดึง Logs ล่าสุด N รายการ
 */
export async function getRecentLogs(count: number = 20): Promise<ActivityLog[]> {
    const result = await getActivityLogs({
        pageSize: count,
        sortBy: 'timestamp',
        sortOrder: 'desc',
    });

    return result.logs;
}

// ==================== Search & Filter ====================

/**
 * ค้นหา Activity Logs ด้วย keyword (userName, userEmail, resourceName)
 * Note: Firestore ไม่รองรับ full-text search, ต้องใช้ client-side filtering
 */
export function searchActivityLogs(logs: ActivityLog[], keyword: string): ActivityLog[] {
    if (!keyword || keyword.trim() === '') {
        return logs;
    }

    const lowerKeyword = keyword.toLowerCase();

    return logs.filter((log) => {
        return (
            log.userName?.toLowerCase().includes(lowerKeyword) ||
            log.userEmail?.toLowerCase().includes(lowerKeyword) ||
            log.resourceName?.toLowerCase().includes(lowerKeyword) ||
            log.unitName?.toLowerCase().includes(lowerKeyword) ||
            log.details?.description?.toLowerCase().includes(lowerKeyword)
        );
    });
}

/**
 * กรอง Activity Logs ตามเงื่อนไขหลายตัว (client-side)
 */
export function filterActivityLogs(
    logs: ActivityLog[],
    filters: {
        userIds?: string[];
        unitIds?: string[];
        actions?: ActivityAction[];
        resourceTypes?: ActivityResourceType[];
        startDate?: Date;
        endDate?: Date;
    }
): ActivityLog[] {
    let filteredLogs = [...logs];

    if (filters.userIds && filters.userIds.length > 0) {
        filteredLogs = filteredLogs.filter((log) => filters.userIds!.includes(log.userId));
    }

    if (filters.unitIds && filters.unitIds.length > 0) {
        filteredLogs = filteredLogs.filter((log) => log.unitId && filters.unitIds!.includes(log.unitId));
    }

    if (filters.actions && filters.actions.length > 0) {
        filteredLogs = filteredLogs.filter((log) => filters.actions!.includes(log.action));
    }

    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        filteredLogs = filteredLogs.filter((log) => filters.resourceTypes!.includes(log.resourceType));
    }

    if (filters.startDate) {
        filteredLogs = filteredLogs.filter((log) => {
            const logDate = log.timestamp.toDate();
            return logDate >= filters.startDate!;
        });
    }

    if (filters.endDate) {
        filteredLogs = filteredLogs.filter((log) => {
            const logDate = log.timestamp.toDate();
            return logDate <= filters.endDate!;
        });
    }

    return filteredLogs;
}

// ==================== Statistics & Analytics ====================

/**
 * สรุปสถิติการใช้งานจาก Activity Logs
 */
export interface ActivityStats {
    totalLogs: number;
    actionCounts: Partial<Record<ActivityAction, number>>;
    resourceTypeCounts: Partial<Record<ActivityResourceType, number>>;
    topUsers: Array<{ userId: string; userName: string; count: number }>;
    topUnits: Array<{ unitId: string; unitName: string; count: number }>;
    dailyActivity: Array<{ date: string; count: number }>;
}

export function getActivityStats(logs: ActivityLog[]): ActivityStats {
    const actionCounts: Partial<Record<ActivityAction, number>> = {};
    const resourceTypeCounts: Partial<Record<ActivityResourceType, number>> = {};
    const userCounts: Record<string, { userName: string; count: number }> = {};
    const unitCounts: Record<string, { unitName: string; count: number }> = {};
    const dailyCounts: Record<string, number> = {};

    logs.forEach((log) => {
        // Action counts
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

        // Resource type counts
        resourceTypeCounts[log.resourceType] = (resourceTypeCounts[log.resourceType] || 0) + 1;

        // User counts
        if (!userCounts[log.userId]) {
            userCounts[log.userId] = { userName: log.userName, count: 0 };
        }
        userCounts[log.userId].count++;

        // Unit counts
        if (log.unitId && log.unitName) {
            if (!unitCounts[log.unitId]) {
                unitCounts[log.unitId] = { unitName: log.unitName, count: 0 };
            }
            unitCounts[log.unitId].count++;
        }

        // Daily counts
        const dateKey = log.timestamp.toDate().toISOString().split('T')[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    });

    // Sort and format top users
    const topUsers = Object.entries(userCounts)
        .map(([userId, data]) => ({
            userId,
            userName: data.userName,
            count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Sort and format top units
    const topUnits = Object.entries(unitCounts)
        .map(([unitId, data]) => ({
            unitId,
            unitName: data.unitName,
            count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Format daily activity
    const dailyActivity = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalLogs: logs.length,
        actionCounts,
        resourceTypeCounts,
        topUsers,
        topUnits,
        dailyActivity,
    };
}

// ==================== Export Functions ====================

/**
 * แปลง Activity Logs เป็น CSV format
 */
export function exportActivityLogsToCSV(logs: ActivityLog[]): string {
    const headers = [
        'วันที่/เวลา',
        'ผู้ใช้งาน',
        'อีเมล',
        'หน่วยงาน',
        'การกระทำ',
        'ประเภทข้อมูล',
        'ชื่อข้อมูล',
        'รายละเอียด',
    ];

    const rows = logs.map((log) => [
        log.timestamp.toDate().toLocaleString('th-TH'),
        log.userName,
        log.userEmail,
        log.unitName || '-',
        getActionLabel(log.action),
        getResourceTypeLabel(log.resourceType),
        log.resourceName || '-',
        log.details?.description || '-',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
    ].join('\n');

    return csvContent;
}

/**
 * แปลง Action เป็นป้ายกำกับภาษาไทย
 */
export function getActionLabel(action: ActivityAction): string {
    const labels: Record<ActivityAction, string> = {
        login: 'เข้าสู่ระบบ',
        logout: 'ออกจากระบบ',
        create: 'สร้าง',
        update: 'แก้ไข',
        delete: 'ลบ',
        upload: 'อัปโหลด',
        download: 'ดาวน์โหลด',
        view: 'เรียกดู',
        approve: 'อนุมัติ',
        reject: 'ไม่อนุมัติ',
        enable: 'เปิดใช้งาน',
        disable: 'ปิดใช้งาน',
    };

    return labels[action] || action;
}

/**
 * แปลง Resource Type เป็นป้ายกำกับภาษาไทย
 */
export function getResourceTypeLabel(resourceType: ActivityResourceType): string {
    const labels: Record<ActivityResourceType, string> = {
        user: 'ผู้ใช้งาน',
        cycle: 'รอบการประเมิน',
        evidence: 'หลักฐาน',
        unit: 'หน่วยงาน',
        file: 'ไฟล์',
        system: 'ระบบ',
        auth: 'การยืนยันตัวตน',
    };

    return labels[resourceType] || resourceType;
}

// ==================== Data Retention ====================

/**
 * ลบ Activity Logs ที่เก่ากว่า retention period (1 year)
 * Note: ควรรันจาก Cloud Function หรือ Admin script
 */
export async function cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const q = query(
            collection(db, 'activityLogs'),
            where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
            limit(500) // Delete in batches
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return 0;
        }

        // Note: จริงๆ ควรใช้ batch delete แต่ต้องมี admin SDK
        // ในที่นี้แค่นับจำนวนที่ควรลบ
        console.warn('Cleanup old logs: Found', snapshot.size, 'logs to delete');
        console.warn('Please use Admin SDK or Cloud Function to delete');

        return snapshot.size;
    } catch (error) {
        console.error('Error cleaning up old logs:', error);
        return 0;
    }
}
