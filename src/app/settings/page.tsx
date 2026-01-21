'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bot, Palette, User } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">การตั้งค่า (Settings)</h1>

            <div className="grid gap-6">
                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-purple-600" />
                            การแสดงผล (Appearance)
                        </CardTitle>
                        <CardDescription>ปรับแต่งธีมและการแสดงผลของระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground">เลือกโหมดสว่าง (Light), มืด (Dark) หรือตามระบบ</p>
                        </div>
                        <ModeToggle />
                    </CardContent>
                </Card>

                {/* Navigation Links */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/settings/ai" className="block">
                        <Card className="h-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-blue-600" />
                                    ตั้งค่า AI Connection
                                </CardTitle>
                                <CardDescription>จัดการ Google Gemini API Key และเลือกรุ่นโมเดล</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/profile" className="block">
                        <Card className="h-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    จัดการโปรไฟล์
                                </CardTitle>
                                <CardDescription>แก้ไขข้อมูลส่วนตัว รหัสผ่าน และข้อมูลหน่วยงาน</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
