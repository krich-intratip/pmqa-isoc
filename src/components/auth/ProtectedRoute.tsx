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
                // User is logged in - check status and roles
                if (user.status === 'pending') {
                    // Pending users can only access profile page to view their status
                    const allowedPendingPaths = ['/profile', '/auth/login', '/auth/register'];
                    if (!allowedPendingPaths.includes(pathname)) {
                        router.push('/profile?status=pending');
                    }
                } else if (user.status === 'rejected' || user.status === 'disabled') {
                    // Rejected or disabled users should be logged out or shown error
                    router.push('/auth/login?error=account_disabled');
                } else if (user.status === 'approved') {
                    // Check role-based access for approved users
                    if (allowedRoles && !allowedRoles.includes(user.role)) {
                        router.push('/dashboard?error=unauthorized');
                    }
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
