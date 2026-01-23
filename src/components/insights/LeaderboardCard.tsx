'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trophy, Medal, Lock } from 'lucide-react';

interface UnitScore {
    id: string;
    name: string;
    progress: number;
    score: number;
    avatar?: string;
}

const MOCK_LEADERBOARD_DATA: UnitScore[] = [
    { id: '1', name: 'กองบริหารจัดการ (Admin Div)', progress: 95, score: 480 },
    { id: '2', name: 'ศูนย์เทคโนโลยีสารสนเทศ (IT Center)', progress: 88, score: 450 },
    { id: '3', name: 'สำนักนโยบายและแผน (Policy Bureau)', progress: 82, score: 420 },
    { id: '4', name: 'ฝ่ายทรัพยากรบุคคล (HR Dept)', progress: 75, score: 390 },
    { id: '5', name: 'กลุ่มงานตรวจสอบภายใน (Audit Group)', progress: 60, score: 350 },
];

export default function LeaderboardCard() {
    const [anonymousMode, setAnonymousMode] = useState(false);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Department Ranking
                    </CardTitle>
                    <CardDescription>จัดอันดับความก้าวหน้า (Gamification)</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="anonymous-mode" checked={anonymousMode} onCheckedChange={setAnonymousMode} />
                    <Label htmlFor="anonymous-mode" className="text-xs text-muted-foreground">Anonymous</Label>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-4">
                    {MOCK_LEADERBOARD_DATA.map((unit, index) => (
                        <div key={unit.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-8 text-center font-bold text-slate-500">
                                    {index === 0 && <Medal className="h-6 w-6 text-yellow-500 mx-auto" />}
                                    {index === 1 && <Medal className="h-6 w-6 text-slate-400 mx-auto" />}
                                    {index === 2 && <Medal className="h-6 w-6 text-amber-700 mx-auto" />}
                                    {index > 2 && `#${index + 1}`}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 flex items-center gap-2">
                                        {anonymousMode ? (
                                            <>
                                                <Lock className="h-3 w-3 text-slate-400" />
                                                <span className="text-slate-500 italic">Unit {String.fromCharCode(65 + index)}</span>
                                            </>
                                        ) : (
                                            unit.name
                                        )}
                                        {index === 0 && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Top Performer</Badge>}
                                    </div>
                                    <div className="text-xs text-slate-500">Progress: {unit.progress}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-indigo-600">{unit.score}</div>
                                <div className="text-xs text-slate-400">Points</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
