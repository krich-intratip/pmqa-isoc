'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Megaphone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Announcement, AnnouncementSlot } from '@/types/database';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SLOT_CONFIG: Record<AnnouncementSlot, { icon: React.ReactNode; defaultTitle: string; color: string; bgColor: string; borderColor: string; textColor: string }> = {
    what_is_pmqa: {
        icon: <BookOpen className="h-5 w-5" />,
        defaultTitle: 'PMQA 4.0 คืออะไร',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-100',
        textColor: 'text-indigo-700',
    },
    why_important: {
        icon: <Star className="h-5 w-5" />,
        defaultTitle: 'ความสำคัญของ PMQA',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        textColor: 'text-emerald-700',
    },
    announcement: {
        icon: <Megaphone className="h-5 w-5" />,
        defaultTitle: 'ประกาศสำคัญ',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-100',
        textColor: 'text-amber-700',
    },
};

interface AnnouncementCardProps {
    announcement: Announcement | null;
    slot: AnnouncementSlot;
    delay?: number;
}

// Memoized to prevent re-renders when parent updates
const AnnouncementCard = memo(function AnnouncementCard({ announcement, slot, delay = 0 }: AnnouncementCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const config = SLOT_CONFIG[slot];
    const contentRef = useRef<HTMLParagraphElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (contentRef.current) {
            // Check if content height exceeds common clamped height (approx 4.5rem/72px for 3 lines)
            setIsOverflowing(contentRef.current.scrollHeight > 80);
        }
    }, [announcement]);

    const title = announcement?.title || config.defaultTitle;
    const content = announcement?.content || 'ยังไม่มีเนื้อหา กรุณาติดต่อผู้ดูแลระบบ';

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-500 ease-out transform h-fit flex flex-col",
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                "hover:shadow-md border-t-4",
                isExpanded ? "ring-2 ring-primary/20 shadow-lg z-10" : "hover:-translate-y-1"
            )}
            style={{ borderTopColor: 'transparent' }} // Handled by gradient div
        >
            <div className={`h-1.5 w-full bg-gradient-to-r ${config.color}`} />

            <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className={cn("flex items-center gap-2 text-base md:text-lg", config.textColor)}>
                    <div className={cn("p-1.5 rounded-md text-white shadow-sm bg-gradient-to-br", config.color)}>
                        {config.icon}
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-2 flex-grow">
                <div
                    className={cn(
                        "relative text-slate-600 text-sm leading-relaxed whitespace-pre-wrap transition-all duration-300 ease-in-out",
                        !isExpanded ? "max-h-[5.5rem] overflow-hidden" : "max-h-[1000px]"
                    )}
                >
                    <p ref={contentRef}>
                        {content}
                    </p>

                    {/* Gradient Fade for truncated content */}
                    {!isExpanded && isOverflowing && (
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-5 pt-2 pb-4 flex justify-between items-center border-t border-slate-50 mt-2 bg-slate-50/30">
                {announcement?.link ? (
                    <Link href={announcement.link} target="_blank" className="z-20">
                        <Button variant="ghost" size="sm" className={cn("gap-1.5 h-8 px-2 text-xs font-medium", config.textColor, "hover:bg-white hover:shadow-sm")}>
                            <ExternalLink className="h-3 w-3" />
                            {announcement.linkText || 'เปิดลิงก์'}
                        </Button>
                    </Link>
                ) : <div />}

                {/* Show Expand button only if content is long enough or already expanded */}
                {(isOverflowing || isExpanded) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-1 text-slate-400 hover:text-slate-700 h-8 px-2 text-xs"
                    >
                        {isExpanded ? (
                            <>ย่อ <ChevronUp className="h-3 w-3" /></>
                        ) : (
                            <>อ่านต่อ <ChevronDown className="h-3 w-3" /></>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
});

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
                ))}
            </div>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
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
            <AnnouncementCard
                announcement={announcements.announcement}
                slot="announcement"
                delay={300}
            />
        </section>
    );
}
