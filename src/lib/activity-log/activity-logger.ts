import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, Timestamp, doc, getDoc } from 'firebase/firestore';
import { ActivityLog, ActivityAction, ActivityResourceType } from '@/types/database';
import { User } from '@/types/database';

interface LogActivityParams {
    user: User | null;
    action: ActivityAction;
    resourceType: ActivityResourceType;
    resourceId?: string;
    resourceName?: string;
    details?: {
        changes?: any;
        oldValue?: any;
        newValue?: any;
        filename?: string;
        filesize?: number;
        fileType?: string;
        ipAddress?: string;
        userAgent?: string;
        device?: string;
        browser?: string;
        description?: string;
        errorMessage?: string;
    };
}

/**
 * บันทึก Activity Log ลง Firestore
 */
export async function logActivity(params: LogActivityParams): Promise<boolean> {
    try {
        if (!params.user) {
            console.warn('Cannot log activity: user is null');
            return false;
        }

        // Fetch unit name if unitId exists
        let unitName: string | undefined = undefined;
        if (params.user.unitId) {
            try {
                const unitDoc = await getDoc(doc(db, 'units', params.user.unitId));
                if (unitDoc.exists()) {
                    unitName = unitDoc.data()?.name;
                }
            } catch (error) {
                console.warn('Failed to fetch unit name:', error);
                // Continue logging even if unit fetch fails
            }
        }

        const logData: Omit<ActivityLog, 'id'> = {
            userId: params.user.uid,
            userName: params.user.displayName,
            userEmail: params.user.email,
            unitId: params.user.unitId,
            unitName, // v1.8.0: ดึงจาก units collection

            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            resourceName: params.resourceName,

            details: params.details || {},

            timestamp: serverTimestamp() as Timestamp,
            createdAt: serverTimestamp() as Timestamp,
        };

        await addDoc(collection(db, 'activityLogs'), logData);
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
}

/**
 * บันทึก Login activity
 */
export async function logLogin(user: User, ipAddress?: string, userAgent?: string): Promise<boolean> {
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);

    return logActivity({
        user,
        action: 'login',
        resourceType: 'auth',
        details: {
            ipAddress,
            userAgent,
            device,
            browser,
            description: 'User logged in successfully',
        },
    });
}

/**
 * บันทึก Logout activity
 */
export async function logLogout(user: User): Promise<boolean> {
    return logActivity({
        user,
        action: 'logout',
        resourceType: 'auth',
        details: {
            description: 'User logged out',
        },
    });
}

/**
 * บันทึก Create activity
 */
export async function logCreate(
    user: User,
    resourceType: ActivityResourceType,
    resourceId: string,
    resourceName: string,
    details?: any
): Promise<boolean> {
    return logActivity({
        user,
        action: 'create',
        resourceType,
        resourceId,
        resourceName,
        details: {
            description: `Created ${resourceType}: ${resourceName}`,
            ...details,
        },
    });
}

/**
 * บันทึก Update activity
 */
export async function logUpdate(
    user: User,
    resourceType: ActivityResourceType,
    resourceId: string,
    resourceName: string,
    changes: any,
    oldValue?: any,
    newValue?: any
): Promise<boolean> {
    return logActivity({
        user,
        action: 'update',
        resourceType,
        resourceId,
        resourceName,
        details: {
            description: `Updated ${resourceType}: ${resourceName}`,
            changes,
            oldValue,
            newValue,
        },
    });
}

/**
 * บันทึก Delete activity
 */
export async function logDelete(
    user: User,
    resourceType: ActivityResourceType,
    resourceId: string,
    resourceName: string
): Promise<boolean> {
    return logActivity({
        user,
        action: 'delete',
        resourceType,
        resourceId,
        resourceName,
        details: {
            description: `Deleted ${resourceType}: ${resourceName}`,
        },
    });
}

/**
 * บันทึก Approve activity
 */
export async function logApprove(
    user: User,
    resourceType: ActivityResourceType,
    resourceId: string,
    resourceName: string
): Promise<boolean> {
    return logActivity({
        user,
        action: 'approve',
        resourceType,
        resourceId,
        resourceName,
        details: {
            description: `Approved ${resourceType}: ${resourceName}`,
        },
    });
}

/**
 * บันทึก Reject activity
 */
export async function logReject(
    user: User,
    resourceType: ActivityResourceType,
    resourceId: string,
    resourceName: string,
    reason?: string
): Promise<boolean> {
    return logActivity({
        user,
        action: 'reject',
        resourceType,
        resourceId,
        resourceName,
        details: {
            description: `Rejected ${resourceType}: ${resourceName}`,
            errorMessage: reason,
        },
    });
}

/**
 * บันทึก File Upload activity
 */
export async function logFileUpload(
    user: User,
    filename: string,
    filesize: number,
    fileType: string,
    resourceType: ActivityResourceType = 'file',
    resourceId?: string
): Promise<boolean> {
    return logActivity({
        user,
        action: 'upload',
        resourceType,
        resourceId,
        resourceName: filename,
        details: {
            filename,
            filesize,
            fileType,
            description: `Uploaded file: ${filename}`,
        },
    });
}

/**
 * บันทึก File Download activity
 */
export async function logFileDownload(
    user: User,
    filename: string,
    resourceId?: string
): Promise<boolean> {
    return logActivity({
        user,
        action: 'download',
        resourceType: 'file',
        resourceId,
        resourceName: filename,
        details: {
            filename,
            description: `Downloaded file: ${filename}`,
        },
    });
}

/**
 * บันทึก Enable/Disable User activity
 */
export async function logUserStatusChange(
    user: User,
    targetUserId: string,
    targetUserName: string,
    newStatus: 'enabled' | 'disabled'
): Promise<boolean> {
    return logActivity({
        user,
        action: newStatus === 'enabled' ? 'enable' : 'disable',
        resourceType: 'user',
        resourceId: targetUserId,
        resourceName: targetUserName,
        details: {
            description: `${newStatus === 'enabled' ? 'Enabled' : 'Disabled'} user: ${targetUserName}`,
        },
    });
}

// ==================== Helper Functions ====================

/**
 * Detect device type from User Agent
 */
function detectDevice(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

/**
 * Detect browser from User Agent
 */
function detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';

    return 'Unknown';
}

/**
 * Get client IP address (only works on server-side)
 */
export function getClientIP(request?: Request): string | undefined {
    if (typeof window !== 'undefined') {
        // Client-side: cannot get IP
        return undefined;
    }

    if (!request) return undefined;

    // Try various headers
    const headers = request.headers;
    return (
        headers.get('x-forwarded-for')?.split(',')[0] ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        undefined
    );
}
