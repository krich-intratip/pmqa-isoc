import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset Empty States
export function NoDataEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg">ไม่พบข้อมูล</p>
      {onAction && (
        <Button onClick={onAction} variant="outline" className="mt-4">
          โหลดข้อมูลใหม่
        </Button>
      )}
    </div>
  );
}

export function NoCycleSelectedEmptyState() {
  return (
    <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
      <p className="text-yellow-800 font-medium">ยังไม่ได้เลือกรอบการประเมิน</p>
      <p className="text-yellow-700 text-sm mt-1">
        กรุณาเลือกรอบการประเมินจาก Header ด้านบน
      </p>
    </div>
  );
}

export function NoPermissionEmptyState() {
  return (
    <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
      <p className="text-red-800 font-medium">คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้</p>
      <p className="text-red-700 text-sm mt-1">
        กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์
      </p>
    </div>
  );
}
