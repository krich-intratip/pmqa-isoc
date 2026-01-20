'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar, Target, FileText, Database, BarChart, FileCheck,
    MessageSquare, CheckCircle2, ArrowDown, Info, Play
} from 'lucide-react';
import Link from 'next/link';
import { APP_VERSION } from '@/config/version';

const phases = [
    {
        id: 'phase0',
        number: 0,
        title: 'การเตรียมการ',
        description: 'จัดตั้งทีม กำหนด Timeline และเตรียมโครงสร้างพื้นฐาน',
        icon: Calendar,
        color: 'bg-slate-500',
        duration: '2-4 สัปดาห์',
        tools: [
            { name: 'Calendar', path: '/phase0/calendar', description: 'ปฏิทินการประเมิน' },
            { name: 'Repository Setup', path: '/phase0/repository-setup', description: 'จัดระเบียบเอกสาร' },
            { name: 'Owner Matrix', path: '/phase0/owner-matrix', description: 'กำหนดผู้รับผิดชอบ' },
            { name: 'Network Mapper', path: '/phase0/network-mapper', description: 'แผนที่เครือข่าย' }
        ],
        deliverables: [
            'ทีมงาน PMQA พร้อมบทบาทหน้าที่',
            'ปฏิทินการดำเนินงาน',
            'โครงสร้างพื้นฐานระบบ',
            'แผนผังผู้รับผิดชอบ'
        ]
    },
    {
        id: 'phase1',
        number: 1,
        title: 'การประเมินช่องว่าง',
        description: 'วิเคราะห์ความพร้อม ระบุช่องว่าง และจัดหาหลักฐาน',
        icon: Target,
        color: 'bg-red-500',
        duration: '3-6 สัปดาห์',
        tools: [
            { name: 'Gap Analyzer', path: '/phase1/gap-analyzer', description: 'วิเคราะห์ช่องว่าง' },
            { name: 'Gap Tracker', path: '/phase1/gap-tracker', description: 'ติดตามแก้ไข' },
            { name: 'Gate Checker', path: '/phase1/gate-checker', description: 'ตรวจสอบเกณฑ์' },
            { name: 'Evidence', path: '/phase1/evidence', description: 'จัดเก็บหลักฐาน' }
        ],
        deliverables: [
            'รายงานการประเมินช่องว่าง',
            'แผนปิดช่องว่าง',
            'หลักฐานเบื้องต้น',
            'เกณฑ์ Gate ที่ผ่าน'
        ]
    },
    {
        id: 'phase2',
        number: 2,
        title: 'การเก็บข้อมูล',
        description: 'รวบรวมและจัดการข้อมูลจริงจากการดำเนินงาน',
        icon: Database,
        color: 'bg-orange-500',
        duration: '4-8 สัปดาห์',
        tools: [
            { name: 'Data Collector', path: '/phase2/data-collector', description: 'เครื่องมือเก็บข้อมูล' },
            { name: 'Excel Templates', path: '/phase2/excel-templates', description: 'Template Excel' },
            { name: 'Data Cleaning', path: '/phase2/data-cleaning', description: 'ทำความสะอาดข้อมูล' },
            { name: 'KPI Dictionary', path: '/phase2/kpi-dictionary', description: 'พจนานุกรม KPI' },
            { name: 'Baseline Analyzer', path: '/phase2/baseline-analyzer', description: 'วิเคราะห์ Baseline' },
            { name: 'Data Catalog', path: '/phase2/data-catalog', description: 'แค็ตตาล็อกข้อมูล' }
        ],
        deliverables: [
            'ข้อมูลผลการดำเนินงาน',
            'KPI และตัวชี้วัด',
            'Baseline ข้อมูล',
            'ฐานข้อมูลที่สะอาด'
        ]
    },
    {
        id: 'phase3',
        number: 3,
        title: 'การวิเคราะห์บริบท',
        description: 'วิเคราะห์ความเชื่อมโยง ความเสี่ยง และบริบทองค์กร',
        icon: BarChart,
        color: 'bg-yellow-500',
        duration: '2-4 สัปดาห์',
        tools: [
            { name: 'Context Pack', path: '/phase3/context-pack', description: 'ชุดข้อมูลบริบท' },
            { name: 'Risk Analyzer', path: '/phase3/risk-analyzer', description: 'วิเคราะห์ความเสี่ยง' },
            { name: 'Strategy Linker', path: '/phase3/strategy-linker', description: 'เชื่อมยุทธศาสตร์' }
        ],
        deliverables: [
            'บริบทองค์กร',
            'ความเสี่ยงและโอกาส',
            'ความเชื่อมโยงยุทธศาสตร์',
            'ผู้มีส่วนได้ส่วนเสีย'
        ]
    },
    {
        id: 'phase4',
        number: 4,
        title: 'การเขียน SAR',
        description: 'เขียนรายงานการประเมินตนเองอย่างเป็นระบบ',
        icon: FileText,
        color: 'bg-green-500',
        duration: '3-6 สัปดาห์',
        tools: [
            { name: 'SAR Outline', path: '/phase4/sar-outline', description: 'โครงร่าง SAR' },
            { name: 'SAR Writer', path: '/phase4/sar-writer', description: 'ช่วยเขียน SAR' }
        ],
        deliverables: [
            'SAR ฉบับสมบูรณ์',
            'หลักฐานอ้างอิง',
            'ภาคผนวก',
            'SAR ตามโครงสร้าง PMQA'
        ]
    },
    {
        id: 'phase5',
        number: 5,
        title: 'การจัดทำผลลัพธ์',
        description: 'สรุปผลลัพธ์และจัดทำเอกสารประกอบ',
        icon: FileCheck,
        color: 'bg-teal-500',
        duration: '2-3 สัปดาห์',
        tools: [
            { name: 'Results Pack', path: '/phase5/results-pack', description: 'ชุดผลลัพธ์' },
            { name: 'Recovery Narrative', path: '/phase5/recovery-narrative', description: 'เล่าเรื่องการฟื้นฟู' }
        ],
        deliverables: [
            'ชุดผลลัพธ์',
            'กรณีศึกษา',
            'Success Stories',
            'เอกสารประกอบ'
        ]
    },
    {
        id: 'phase6',
        number: 6,
        title: 'การตรวจสอบ',
        description: 'ตรวจสอบความสอดคล้อง คำนวณคะแนน และเตรียมพร้อม',
        icon: CheckCircle2,
        color: 'bg-blue-500',
        duration: '2-3 สัปดาห์',
        tools: [
            { name: 'Consistency Auditor', path: '/phase6/consistency-auditor', description: 'ตรวจสอบความสอดคล้อง' },
            { name: 'Score Simulator', path: '/phase6/score-simulator', description: 'จำลองคะแนน' }
        ],
        deliverables: [
            'ผลการตรวจสอบ',
            'คะแนนประเมิน',
            'จุดที่ต้องแก้ไข',
            'เอกสารพร้อมส่ง'
        ]
    },
    {
        id: 'phase7',
        number: 7,
        title: 'การนำเสนอ',
        description: 'เตรียมนำเสนอและตอบคำถามคณะกรรมการ',
        icon: MessageSquare,
        color: 'bg-purple-500',
        duration: '1-2 สัปดาห์',
        tools: [
            { name: 'Interview Brief', path: '/phase7/interview-brief', description: 'เตรียมสัมภาษณ์' },
            { name: 'Q&A Bank', path: '/phase7/qa-bank', description: 'คลังคำถาม-คำตอบ' }
        ],
        deliverables: [
            'สไลด์นำเสนอ',
            'คำถาม-คำตอบ',
            'เอกสารประกอบ',
            'ทีมพร้อมนำเสนอ'
        ]
    }
];

