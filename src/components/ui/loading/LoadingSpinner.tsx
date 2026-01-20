import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

// Full page loading
export function PageLoading({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Inline loading
export function InlineLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Overlay loading
export function OverlayLoading({ text = 'กำลังประมวลผล...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
}
