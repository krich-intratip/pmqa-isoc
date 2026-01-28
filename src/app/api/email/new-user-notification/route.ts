import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { adminEmails, newUserName, newUserEmail } = body;

        if (!adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
            return NextResponse.json(
                { error: 'No admin emails provided' },
                { status: 400 }
            );
        }

        if (!newUserName || !newUserEmail) {
            return NextResponse.json(
                { error: 'Missing user information' },
                { status: 400 }
            );
        }

        // Get the base URL for admin link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pmqa-isoc.vercel.app';
        const adminUrl = `${baseUrl}/admin/users?filter=pending`;

        // Generate email content
        const { subject, html } = emailTemplates.newUserRegistration(
            newUserName,
            newUserEmail,
            adminUrl
        );

        // Send email to all system admins
        await sendEmail({
            to: adminEmails,
            subject,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending new user notification email:', error);

        // Don't fail the registration if email fails
        return NextResponse.json(
            { error: 'Failed to send email notification', details: (error as Error).message },
            { status: 500 }
        );
    }
}
