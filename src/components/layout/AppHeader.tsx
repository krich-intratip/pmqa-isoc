'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo and Title */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                        <Image
                            src="/images/isoc-logo.png"
                            alt="ISOC Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">PMQA 4.0</h1>
                        <p className="text-xs text-slate-500">กอ.รมน. (Internal Security Operations Command)</p>
                    </div>
                </Link>

                {/* Right Side: Navigation/User */}
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">หน้าหลัก</Link>
                        <Link href="/guide" className="hover:text-indigo-600 transition-colors">คู่มือการใช้งาน</Link>
                        <Link href="/about" className="hover:text-indigo-600 transition-colors">เกี่ยวกับ</Link>
                    </nav>

                    {user ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <span className="text-sm text-slate-700 hidden sm:inline-block">{user.displayName || user.email}</span>
                            <Button onClick={logout} variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                                ออกจากระบบ
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                เข้าสู่ระบบ
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
