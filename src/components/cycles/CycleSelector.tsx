'use client';

import { useEffect, useState } from 'react';
import { useCycleStore } from '@/stores/cycle-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';
import { AssessmentCycle } from '@/types/database';

interface CycleSelectorProps {
    compact?: boolean;
    className?: string;
}

export default function CycleSelector({ compact = false, className = '' }: CycleSelectorProps) {
    const { cycles, selectedCycle, loading, fetchCycles, setSelectedCycle } = useCycleStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (mounted && cycles.length === 0 && !loading) {
            fetchCycles();
        }
    }, [mounted]);

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                {!compact && <span className="text-sm text-muted-foreground">กำลังโหลด...</span>}
            </div>
        );
    }

    if (cycles.length === 0) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {!compact && (
                    <span className="text-sm text-muted-foreground">ยังไม่มีรอบการประเมิน</span>
                )}
            </div>
        );
    }

    const handleCycleChange = (cycleId: string) => {
        const cycle = cycles.find((c) => c.id === cycleId);
        if (cycle) {
            setSelectedCycle(cycle);
        }
    };

    const formatCycleName = (cycle: AssessmentCycle) => {
        if (compact) {
            return `${cycle.year}`;
        }
        return cycle.name || `รอบประเมิน ${cycle.year}`;
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { label: 'ร่าง', variant: 'secondary' as const },
            active: { label: 'ใช้งาน', variant: 'default' as const },
            completed: { label: 'เสร็จสิ้น', variant: 'outline' as const },
            archived: { label: 'เก็บถาวร', variant: 'outline' as const },
        };
        return statusMap[status as keyof typeof statusMap] || statusMap.draft;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select
                value={selectedCycle?.id || ''}
                onValueChange={handleCycleChange}
            >
                <SelectTrigger className={compact ? 'w-[120px] h-8 text-xs' : 'w-[280px]'}>
                    <SelectValue placeholder="เลือกรอบการประเมิน" />
                </SelectTrigger>
                <SelectContent>
                    {cycles.map((cycle) => {
                        const status = getStatusBadge(cycle.status);
                        return (
                            <SelectItem key={cycle.id} value={cycle.id}>
                                <div className="flex items-center justify-between w-full gap-3">
                                    <span className="flex-1">{formatCycleName(cycle)}</span>
                                    <Badge
                                        variant={status.variant}
                                        className="text-xs flex-shrink-0"
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
