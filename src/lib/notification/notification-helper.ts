import { db } from '@/lib/firebase/config';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import type { NotificationType } from '@/types/database';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    source?: {
        type: 'user' | 'system' | 'cycle' | 'evidence';
        id?: string;
        name?: string;
    };
    link?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
    try {
        const notificationData = {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            source: params.source || null,
            link: params.link || null,
            read: false,
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'notifications'), notificationData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
}

/**
 * Send approval notification to a user
 */
export async function sendApprovalNotification(
    userId: string,
    approverName: string
): Promise<string | null> {
    return createNotification({
        userId,
        type: 'approval',
        title: 'บัญชีได้รับการอนุมัติแล้ว',
        message: `บัญชีของคุณได้รับการอนุมัติโดย ${approverName} คุณสามารถเข้าใช้งานระบบได้แล้ว`,
        source: {
            type: 'system',
            name: approverName
        },
        link: '/dashboard'
    });
}

/**
 * Send rejection notification to a user
 */
export async function sendRejectionNotification(
    userId: string,
    approverName: string,
    reason?: string
): Promise<string | null> {
    const message = reason
        ? `บัญชีของคุณถูกปฏิเสธโดย ${approverName} เหตุผล: ${reason}`
        : `บัญชีของคุณถูกปฏิเสธโดย ${approverName}`;

    return createNotification({
        userId,
        type: 'rejection',
        title: 'บัญชีถูกปฏิเสธ',
        message,
        source: {
            type: 'system',
            name: approverName
        }
    });
}

/**
 * Send cycle notification (new cycle active, cycle ending soon, etc.)
 */
export async function sendCycleNotification(
    userId: string,
    title: string,
    message: string,
    cycleId: string
): Promise<string | null> {
    return createNotification({
        userId,
        type: 'cycle',
        title,
        message,
        source: {
            type: 'cycle',
            id: cycleId
        },
        link: '/dashboard'
    });
}

/**
 * Send evidence notification (evidence verified, rejected, etc.)
 */
export async function sendEvidenceNotification(
    userId: string,
    title: string,
    message: string,
    evidenceId: string
): Promise<string | null> {
    return createNotification({
        userId,
        type: 'evidence',
        title,
        message,
        source: {
            type: 'evidence',
            id: evidenceId
        },
        link: '/phase1/evidence'
    });
}
