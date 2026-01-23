/**
 * User Avatar Component with Online Indicator
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    displayName: string;
    email?: string;
    isOnline?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showIndicator?: boolean;
    className?: string;
}

export function UserAvatar({
    displayName,
    email,
    isOnline = false,
    size = 'md',
    showIndicator = true,
    className,
}: UserAvatarProps) {
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
    };

    const indicatorSizes = {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
    };

    return (
        <div className={cn('relative inline-block', className)}>
            <Avatar className={sizeClasses[size]}>
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>

            {showIndicator && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
                        indicatorSizes[size],
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                    )}
                    title={isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                />
            )}
        </div>
    );
}
