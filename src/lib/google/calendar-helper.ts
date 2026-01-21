/**
 * Google Calendar Helper
 * 
 * ช่วยสร้าง events ใน Google Calendar สำหรับ deadline ต่างๆ
 */

import { auth } from '@/lib/firebase/config';
import { AssessmentCycle } from '@/types/database';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

interface CalendarEvent {
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone: string;
    };
    reminders?: {
        useDefault: boolean;
        overrides?: { method: string; minutes: number }[];
    };
}

interface CalendarEventResponse {
    id: string;
    htmlLink: string;
    summary: string;
    start: { dateTime?: string; date?: string };
}

/**
 * Get access token from current Firebase user
 */
export async function getAccessToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        // Get the ID token with force refresh
        const token = await user.getIdToken(true);
        return token;
    } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
    }
}

/**
 * Get OAuth access token from Google (requires re-auth with popup)
 */
export async function getGoogleAccessToken(): Promise<string | null> {
    try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar.events');

        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);

        if (credential?.accessToken) {
            return credential.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Failed to get Google access token:', error);
        return null;
    }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
    accessToken: string,
    event: CalendarEvent,
    calendarId: string = 'primary'
): Promise<CalendarEventResponse | null> {
    try {
        const response = await fetch(
            `${CALENDAR_API_BASE}/calendars/${calendarId}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Calendar API error:', error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        return null;
    }
}

/**
 * Sync Assessment Cycle deadlines to Google Calendar
 */
export async function syncCycleToCalendar(
    accessToken: string,
    cycle: AssessmentCycle
): Promise<{ success: boolean; eventsCreated: number; errors: string[] }> {
    const results = { success: true, eventsCreated: 0, errors: [] as string[] };
    const timeZone = 'Asia/Bangkok';

    // Create event for cycle start date
    const startEvent: CalendarEvent = {
        summary: `🟢 เริ่มรอบประเมิน: ${cycle.name}`,
        description: `รอบการประเมิน PMQA ${cycle.year}\n${cycle.description || ''}`,
        start: {
            dateTime: cycle.startDate.toDate().toISOString(),
            timeZone,
        },
        end: {
            dateTime: new Date(cycle.startDate.toDate().getTime() + 60 * 60 * 1000).toISOString(),
            timeZone,
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 1440 }, // 1 day before
            ],
        },
    };

    const startResult = await createCalendarEvent(accessToken, startEvent);
    if (startResult) {
        results.eventsCreated++;
    } else {
        results.errors.push('Failed to create start date event');
    }

    // Create event for cycle end date (deadline)
    const endEvent: CalendarEvent = {
        summary: `🔴 สิ้นสุดรอบประเมิน: ${cycle.name}`,
        description: `วันสุดท้ายของรอบการประเมิน PMQA ${cycle.year}\n⚠️ กรุณาส่งเอกสารให้ครบก่อนวันนี้`,
        start: {
            dateTime: cycle.endDate.toDate().toISOString(),
            timeZone,
        },
        end: {
            dateTime: new Date(cycle.endDate.toDate().getTime() + 60 * 60 * 1000).toISOString(),
            timeZone,
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 10080 },  // 7 days before
                { method: 'popup', minutes: 4320 },   // 3 days before
                { method: 'popup', minutes: 1440 },   // 1 day before
            ],
        },
    };

    const endResult = await createCalendarEvent(accessToken, endEvent);
    if (endResult) {
        results.eventsCreated++;
    } else {
        results.errors.push('Failed to create end date event');
    }

    results.success = results.errors.length === 0;
    return results;
}

/**
 * Create a custom deadline event
 */
export async function createDeadlineEvent(
    accessToken: string,
    title: string,
    date: Date,
    description?: string
): Promise<CalendarEventResponse | null> {
    const timeZone = 'Asia/Bangkok';

    const event: CalendarEvent = {
        summary: `📌 ${title}`,
        description: description || 'PMQA 4.0 - กอ.รมน.',
        start: {
            date: date.toISOString().split('T')[0], // All-day event
            timeZone,
        },
        end: {
            date: date.toISOString().split('T')[0],
            timeZone,
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 1440 }, // 1 day before
            ],
        },
    };

    return createCalendarEvent(accessToken, event);
}
