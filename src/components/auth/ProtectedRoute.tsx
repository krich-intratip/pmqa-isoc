'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, initialize } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, [initialize]);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                if (pathname !== '/auth/login' && pathname !== '/auth/register') {
                    router.push('/auth/login');
                }
            } else {
                // User is logged in
                if (user.status === 'pending' && pathname !== '/auth/pending') {
                    // Maybe redirect to pending page if waiting approval?
                    // For now, allow access to profile or request page
                    if (pathname !== '/auth/register' && pathname !== '/auth/login') {
                        // If fully strictly pending, maybe block access
                        // But register/request page is where they submit request.
                        // If request submitted, maybe just wait.
                    }
                }

                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    router.push('/dashboard?error=unauthorized');
                }
            }
        }
    }, [user, loading, router, pathname, allowedRoles]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // If user is not logged in on protected page, we render null (effect handles redirect)
    if (!user && pathname !== '/auth/login' && pathname !== '/auth/register') {
        return null;
    }

    return <>{children}</>;
}
