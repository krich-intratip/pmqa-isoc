'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
// import regression from 'regression'; // Use if installed, else fallback to simple logic

interface PredictiveScoreProps {
    scores: { year: number; score: number }[]; // e.g. [{year: 2566, score: 300}, {year: 2567, score: 350}]
}

export default function PredictiveScoreCard({ scores }: PredictiveScoreProps) {
    // Simple Linear Regression Logic (y = mx + b)
    const prediction = useMemo(() => {
        if (!scores || scores.length < 2) return null;

        const n = scores.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        scores.forEach(p => {
            sumX += p.year;
            sumY += p.score;
            sumXY += p.year * p.score;
            sumXX += p.year * p.year;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const nextYear = scores[scores.length - 1].year + 1;
        const predictedScore = Math.round(slope * nextYear + intercept);
        const trend = slope > 5 ? 'up' : slope < -5 ? 'down' : 'stable';

        return { nextYear, predictedScore, trend, slope };
    }, [scores]);

    if (!prediction) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>AI Predictive Scoring</CardTitle>
                    <CardDescription>ต้องการข้อมูลอย่างน้อย 2 ปีเพื่อพยากรณ์</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-100">
                    <TrendingUp className="h-5 w-5" />
                    Predictive Scoring (AI)
                </CardTitle>
                <CardDescription className="text-indigo-300">
                    การคาดการณ์คะแนนปี {prediction.nextYear}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline justify-between mb-4">
                    <div className="text-5xl font-bold tracking-tighter">
                        {prediction.predictedScore}
                        <span className="text-lg font-normal text-indigo-300 ml-1">/ 500</span>
                    </div>
                    {prediction.trend === 'up' && (
                        <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-0">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending Up
                        </Badge>
                    )}
                    {prediction.trend === 'down' && (
                        <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-0">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Declining
                        </Badge>
                    )}
                    {prediction.trend === 'stable' && (
                        <Badge className="bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 border-0">
                            <Minus className="h-3 w-3 mr-1" />
                            Stable
                        </Badge>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Historical Data</div>
                    <div className="flex gap-2 items-end h-24 pb-2 border-b border-white/10">
                        {scores.map((s) => (
                            <div key={s.year} className="flex-1 flex flex-col justify-end gap-1 group">
                                <div
                                    className="bg-indigo-500/50 hover:bg-indigo-400 transition-all rounded-t w-full relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    style={{ height: `${(s.score / 500) * 100}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded">
                                        {s.score}
                                    </div>
                                </div>
                                <div className="text-xs text-center text-indigo-300">{s.year}</div>
                            </div>
                        ))}
                        {/* Prediction Bar */}
                        <div className="flex-1 flex flex-col justify-end gap-1 group">
                            <div
                                className="bg-gradient-to-t from-amber-500 to-yellow-300 rounded-t w-full opacity-80 border-t-2 border-white/50 relative"
                                style={{ height: `${(prediction.predictedScore / 500) * 100}%` }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-yellow-300 bg-black/80 px-2 py-1 rounded">
                                    {prediction.predictedScore}
                                </div>
                            </div>
                            <div className="text-xs text-center text-yellow-300 font-bold">{prediction.nextYear}</div>
                        </div>
                    </div>
                    <p className="text-xs text-indigo-300 mt-2 italic">
                        *AI Estimate based on linear regression of last {scores.length} cycles.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
