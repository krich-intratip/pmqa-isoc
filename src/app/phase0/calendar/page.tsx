'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ThaiUtils from '@/lib/utils/thai-utils';

// PMQA Submission Schedule Template
const SUBMISSION_SCHEDULE = [
    {
        phase: 0, name: 'Phase 0: Foundation', tasks: [
            { id: 'p0-1', name: 'ตั้งค่าโครงสร้างหน่วยงาน', dueOffset: 7, category: 'Setup' },
            { id: 'p0-2', name: 'กำหนดผู้รับผิดชอบ (Owner Matrix)', dueOffset: 14, category: 'Setup' },
            { id: 'p0-3', name: 'สร้าง Repository หลักฐาน', dueOffset: 14, category: 'Setup' },
        ]
    },
    {
        phase: 1, name: 'Phase 1: Evidence', tasks: [
            { id: 'p1-1', name: 'นำเข้าหลักฐานหมวด 1-3', dueOffset: 30, category: 'Evidence' },
            { id: 'p1-2', name: 'นำเข้าหลักฐานหมวด 4-6', dueOffset: 45, category: 'Evidence' },
            { id: 'p1-3', name: 'นำเข้าหลักฐานหมวด 7 (ผลลัพธ์)', dueOffset: 60, category: 'Evidence' },
            { id: 'p1-4', name: 'ตรวจสอบช่องว่าง & แก้ไข', dueOffset: 75, category: 'QA' },
        ]
    },
    {
        phase: 2, name: 'Phase 2: Data Management', tasks: [
            { id: 'p2-1', name: 'รวบรวมข้อมูล KPI', dueOffset: 90, category: 'Data' },
            { id: 'p2-2', name: 'ทำความสะอาดข้อมูล', dueOffset: 100, category: 'Data' },
        ]
    },
    {
        phase: 3, name: 'Phase 3: Analysis', tasks: [
            { id: 'p3-1', name: 'วิเคราะห์บริบทองค์กร', dueOffset: 110, category: 'Analysis' },
            { id: 'p3-2', name: 'เชื่อมโยงยุทธศาสตร์-KPI', dueOffset: 120, category: 'Analysis' },
        ]
    },
    {
        phase: 4, name: 'Phase 4: SAR Writing', tasks: [
            { id: 'p4-1', name: 'เขียน SAR หมวด 1-3', dueOffset: 140, category: 'Writing' },
            { id: 'p4-2', name: 'เขียน SAR หมวด 4-6', dueOffset: 160, category: 'Writing' },
            { id: 'p4-3', name: 'เขียน SAR หมวด 7', dueOffset: 170, category: 'Writing' },
        ]
    },
    {
        phase: 5, name: 'Phase 5: Results', tasks: [
            { id: 'p5-1', name: 'จัดทำ Data Pack ผลลัพธ์', dueOffset: 180, category: 'Results' },
        ]
    },
    {
        phase: 6, name: 'Phase 6: QA', tasks: [
            { id: 'p6-1', name: 'ตรวจสอบความสอดคล้อง', dueOffset: 190, category: 'QA' },
            { id: 'p6-2', name: 'จำลองคะแนน', dueOffset: 195, category: 'QA' },
        ]
    },
    {
        phase: 7, name: 'Phase 7: Interview Prep', tasks: [
            { id: 'p7-1', name: 'เตรียมเอกสารสัมภาษณ์', dueOffset: 200, category: 'Prep' },
            { id: 'p7-2', name: 'ซ้อมคำถาม-คำตอบ', dueOffset: 210, category: 'Prep' },
        ]
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Setup': 'bg-blue-100 text-blue-800',
    'Evidence': 'bg-green-100 text-green-800',
    'Data': 'bg-yellow-100 text-yellow-800',
    'Analysis': 'bg-purple-100 text-purple-800',
    'Writing': 'bg-indigo-100 text-indigo-800',
    'Results': 'bg-orange-100 text-orange-800',
    'QA': 'bg-red-100 text-red-800',
    'Prep': 'bg-teal-100 text-teal-800',
};

export default function SubmissionCalendarPage() {
    const [startDate] = useState(new Date());
    const [selectedYear, setSelectedYear] = useState((new Date().getFullYear() + 543).toString());

    const generateSchedule = () => {
        const schedule: { task: typeof SUBMISSION_SCHEDULE[0]['tasks'][0]; dueDate: Date; phase: string }[] = [];

        SUBMISSION_SCHEDULE.forEach(phase => {
            phase.tasks.forEach(task => {
                const dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + task.dueOffset);
                schedule.push({ task, dueDate, phase: phase.name });
            });
        });

        return schedule.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    };

    const schedule = generateSchedule();

    const getStatus = (dueDate: Date) => {
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return { status: 'overdue', label: 'เลยกำหนด', color: 'text-red-600' };
        if (days <= 7) return { status: 'urgent', label: `อีก ${days} วัน`, color: 'text-orange-600' };
        if (days <= 30) return { status: 'soon', label: `อีก ${days} วัน`, color: 'text-yellow-600' };
        return { status: 'ok', label: `อีก ${days} วัน`, color: 'text-green-600' };
    };

    const exportToCSV = () => {
        const headers = ['ลำดับ', 'Phase', 'งาน', 'กำหนดส่ง', 'หมวดหมู่'];
        const rows = schedule.map((item, idx) => [
            idx + 1,
            item.phase,
            item.task.name,
            ThaiUtils.DateTime.formatThai(item.dueDate),
            item.task.category
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `PMQA_Calendar_${selectedYear}.csv`;
        link.click();

        toast.success('ดาวน์โหลด CSV สำเร็จ');
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                            <Calendar className="h-8 w-8 text-amber-600" />
                            Submission Calendar
                        </h1>
                        <p className="text-muted-foreground">ตารางกำหนดการส่งงาน PMQA (App 0.4)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2569">ปี 2569</SelectItem>
                                <SelectItem value="2570">ปี 2570</SelectItem>
                                <SelectItem value="2571">ปี 2571</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={exportToCSV} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-sm text-muted-foreground">เลยกำหนด</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                                {schedule.filter(s => getStatus(s.dueDate).status === 'overdue').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <span className="text-sm text-muted-foreground">เร่งด่วน (≤7 วัน)</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {schedule.filter(s => getStatus(s.dueDate).status === 'urgent').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm text-muted-foreground">ใกล้ถึง (≤30 วัน)</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {schedule.filter(s => getStatus(s.dueDate).status === 'soon').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-muted-foreground">ปกติ</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {schedule.filter(s => getStatus(s.dueDate).status === 'ok').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>ตารางงาน ({schedule.length} รายการ)</CardTitle>
                        <CardDescription>เรียงตามวันกำหนดส่ง</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Phase</TableHead>
                                    <TableHead>งาน</TableHead>
                                    <TableHead>หมวดหมู่</TableHead>
                                    <TableHead>กำหนดส่ง</TableHead>
                                    <TableHead className="text-right">สถานะ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map((item, idx) => {
                                    const status = getStatus(item.dueDate);
                                    return (
                                        <TableRow key={item.task.id}>
                                            <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.phase.split(':')[0]}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{item.task.name}</TableCell>
                                            <TableCell>
                                                <Badge className={CATEGORY_COLORS[item.task.category]}>
                                                    {item.task.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{ThaiUtils.DateTime.formatThai(item.dueDate, 'short')}</TableCell>
                                            <TableCell className={`text-right font-medium ${status.color}`}>
                                                {status.label}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
