'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, User, BarChart2, Shield, BookOpen, ChevronRight, Filter } from 'lucide-react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';

interface SearchResult {
    id: string;
    type: 'evidence' | 'kpi' | 'user' | 'sar' | 'page';
    title: string;
    subtitle?: string;
    url: string;
    category?: string;
}

type FilterType = 'all' | 'page' | 'evidence' | 'kpi' | 'sar' | 'user';

const filterConfig: { value: FilterType; label: string; icon?: React.ReactNode }[] = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'page', label: 'หน้า' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'kpi', label: 'KPI' },
    { value: 'sar', label: 'SAR' },
    { value: 'user', label: 'ผู้ใช้' },
];

// Highlight matching text
function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
            : part
    );
}

export function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [queryText, setQueryText] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const router = useRouter();
    const { user } = useAuth();

    // Toggle with keyboard shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Reset filter when dialog opens
    useEffect(() => {
        if (open) {
            setActiveFilter('all');
        }
    }, [open]);

    // Search effect
    useEffect(() => {
        if (!queryText.trim() || !open) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(queryText);
        }, 300);

        return () => clearTimeout(timer);
    }, [queryText, open]);

    // Filter results
    const filteredResults = useMemo(() => {
        if (activeFilter === 'all') return results;
        return results.filter(r => r.type === activeFilter);
    }, [results, activeFilter]);

    const performSearch = async (text: string) => {
        if (!user) return;
        setLoading(true);
        const searchResults: SearchResult[] = [];
        const lowerText = text.toLowerCase();

        // 1. Static Pages
        const pages = [
            { title: 'Dashboard', url: '/dashboard', desc: 'หน้าหลักและภาพรวม' },
            { title: 'Roadmap', url: '/roadmap', desc: 'เส้นทางการประเมิน' },
            { title: 'Evidence (หมวด 1-6)', url: '/phase1/evidence', desc: 'จัดการหลักฐาน' },
            { title: 'KPI Dictionary', url: '/phase2/kpi-dictionary', desc: 'พจนานุกรมตัวชี้วัด' },
            { title: 'Context Pack', url: '/phase3/context-pack', desc: 'บริบทองค์กร' },
            { title: 'SAR Writer', url: '/phase4/sar-writer', desc: 'เขียนรายงาน SAR' },
            { title: 'Cross-Consistency Auditor', url: '/phase6/consistency-auditor', desc: 'ตรวจสอบความสอดคล้อง' },
            { title: 'Score Simulator', url: '/phase6/score-simulator', desc: 'จำลองคะแนนและวางแผน' },
            { title: 'Interview Brief', url: '/phase7/interview-brief', desc: 'เตรียมพร้อมสัมภาษณ์' },
            { title: 'Q&A Bank', url: '/phase7/qa-bank', desc: 'คลังคำถาม-คำตอบ' },
        ];

        pages.forEach(p => {
            if (p.title.toLowerCase().includes(lowerText) || p.desc.toLowerCase().includes(lowerText)) {
                searchResults.push({
                    id: p.url,
                    type: 'page',
                    title: p.title,
                    subtitle: p.desc,
                    url: p.url
                });
            }
        });

        // 2. Search Firestore collections (only if query is long enough)
        if (text.length > 2) {
            try {
                // Search Users
                const usersRef = collection(db, 'users');
                const usersSnap = await getDocs(query(usersRef, limit(20)));

                usersSnap.forEach(doc => {
                    const userData = doc.data();
                    const name = userData.displayName || '';
                    const email = userData.email || '';

                    if (name.toLowerCase().includes(lowerText) || email.toLowerCase().includes(lowerText)) {
                        searchResults.push({
                            id: doc.id,
                            type: 'user',
                            title: name,
                            subtitle: email,
                            url: `/admin/users?q=${email}`,
                            category: 'Users'
                        });
                    }
                });

                // Search Evidence
                const evidenceRef = collection(db, 'evidence');
                const evidenceSnap = await getDocs(query(evidenceRef, limit(30)));

                evidenceSnap.forEach(doc => {
                    const evData = doc.data();
                    const title = evData.description || evData.fileName || '';
                    const code = evData.evidenceCode || '';

                    if (title.toLowerCase().includes(lowerText) || code.toLowerCase().includes(lowerText)) {
                        searchResults.push({
                            id: doc.id,
                            type: 'evidence',
                            title: code,
                            subtitle: title,
                            url: `/phase1/evidence?id=${doc.id}`,
                            category: 'Evidence'
                        });
                    }
                });

                // Search KPI Definitions
                const kpiRef = collection(db, 'kpi_definitions');
                const kpiSnap = await getDocs(query(kpiRef, limit(30)));

                kpiSnap.forEach(doc => {
                    const kpiData = doc.data();
                    const kpiCode = kpiData.kpiCode || '';
                    const kpiName = kpiData.kpiName || kpiData.name || '';
                    const category = kpiData.category || '';

                    if (
                        kpiCode.toLowerCase().includes(lowerText) ||
                        kpiName.toLowerCase().includes(lowerText) ||
                        category.toLowerCase().includes(lowerText)
                    ) {
                        searchResults.push({
                            id: doc.id,
                            type: 'kpi',
                            title: kpiCode || kpiName,
                            subtitle: kpiName,
                            url: `/phase2/kpi-dictionary?kpi=${doc.id}`,
                            category: category || 'KPI'
                        });
                    }
                });

                // Search SAR Contents
                const sarRef = collection(db, 'sar_contents');
                const sarSnap = await getDocs(query(sarRef, limit(30)));

                sarSnap.forEach(doc => {
                    const sarData = doc.data();
                    const categoryName = sarData.categoryName || sarData.category || '';
                    const content = sarData.content || '';
                    const sectionName = sarData.sectionName || '';

                    if (
                        categoryName.toLowerCase().includes(lowerText) ||
                        content.toLowerCase().includes(lowerText) ||
                        sectionName.toLowerCase().includes(lowerText)
                    ) {
                        searchResults.push({
                            id: doc.id,
                            type: 'sar',
                            title: categoryName || sectionName || 'SAR Content',
                            subtitle: content.substring(0, 80) + (content.length > 80 ? '...' : ''),
                            url: `/phase4/sar-writer?section=${doc.id}`,
                            category: 'SAR'
                        });
                    }
                });

            } catch (error) {
                console.error('Search error:', error);
            }
        }

        setResults(searchResults);
        setLoading(false);
    };

    const handleSelect = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    const getTypeIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'page': return <FileText className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />;
            case 'evidence': return <Shield className="w-5 h-5 text-orange-600" />;
            case 'kpi': return <BarChart2 className="w-5 h-5 text-blue-600" />;
            case 'sar': return <BookOpen className="w-5 h-5 text-purple-600" />;
            case 'user': return <User className="w-5 h-5 text-green-600" />;
        }
    };

    const getTypeBadge = (type: SearchResult['type']) => {
        const styles: Record<string, string> = {
            page: 'bg-slate-100 text-slate-700',
            evidence: 'bg-orange-100 text-orange-700',
            kpi: 'bg-blue-100 text-blue-700',
            sar: 'bg-purple-100 text-purple-700',
            user: 'bg-green-100 text-green-700',
        };
        const labels: Record<string, string> = {
            page: 'หน้า',
            evidence: 'Evidence',
            kpi: 'KPI',
            sar: 'SAR',
            user: 'ผู้ใช้',
        };
        return <Badge variant="secondary" className={`${styles[type]} text-[10px] px-1.5 py-0`}>{labels[type]}</Badge>;
    };

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="relative hidden md:flex items-center w-64 h-9 px-3 rounded-md border border-border bg-muted text-muted-foreground cursor-text hover:bg-muted/80 hover:text-foreground transition-colors mr-4"
            >
                <Search className="h-4 w-4 mr-2" />
                <span className="text-sm">ค้นหา...</span>
                <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
                    <DialogHeader className="px-4 py-4 border-b">
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-slate-400" />
                            <Input
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                placeholder="พิมพ์เพื่อค้นหา Pages, Evidence, KPI, SAR..."
                                className="border-none shadow-none focus-visible:ring-0 text-base h-auto p-0 placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>
                    </DialogHeader>

                    {/* Filter Tabs */}
                    {results.length > 0 && (
                        <div className="px-3 py-2 border-b bg-muted flex items-center gap-1 overflow-x-auto">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 flex-shrink-0" />
                            {filterConfig.map((filter) => {
                                const count = filter.value === 'all'
                                    ? results.length
                                    : results.filter(r => r.type === filter.value).length;
                                if (count === 0 && filter.value !== 'all') return null;

                                return (
                                    <button
                                        key={filter.value}
                                        onClick={() => setActiveFilter(filter.value)}
                                        className={`px-2.5 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${activeFilter === filter.value
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-background border text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        {filter.label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <ScrollArea className="max-h-[60vh]">
                        {loading ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p>กำลังค้นหา...</p>
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <div className="p-2 space-y-1">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md flex justify-between">
                                    <span>ผลการค้นหา</span>
                                    <span>{filteredResults.length} รายการ</span>
                                </div>
                                {filteredResults.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result.url)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors group"
                                    >
                                        <div className="p-2 bg-card border rounded-md group-hover:border-indigo-200 dark:group-hover:border-indigo-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors">
                                            {getTypeIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground group-hover:text-indigo-700 dark:group-hover:text-indigo-400 truncate">
                                                    {highlightText(result.title, queryText)}
                                                </span>
                                                {getTypeBadge(result.type)}
                                            </div>
                                            {result.subtitle && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {highlightText(result.subtitle, queryText)}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        ) : queryText ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <p>ไม่พบผลการค้นหาสำหรับ "{queryText}"</p>
                                <p className="text-xs mt-1 text-muted-foreground/70">ลองค้นหาด้วยคำอื่น หรือพิมพ์มากกว่า 2 ตัวอักษร</p>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground/70">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>พิมพ์เพื่อเริ่มค้นหา</p>
                                <p className="text-xs mt-1">ค้นหา เมนู, Evidence, KPI, SAR, หรือผู้ใช้งาน</p>
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-2 border-t bg-muted text-[10px] text-muted-foreground flex justify-end gap-3 px-4">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-background border text-muted-foreground px-1 rounded">↓</kbd>
                            <kbd className="bg-background border text-muted-foreground px-1 rounded">↑</kbd>
                            เลือก
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-background border text-muted-foreground px-1 rounded">↵</kbd>
                            ไป
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-background border text-muted-foreground px-1 rounded">esc</kbd>
                            ปิด
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

