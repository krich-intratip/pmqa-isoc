/**
 * Email Service for PMQA-ISOC
 *
 * NOTE: Firebase email sending requires Blaze Plan (pay-as-you-go)
 * This module provides the infrastructure for email notifications.
 *
 * Options for sending emails:
 * 1. Firebase Extensions - "Trigger Email" (recommended, requires Blaze)
 * 2. Cloud Functions with SendGrid/Mailgun/Resend
 * 3. Third-party email API directly from client (not recommended for production)
 *
 * Current implementation: Queue emails to Firestore for later processing
 * When Blaze Plan is enabled, add a Cloud Function to process the queue
 */

import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export type EmailType =
    | 'deadline_reminder'
    | 'approval_notification'
    | 'rejection_notification'
    | 'cycle_start'
    | 'cycle_end'
    | 'evidence_verified'
    | 'mention_notification'
    | 'welcome';

export interface EmailTemplate {
    type: EmailType;
    subject: string;
    body: string;
    htmlBody?: string;
}

export interface QueuedEmail {
    id?: string;
    to: string;
    toName?: string;
    type: EmailType;
    subject: string;
    body: string;
    htmlBody?: string;
    status: 'pending' | 'sent' | 'failed';
    error?: string;
    createdAt: Timestamp;
    sentAt?: Timestamp;
    metadata?: Record<string, unknown>;
}

