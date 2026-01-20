'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Megaphone, ExternalLink } from 'lucide-react';
import type { Announcement, AnnouncementSlot } from '@/types/database';
import Link from 'next/link';

const SLOT_CONFIG: Record<AnnouncementSlot, { icon: React.ReactNode; defaultTitle: string; color: string }> = {
    what_is_pmqa: {
        icon: <BookOpen className="h-5 w-5" />,
        defaultTitle: 'PMQA 4.0 คืออะไร',
        color: 'from-blue-500 to-indigo-600',
    },
    why_important: {
        icon: <Star className="h-5 w-5" />,
        defaultTitle: 'ความสำคัญของ PMQA',
        color: 'from-emerald-500 to-teal-600',
    },
    announcement: {
        icon: <Megaphone className="h-5 w-5" />,
        defaultTitle: 'ประกาศสำคัญ',
        color: 'from-amber-500 to-orange-600',
    },
};

interface AnnouncementCardProps {
    announcement: Announcement | null;
    slot: AnnouncementSlot;
    delay?: number;
}

function AnnouncementCard({ announcement, slot, delay = 0 }: AnnouncementCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const config = SLOT_CONFIG[slot];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const title = announcement?.title || config.defaultTitle;
    const content = announcement?.content || 'ยังไม่มีเนื้อหา กรุณาติดต่อผู้ดูแลระบบ';

    return (
        <Card
            className={`overflow-hidden transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } hover:shadow-lg hover:-translate-y-1`}
        >
            <div className={`h-2 bg-gradient-to-r ${config.color}`} />
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className={`p-2 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                        {config.icon}
                    </span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {content}
                </p>
                {announcement?.link && (
                    <Link href={announcement.link} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            {announcement.linkText || 'อ่านเพิ่มเติม'}
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}

export function AnnouncementCards() {
    const [announcements, setAnnouncements] = useState<Record<AnnouncementSlot, Announcement | null>>({
        what_is_pmqa: null,
        why_important: null,
        announcement: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const announcementsQuery = query(
                    collection(db, 'announcements'),
                    where('isActive', '==', true)
                );
                const snapshot = await getDocs(announcementsQuery);

                const data: Record<AnnouncementSlot, Announcement | null> = {
                    what_is_pmqa: null,
                    why_important: null,
                    announcement: null,
                };

                snapshot.forEach((doc) => {
                    const announcement = { id: doc.id, ...doc.data() } as Announcement;
                    if (announcement.slot in data) {
                        data[announcement.slot] = announcement;
                    }
                });

                setAnnouncements(data);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
                    <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
                </div>
                <div className="flex justify-center">
                    <div className="w-full md:w-2/3 h-48 bg-slate-100 animate-pulse rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <section className="space-y-6 mb-8">
            {/* Top Row: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnnouncementCard
                    announcement={announcements.what_is_pmqa}
                    slot="what_is_pmqa"
                    delay={100}
                />
                <AnnouncementCard
                    announcement={announcements.why_important}
                    slot="why_important"
                    delay={200}
                />
            </div>

            {/* Bottom Row: Centered single column */}
            <div className="flex justify-center">
                <div className="w-full md:w-2/3 lg:w-1/2">
                    <AnnouncementCard
                        announcement={announcements.announcement}
                        slot="announcement"
                        delay={300}
                    />
                </div>
            </div>
        </section>
    );
}
