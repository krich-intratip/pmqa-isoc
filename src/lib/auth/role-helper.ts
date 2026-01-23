import type { User } from '@/types/database';

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CENTRAL_ADMIN: 'central_admin',
    REGIONAL: 'regional_coordinator',
    PROVINCIAL: 'provincial_staff',
    DATA_OWNER: 'data_owner',
    REVIEWER: 'reviewer',
    READ_ONLY: 'read_only'
} as const;

export const UNIT_TYPES = {
    CENTRAL: 'Central',
    REGIONAL: 'Regional',
    PROVINCIAL: 'Provincial',
    CENTER: 'Center',
    DIRECT_UNIT: 'DirectUnit'
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN] as const;

export const canManageUsers = (role: string): boolean => {
    return (ADMIN_ROLES as readonly string[]).includes(role);
};

export const canUploadEvidence = (role: string): boolean => {
    const allowed = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.PROVINCIAL, ROLES.DATA_OWNER] as const;
    return (allowed as readonly string[]).includes(role);
};

export const canApproveEvidence = (role: string): boolean => {
    const allowed = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.REVIEWER] as const;
    return (allowed as readonly string[]).includes(role);
};

// v1.6.0: File Version System - Delete permission
export const canDeleteFiles = (role: string): boolean => {
    return (ADMIN_ROLES as readonly string[]).includes(role);
};

export const canViewAllData = (role: string): boolean => {
    const allowed = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.READ_ONLY] as const;
    return (allowed as readonly string[]).includes(role);
};

export const isMonitoringRole = (role: string): boolean => {
    const allowed = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN, ROLES.REGIONAL] as const;
    return (allowed as readonly string[]).includes(role);
};

export const getRoleDisplay = (role: string) => {
    switch (role) {
        case ROLES.SUPER_ADMIN: return 'ผู้ดูแลระบบสูงสุด';
        case ROLES.CENTRAL_ADMIN: return 'ผู้ดูแลส่วนกลาง';
        case ROLES.REGIONAL: return 'ผู้ประสานงานภาค';
        case ROLES.PROVINCIAL: return 'เจ้าหน้าที่จังหวัด';
        case ROLES.DATA_OWNER: return 'เจ้าของข้อมูล';
        case ROLES.REVIEWER: return 'ผู้ตรวจสอบ';
        case ROLES.READ_ONLY: return 'ผู้เข้าชม';
        default: return role;
    }
};

// v1.7.0: Dashboard Permission Helpers
export const shouldShowAdminTabs = (role: string): boolean => {
    return (ADMIN_ROLES as readonly string[]).includes(role);
};

export const canAccessAdminFeatures = (role: string): boolean => {
    return (ADMIN_ROLES as readonly string[]).includes(role);
};

export const canViewSystemStats = (role: string): boolean => {
    const allowed = [ROLES.SUPER_ADMIN, ROLES.CENTRAL_ADMIN] as const;
    return (allowed as readonly string[]).includes(role);
};

export const canViewActivityLogs = (role: string): boolean => {
    return (ADMIN_ROLES as readonly string[]).includes(role);
};

export type DashboardTool = {
    id: string;
    phase: number;
    requiredPermission?: (role: string) => boolean;
};

export const getAvailablePhaseTools = (role: string): number[] => {
    const isAdmin = canManageUsers(role);
    const canUpload = canUploadEvidence(role);
    const canApprove = canApproveEvidence(role);
    const isReadOnly = role === ROLES.READ_ONLY;

    if (isReadOnly) {
        return [0]; // Read-only users can only view Dashboard
    }

    if (isAdmin) {
        return [0, 1, 2, 3, 4, 5, 6, 7]; // Full access to all phases
    }

    const phases = [0]; // Everyone gets Phase 0 (Dashboard)

    if (canUpload) {
        phases.push(1, 2); // Data collection phases
    }

    if (canApprove) {
        phases.push(3, 4); // Review and approval phases
    }

    return phases;
};
