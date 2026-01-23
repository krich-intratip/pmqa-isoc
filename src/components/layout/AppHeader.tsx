'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
// CycleSelector ย้ายไปแสดงใน Dashboard แทน เพื่อไม่ให้รก Header
// import CycleSelector from '@/components/cycles/CycleSelector';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SearchDialog } from '@/components/search/SearchDialog';
import OnlineUsersButton from '@/components/collaboration/OnlineUsersButton';
import { ModeToggle } from '@/components/mode-toggle';

export default function AppHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    return (
        <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
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
                        <h1 className="text-lg font-bold text-foreground leading-tight">PMQA 4.0</h1>
                        <p className="text-xs text-muted-foreground">กอ.รมน. (Internal Security Operations Command)</p>
                    </div>
                </Link>

                {/* Right Side: Navigation/User */}
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">หน้าหลัก</Link>
                        <Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link>
                        <Link href="/guide" className="hover:text-primary transition-colors">คู่มือ</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">เกี่ยวกับ</Link>
                    </nav>

                    <div className="hidden md:block">
                        <SearchDialog />
                    </div>

                    {user && user.status === 'approved' && (
                        <div className="hidden lg:flex items-center gap-3">
                            <OnlineUsersButton />
                        </div>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            {user.status === 'approved' && <NotificationBell />}
                            <ModeToggle />
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center gap-2 hover:bg-muted rounded-lg p-2 transition-colors group"
                            >
                                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {user.displayName?.substring(0, 2) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-foreground hidden sm:inline-block font-medium group-hover:text-primary transition-colors">
                                    {user.displayName || user.email}
                                </span>
                            </button>
                            <Button onClick={logout} variant="outline" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 border-red-200 dark:border-red-800">
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
