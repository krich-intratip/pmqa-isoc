import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import {
    logActivity,
    logLogin,
    logLogout,
    logCreate,
    logUpdate,
    logDelete,
    logApprove,
    logReject,
    logFileUpload,
    logFileDownload,
    logUserStatusChange,
} from '@/lib/activity-log/activity-logger';
import { ActivityAction, ActivityResourceType } from '@/types/database';

/**
 * React Hook สำหรับบันทึก Activity Log
 * ใช้งาน: const { logAction, logCreateAction, logUpdateAction, ... } = useActivityLogger();
 */
export function useActivityLogger() {
    const { user } = useAuthStore();

    /**
     * บันทึก Activity แบบทั่วไป
     */
    const logAction = useCallback(
        async (
            action: ActivityAction,
            resourceType: ActivityResourceType,
            resourceId?: string,
            resourceName?: string,
            details?: Record<string, unknown>
        ): Promise<boolean> => {
            return logActivity({
                user,
                action,
                resourceType,
                resourceId,
                resourceName,
                details,
            });
        },
        [user]
    );

    /**
     * บันทึก Login activity
     */
    const logLoginAction = useCallback(
        async (ipAddress?: string, userAgent?: string): Promise<boolean> => {
            if (!user) return false;
            return logLogin(user, ipAddress, userAgent);
        },
        [user]
    );

    /**
     * บันทึก Logout activity
     */
    const logLogoutAction = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        return logLogout(user);
    }, [user]);

    /**
     * บันทึก Create activity
     */
    const logCreateAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string,
            details?: Record<string, unknown>
        ): Promise<boolean> => {
            if (!user) return false;
            return logCreate(user, resourceType, resourceId, resourceName, details);
        },
        [user]
    );

    /**
     * บันทึก Update activity
     */
    const logUpdateAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string,
            changes: Record<string, unknown>,
            oldValue?: string | number | boolean | null,
            newValue?: string | number | boolean | null
        ): Promise<boolean> => {
            if (!user) return false;
            return logUpdate(user, resourceType, resourceId, resourceName, changes, oldValue, newValue);
        },
        [user]
    );

    /**
     * บันทึก Delete activity
     */
    const logDeleteAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string
        ): Promise<boolean> => {
            if (!user) return false;
            return logDelete(user, resourceType, resourceId, resourceName);
        },
        [user]
    );

    /**
     * บันทึก Approve activity
     */
    const logApproveAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string
        ): Promise<boolean> => {
            if (!user) return false;
            return logApprove(user, resourceType, resourceId, resourceName);
        },
        [user]
    );

    /**
     * บันทึก Reject activity
     */
    const logRejectAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string,
            reason?: string
        ): Promise<boolean> => {
            if (!user) return false;
            return logReject(user, resourceType, resourceId, resourceName, reason);
        },
        [user]
    );

    /**
     * บันทึก File Upload activity
     */
    const logFileUploadAction = useCallback(
        async (
            filename: string,
            filesize: number,
            fileType: string,
            resourceType: ActivityResourceType = 'file',
            resourceId?: string
        ): Promise<boolean> => {
            if (!user) return false;
            return logFileUpload(user, filename, filesize, fileType, resourceType, resourceId);
        },
        [user]
    );

    /**
     * บันทึก File Download activity
     */
    const logFileDownloadAction = useCallback(
        async (filename: string, resourceId?: string): Promise<boolean> => {
            if (!user) return false;
            return logFileDownload(user, filename, resourceId);
        },
        [user]
    );

    /**
     * บันทึก User Status Change (Enable/Disable)
     */
    const logUserStatusChangeAction = useCallback(
        async (
            targetUserId: string,
            targetUserName: string,
            newStatus: 'enabled' | 'disabled'
        ): Promise<boolean> => {
            if (!user) return false;
            return logUserStatusChange(user, targetUserId, targetUserName, newStatus);
        },
        [user]
    );

    /**
     * บันทึก View activity (สำหรับการดูข้อมูล)
     */
    const logViewAction = useCallback(
        async (
            resourceType: ActivityResourceType,
            resourceId: string,
            resourceName: string
        ): Promise<boolean> => {
            return logAction('view', resourceType, resourceId, resourceName, {
                description: `Viewed ${resourceType}: ${resourceName}`,
            });
        },
        [logAction]
    );

    return {
        // Generic action
        logAction,

        // Specific actions
        logLoginAction,
        logLogoutAction,
        logCreateAction,
        logUpdateAction,
        logDeleteAction,
        logApproveAction,
        logRejectAction,
        logFileUploadAction,
        logFileDownloadAction,
        logUserStatusChangeAction,
        logViewAction,

        // User context
        currentUser: user,
        isReady: !!user,
    };
}

/**
 * Example usage:
 *
 * const { logCreateAction, logUpdateAction } = useActivityLogger();
 *
 * // When creating a new cycle
 * await logCreateAction('cycle', newCycle.id, newCycle.name);
 *
 * // When updating user
 * await logUpdateAction('user', userId, userName, { role: 'admin' }, 'staff', 'admin');
 *
 * // When uploading evidence
 * await logFileUploadAction('report.pdf', 1024000, 'application/pdf', 'evidence', evidenceId);
 */
