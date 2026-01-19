import { Timestamp } from 'firebase/firestore';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'super_admin' | 'central_admin' | 'regional_coordinator' | 'provincial_staff' | 'data_owner' | 'reviewer' | 'read_only';
    unitId?: string;
    status: 'pending' | 'approved' | 'rejected' | 'disabled';
    requestDetails?: {
        requestedUnitId: string;
        requestedRole: string;
        reason?: string;
        submittedAt: Timestamp;
    };
    permissions: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
    isActive: boolean;
    metadata?: {
        position?: string;
        department?: string;
        phone?: string;
    };
}

export type UnitCategory = 'Central' | 'Regional' | 'Provincial' | 'Center' | 'DirectUnit';
export type UnitFunction = 'Operational' | 'Monitoring';

export interface Unit {
    id: string;
    code: string;
    name: string;
    category: UnitCategory;
    function: UnitFunction;
    region?: '1' | '2' | '3' | '4'; // GORMN Regions
    province?: string;
    parentUnitId?: string;
    aggregationRule: 'sum' | 'average' | 'weighted' | 'separate';
    weight?: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive: boolean;
    metadata?: {
        address?: string;
        contactEmail?: string;
    };
}

export interface AIConfig {
    id: 'default'; // Singleton
    apiKey: string; // Encrypted or partial view
    selectedModel: string;
    updatedAt: Timestamp;
    updatedBy: string;
}

export type ActivityAction =
    | 'login'
    | 'logout'
    | 'create'
    | 'update'
    | 'delete'
    | 'upload'
    | 'download'
    | 'view'
    | 'approve'
    | 'reject'
    | 'enable'
    | 'disable';

export type ActivityResourceType =
    | 'user'
    | 'cycle'
    | 'evidence'
    | 'unit'
    | 'file'
    | 'system'
    | 'auth';

export interface ActivityLog {
    id: string;
    userId: string;
    userName: string; // denormalized for fast query
    userEmail: string;
    unitId?: string;
    unitName?: string; // denormalized

    action: ActivityAction;

    resourceType: ActivityResourceType;
    resourceId?: string;
    resourceName?: string;

    details: {
        // Additional details based on action
        changes?: any; // for update operations
        oldValue?: any;
        newValue?: any;

        // File operations
        filename?: string;
        filesize?: number;
        fileType?: string;

        // Login/Logout
        ipAddress?: string;
        userAgent?: string;
        device?: string;
        browser?: string;

        // General
        description?: string;
        errorMessage?: string;
    };

    timestamp: Timestamp;
    createdAt: Timestamp;
}

export interface AssessmentCycle {
    id: string;
    year: number; // 2568, 2569
    name: string; // "รอบประเมิน PMQA 2568"
    description?: string;
    targetCategories: number[]; // [1,2,3,4,5,6,7] หรือเลือกบางหมวด
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'draft' | 'active' | 'completed' | 'archived';
    isActive: boolean; // มีเพียง 1 cycle ที่ isActive = true
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    metadata?: {
        targetScore?: number;
        evaluationDate?: Timestamp;
        notes?: string;
    };
}

export interface Evidence {
    id: string;
    cycleId: string; // เพิ่ม: อ้างอิงรอบการประเมิน
    unitId: string;
    categoryId: number; // PMQA Category 1-7
    criteriaId: string; // e.g. "1.1", "2.2"
    type: 'file' | 'link';
    title: string;
    description?: string;
    url: string;
    filePath?: string; // specific for Storage ref
    uploadedBy: string; // UserId
    uploadedAt: Timestamp;

    // Phase 1.3 Gate Checker
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: Timestamp;
    feedback?: string;

    // Phase 1.2 Gap Analysis
    completeness: 'complete' | 'gap_found' | 'partial';
}