// Email templates in Thai
const EMAIL_TEMPLATES: Record<EmailType, (data: Record<string, string>) => EmailTemplate> = {
    deadline_reminder: (data) => ({
        type: 'deadline_reminder',
        subject: `[PMQA] แจ้งเตือน: รอบประเมิน ${data.cycleName} จะสิ้นสุดใน ${data.daysLeft} วัน`,
        body: `เรียน ${data.userName}

รอบประเมิน "${data.cycleName}" จะสิ้นสุดในวันที่ ${data.endDate}
เหลืออีก ${data.daysLeft} วัน

กรุณาตรวจสอบและดำเนินการให้แล้วเสร็จก่อนกำหนด

สถานะปัจจุบัน:
- หลักฐานที่อัปโหลด: ${data.evidenceCount || 0} รายการ
- หลักฐานที่ผ่านการตรวจสอบ: ${data.verifiedCount || 0} รายการ

เข้าสู่ระบบ: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
        htmlBody: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">แจ้งเตือนกำหนดส่ง</h2>
                <p>เรียน <strong>${data.userName}</strong></p>
                <p>รอบประเมิน "<strong>${data.cycleName}</strong>" จะสิ้นสุดในวันที่ <strong>${data.endDate}</strong></p>
                <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 18px;">⏰ เหลืออีก <strong>${data.daysLeft}</strong> วัน</p>
                </div>
                <p>สถานะปัจจุบัน:</p>
                <ul>
                    <li>หลักฐานที่อัปโหลด: ${data.evidenceCount || 0} รายการ</li>
                    <li>หลักฐานที่ผ่านการตรวจสอบ: ${data.verifiedCount || 0} รายการ</li>
                </ul>
                <a href="${data.appUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">เข้าสู่ระบบ</a>
            </div>
        `,
    }),

    approval_notification: (data) => ({
        type: 'approval_notification',
        subject: '[PMQA] บัญชีของคุณได้รับการอนุมัติแล้ว',
        body: `เรียน ${data.userName}

บัญชีของคุณได้รับการอนุมัติแล้ว โดย ${data.approverName}

คุณสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที

เข้าสู่ระบบ: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
        htmlBody: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">✅ บัญชีได้รับการอนุมัติแล้ว</h2>
                <p>เรียน <strong>${data.userName}</strong></p>
                <p>บัญชีของคุณได้รับการอนุมัติแล้ว โดย <strong>${data.approverName}</strong></p>
                <p>คุณสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที</p>
                <a href="${data.appUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">เข้าสู่ระบบ</a>
            </div>
        `,
    }),

    rejection_notification: (data) => ({
        type: 'rejection_notification',
        subject: '[PMQA] การลงทะเบียนของคุณไม่ได้รับการอนุมัติ',
        body: `เรียน ${data.userName}

การลงทะเบียนของคุณไม่ได้รับการอนุมัติ

${data.reason ? `เหตุผล: ${data.reason}` : ''}

หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
        htmlBody: `
            <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #DC2626;">❌ การลงทะเบียนไม่ได้รับการอนุมัติ</h2>
                <p>เรียน <strong>${data.userName}</strong></p>
                <p>การลงทะเบียนของคุณไม่ได้รับการอนุมัติ</p>
                ${data.reason ? `<div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0;">เหตุผล: ${data.reason}</p></div>` : ''}
                <p>หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
        `,
    }),

    cycle_start: (data) => ({
        type: 'cycle_start',
        subject: `[PMQA] เริ่มต้นรอบประเมิน ${data.cycleName}`,
        body: `เรียน ${data.userName}

รอบประเมิน "${data.cycleName}" เริ่มต้นแล้ว

ระยะเวลา: ${data.startDate} - ${data.endDate}

กรุณาเข้าสู่ระบบเพื่อเริ่มดำเนินการ

เข้าสู่ระบบ: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
    }),

    cycle_end: (data) => ({
        type: 'cycle_end',
        subject: `[PMQA] รอบประเมิน ${data.cycleName} สิ้นสุดแล้ว`,
        body: `เรียน ${data.userName}

รอบประเมิน "${data.cycleName}" สิ้นสุดแล้ว

สรุปผลการดำเนินงาน:
- หลักฐานทั้งหมด: ${data.totalEvidence || 0} รายการ
- ผ่านการตรวจสอบ: ${data.verifiedEvidence || 0} รายการ

เข้าสู่ระบบเพื่อดูรายละเอียด: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
    }),

    evidence_verified: (data) => ({
        type: 'evidence_verified',
        subject: `[PMQA] หลักฐานของคุณได้รับการตรวจสอบแล้ว`,
        body: `เรียน ${data.userName}

หลักฐาน "${data.evidenceTitle}" ได้รับการตรวจสอบแล้ว

สถานะ: ${data.status === 'verified' ? 'ผ่านการตรวจสอบ ✅' : 'ไม่ผ่านการตรวจสอบ ❌'}
${data.feedback ? `ความเห็น: ${data.feedback}` : ''}

เข้าสู่ระบบ: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
    }),

    mention_notification: (data) => ({
        type: 'mention_notification',
        subject: `[PMQA] ${data.mentionerName} กล่าวถึงคุณ`,
        body: `เรียน ${data.userName}

${data.mentionerName} กล่าวถึงคุณในความคิดเห็น

"${data.commentPreview}"

เข้าสู่ระบบเพื่อดูรายละเอียด: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
    }),

    welcome: (data) => ({
        type: 'welcome',
        subject: '[PMQA] ยินดีต้อนรับสู่ระบบ PMQA-ISOC',
        body: `เรียน ${data.userName}

ยินดีต้อนรับสู่ระบบ PMQA-ISOC

บัญชีของคุณถูกสร้างเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ

เข้าสู่ระบบ: ${data.appUrl}

ขอบคุณค่ะ/ครับ
ระบบ PMQA-ISOC`,
    }),
};

/**
 * Queue an email for sending
 * The email will be stored in Firestore and processed by a Cloud Function (when Blaze Plan is enabled)
 */
export async function queueEmail(
    to: string,
    type: EmailType,
    data: Record<string, string>,
    toName?: string
): Promise<string> {
    const template = EMAIL_TEMPLATES[type](data);

    const emailDoc: Omit<QueuedEmail, 'id'> = {
        to,
        toName,
        type,
        subject: template.subject,
        body: template.body,
        htmlBody: template.htmlBody,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        metadata: data,
    };

    const docRef = await addDoc(collection(db, 'email_queue'), emailDoc);
    return docRef.id;
}

/**
 * Queue deadline reminder emails for all users in a cycle
 */
export async function queueDeadlineReminders(
    cycleName: string,
    endDate: string,
    daysLeft: number,
    users: Array<{ email: string; name: string; evidenceCount: number; verifiedCount: number }>
): Promise<void> {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pmqa-isoc.web.app';

    for (const user of users) {
        await queueEmail(user.email, 'deadline_reminder', {
            userName: user.name,
            cycleName,
            endDate,
            daysLeft: daysLeft.toString(),
            evidenceCount: user.evidenceCount.toString(),
            verifiedCount: user.verifiedCount.toString(),
            appUrl,
        }, user.name);
    }
}

/**
 * Queue approval notification email
 */
export async function queueApprovalEmail(
    userEmail: string,
    userName: string,
    approverName: string
): Promise<string> {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pmqa-isoc.web.app';

    return queueEmail(userEmail, 'approval_notification', {
        userName,
        approverName,
        appUrl,
    }, userName);
}

/**
 * Queue rejection notification email
 */
export async function queueRejectionEmail(
    userEmail: string,
    userName: string,
    reason?: string
): Promise<string> {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pmqa-isoc.web.app';

    return queueEmail(userEmail, 'rejection_notification', {
        userName,
        reason: reason || '',
        appUrl,
    }, userName);
}

/**
 * Check if email service is ready (Blaze Plan enabled)
 * This is a placeholder - implement actual check when Cloud Functions are set up
 */
export function isEmailServiceReady(): boolean {
    // TODO: Check if Cloud Functions are deployed and ready
    return false;
}

/**
 * Get pending emails count (for admin dashboard)
 */
export async function getPendingEmailsCount(): Promise<number> {
    // This would need a query with proper indexing
    // For now, return 0 as emails are queued but not sent without Blaze Plan
    return 0;
}
