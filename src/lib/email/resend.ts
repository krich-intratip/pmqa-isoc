import { Resend } from 'resend';

// Initialize Resend lazily to avoid build errors when API key is not set
let resendInstance: Resend | null = null;

function getResend(): Resend {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is not set');
        }
        resendInstance = new Resend(apiKey);
    }
    return resendInstance;
}

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
        console.warn('Email not sent: RESEND_API_KEY is not configured');
        return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'PMQA ISOC <noreply@resend.dev>';

    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

// Email templates
export const emailTemplates = {
    newUserRegistration: (newUserName: string, newUserEmail: string, adminUrl: string) => ({
        subject: '[PMQA ISOC] มีผู้ใช้ใหม่รอการอนุมัติ',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Registration</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PMQA ISOC System</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">แจ้งเตือนผู้ใช้ใหม่รอการอนุมัติ</p>
    </div>

    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
                <span style="font-size: 18px;">&#9888;</span> มีผู้ใช้ใหม่ลงทะเบียนเข้าใช้งานระบบ
            </p>
        </div>

        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">ข้อมูลผู้ใช้ใหม่:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; width: 100px;">ชื่อ:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${newUserName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">อีเมล:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${newUserEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">สถานะ:</td>
                    <td style="padding: 8px 0;">
                        <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 13px;">รอการอนุมัติ</span>
                    </td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 25px 0;">
            <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 500; font-size: 14px;">
                ไปยังหน้าจัดการผู้ใช้
            </a>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
            กรุณาตรวจสอบข้อมูลและอนุมัติผู้ใช้เพื่อให้สามารถเข้าใช้งานระบบได้
        </p>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            ระบบประเมิน PMQA 4.0 - กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร
        </p>
        <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 11px;">
            อีเมลนี้ถูกส่งอัตโนมัติ กรุณาอย่าตอบกลับ
        </p>
    </div>
</body>
</html>
        `.trim(),
    }),

    userApproved: (userName: string, loginUrl: string) => ({
        subject: '[PMQA ISOC] บัญชีของท่านได้รับการอนุมัติแล้ว',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PMQA ISOC System</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">บัญชีได้รับการอนุมัติ</p>
    </div>

    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="background: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #065f46; font-weight: 500; font-size: 16px;">
                <span style="font-size: 24px;">&#10003;</span> ยินดีด้วย!
            </p>
        </div>

        <p style="color: #374151; margin-bottom: 20px;">
            สวัสดีคุณ <strong>${userName}</strong>,
        </p>

        <p style="color: #374151; margin-bottom: 20px;">
            บัญชีของท่านได้รับการอนุมัติจากผู้ดูแลระบบแล้ว ท่านสามารถเข้าใช้งานระบบ PMQA ISOC ได้ทันที
        </p>

        <div style="text-align: center; margin: 25px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 500; font-size: 14px;">
                เข้าสู่ระบบ
            </a>
        </div>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            ระบบประเมิน PMQA 4.0 - กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร
        </p>
    </div>
</body>
</html>
        `.trim(),
    }),

    userRejected: (userName: string, reason?: string) => ({
        subject: '[PMQA ISOC] แจ้งผลการพิจารณาคำขอใช้งานระบบ',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PMQA ISOC System</h1>
    </div>

    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; margin-bottom: 20px;">
            สวัสดีคุณ <strong>${userName}</strong>,
        </p>

        <p style="color: #374151; margin-bottom: 20px;">
            เราขอแจ้งให้ทราบว่าคำขอใช้งานระบบ PMQA ISOC ของท่านไม่ได้รับการอนุมัติในครั้งนี้
        </p>

        ${reason ? `
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>เหตุผล:</strong> ${reason}
            </p>
        </div>
        ` : ''}

        <p style="color: #6b7280; font-size: 14px;">
            หากท่านมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามรายละเอียดเพิ่มเติม
        </p>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            ระบบประเมิน PMQA 4.0 - กองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร
        </p>
    </div>
</body>
</html>
        `.trim(),
    }),
};