export default function AssessmentRoadmapPage() {
    const [selectedPhase, setSelectedPhase] = useState(phases[0]);

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold">Assessment Roadmap</h1>
                    <Badge variant="outline" className="text-sm">
                        Version {APP_VERSION.version}
                    </Badge>
                </div>
                <p className="text-muted-foreground">
                    แผนที่เส้นทางการประเมิน PMQA แบบ Interactive - ทุก Phase มีเครื่องมือช่วยงานพร้อมใช้
                </p>
            </div>

            {/* Overview Card */}
            <Card className="mb-8 border-indigo-200 bg-indigo-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-700">
                        <Info className="h-5 w-5" />
                        ภาพรวมกระบวนการ
                    </CardTitle>
                    <CardDescription>อัปเดตล่าสุด: {APP_VERSION.releaseDate}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">ระยะเวลารวม</p>
                            <p className="text-2xl font-bold text-indigo-700">16-32 สัปดาห์</p>
                            <p className="text-xs text-muted-foreground">ประมาณ 4-8 เดือน</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">จำนวน Phase</p>
                            <p className="text-2xl font-bold text-indigo-700">8 Phases</p>
                            <p className="text-xs text-muted-foreground">จากเตรียมการถึงนำเสนอ</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">เครื่องมือทั้งหมด</p>
                            <p className="text-2xl font-bold text-indigo-700">18 Tools</p>
                            <p className="text-xs text-muted-foreground">พร้อมใช้งานทันที</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">รองรับ Cycle</p>
                            <p className="text-2xl font-bold text-indigo-700">✓ หลายรอบ</p>
                            <p className="text-xs text-muted-foreground">แยกข้อมูลแต่ละรอบ</p>
                        </div>
                    </div>

                    {/* New Features Highlight */}
                    {APP_VERSION.releases[`v${APP_VERSION.version}`] && (
                        <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
                            <h4 className="font-semibold text-sm text-indigo-800 mb-2">✨ ฟีเจอร์ใหม่ใน v{APP_VERSION.version}</h4>
                            <ul className="text-xs text-slate-600 space-y-1">
                                {APP_VERSION.releases[`v${APP_VERSION.version}`].features.map((feature, idx) => (
                                    <li key={idx}>• {feature.description}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="flow" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="flow">Flow Chart</TabsTrigger>
                    <TabsTrigger value="details">Phase Details</TabsTrigger>
                </TabsList>

                {/* Flow Chart View */}
                <TabsContent value="flow" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {phases.map((phase, index) => {
                            const Icon = phase.icon;
                            return (
                                <div key={phase.id} className="relative">
                                    <Card
                                        className={`hover:shadow-lg transition-all cursor-pointer border-2 ${selectedPhase.id === phase.id
                                            ? 'border-indigo-500 shadow-md'
                                            : 'border-transparent'
                                            }`}
                                        onClick={() => setSelectedPhase(phase)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`${phase.color} text-white p-3 rounded-lg`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline">Phase {phase.number}</Badge>
                                                            <Badge className={phase.color + ' text-white'}>
                                                                {phase.duration}
                                                            </Badge>
                                                        </div>
                                                        <CardTitle className="text-lg">{phase.title}</CardTitle>
                                                        <CardDescription>{phase.description}</CardDescription>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPhase(phase);
                                                    }}
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {phase.tools.map((tool) => (
                                                    <Link key={tool.path} href={tool.path}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-start text-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Play className="h-3 w-3 mr-1" />
                                                            {tool.name}
                                                        </Button>
                                                    </Link>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Arrow between phases */}
                                    {index < phases.length - 1 && (
                                        <div className="flex justify-center py-2">
                                            <ArrowDown className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Details View */}
                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Phase List */}
                        <div className="lg:col-span-1 space-y-2">
                            {phases.map((phase) => {
                                const Icon = phase.icon;
                                return (
                                    <Card
                                        key={phase.id}
                                        className={`cursor-pointer hover:shadow-md transition-all ${selectedPhase.id === phase.id
                                            ? 'border-indigo-500 border-2'
                                            : ''
                                            }`}
                                        onClick={() => setSelectedPhase(phase)}
                                    >
                                        <CardHeader className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`${phase.color} text-white p-2 rounded-lg`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <Badge variant="outline" className="mb-1">
                                                        Phase {phase.number}
                                                    </Badge>
                                                    <p className="font-semibold text-sm">{phase.title}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Phase Details */}
                        <div className="lg:col-span-2">
                            <Card className="border-indigo-200">
                                <CardHeader>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`${selectedPhase.color} text-white p-4 rounded-lg`}>
                                            {(() => {
                                                const Icon = selectedPhase.icon;
                                                return <Icon className="h-8 w-8" />;
                                            })()}
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="mb-2">
                                                Phase {selectedPhase.number}
                                            </Badge>
                                            <CardTitle className="text-2xl">{selectedPhase.title}</CardTitle>
                                            <CardDescription className="text-base mt-1">
                                                {selectedPhase.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge className={selectedPhase.color + ' text-white'}>
                                        ระยะเวลา: {selectedPhase.duration}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Tools */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Play className="h-4 w-4" />
                                            เครื่องมือที่ใช้
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedPhase.tools.map((tool) => (
                                                <Link key={tool.path} href={tool.path}>
                                                    <Card className="hover:shadow-md transition-shadow hover:border-indigo-300 cursor-pointer h-full">
                                                        <CardHeader className="p-4">
                                                            <CardTitle className="text-sm flex items-center gap-2">
                                                                <Play className="h-3 w-3 text-indigo-600" />
                                                                {tool.name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {tool.description}
                                                            </CardDescription>
                                                        </CardHeader>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deliverables */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            ผลลัพธ์ที่ได้
                                        </h3>
                                        <ul className="space-y-2">
                                            {selectedPhase.deliverables.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                                                    <span className="text-sm">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
