import { db } from '@/lib/firebase/config';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { FileVersion, Evidence } from '@/types/database';

/**
 * Add a new version to an evidence document
 * @param evidenceId - ID of the evidence document
 * @param fileData - File information (url, name, size, type)
 * @param userId - ID of the user uploading
 * @param userName - Display name of the user
 * @param notes - Optional notes about this version
 * @returns Created FileVersion document
 */
export async function addNewVersion(
    evidenceId: string,
    fileData: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    },
    userId: string,
    userName: string,
    notes?: string
): Promise<FileVersion> {
    // Get current version count
    const versionsQuery = query(
        collection(db, 'file_versions'),
        where('evidenceId', '==', evidenceId),
        orderBy('version', 'desc')
    );
    const versionsSnap = await getDocs(versionsQuery);
    const currentMaxVersion = versionsSnap.docs.length > 0
        ? (versionsSnap.docs[0].data().version as number)
        : 0;
    const newVersion = currentMaxVersion + 1;

    // Mark all existing versions as not latest
    for (const versionDoc of versionsSnap.docs) {
        if (versionDoc.data().isLatest) {
            await updateDoc(doc(db, 'file_versions', versionDoc.id), {
                isLatest: false
            });
        }
    }

    // Create new version document
    const newVersionData: Omit<FileVersion, 'id'> = {
        evidenceId,
        version: newVersion,
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
        uploadedBy: userId,
        uploadedByName: userName,
        uploadedAt: serverTimestamp() as Timestamp,
        notes: notes || undefined,
        isLatest: true
    };

    const docRef = await addDoc(collection(db, 'file_versions'), newVersionData);

    // Update evidence document with version info
    await updateDoc(doc(db, 'evidence', evidenceId), {
        currentVersion: newVersion,
        latestVersionId: docRef.id,
        totalVersions: newVersion,
        lastUpdatedAt: serverTimestamp(),
        lastUpdatedBy: userId,
        url: fileData.fileUrl, // Update main URL to latest
    });

    return {
        id: docRef.id,
        ...newVersionData
    };
}

/**
 * Get version history for an evidence document
 * @param evidenceId - ID of the evidence document
 * @returns Array of FileVersion sorted by version desc
 */
export async function getVersionHistory(
    evidenceId: string
): Promise<FileVersion[]> {
    const q = query(
        collection(db, 'file_versions'),
        where('evidenceId', '==', evidenceId),
        orderBy('version', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as FileVersion[];
}

/**
 * Get download URL for a specific version
 * @param versionId - ID of the FileVersion document
 * @returns Download URL string
 */
export async function getVersionDownloadUrl(
    versionId: string
): Promise<string | null> {
    const versionDoc = await getDoc(doc(db, 'file_versions', versionId));
    if (!versionDoc.exists()) {
        return null;
    }
    return versionDoc.data().fileUrl;
}

/**
 * Delete a version (Admin only)
 * @param versionId - ID of the FileVersion to delete
 * @param userId - ID of the user attempting delete
 * @param userRole - Role of the user
 * @returns true if deleted, throws error if not authorized
 */
export async function deleteVersion(
    versionId: string,
    userId: string,
    userRole: string
): Promise<boolean> {
    // Check admin permission
    const adminRoles = ['super_admin', 'central_admin'];
    if (!adminRoles.includes(userRole)) {
        throw new Error('ไม่มีสิทธิ์ลบไฟล์ เฉพาะ Admin เท่านั้น');
    }

    const versionDoc = await getDoc(doc(db, 'file_versions', versionId));
    if (!versionDoc.exists()) {
        throw new Error('ไม่พบไฟล์ที่ต้องการลบ');
    }

    const versionData = versionDoc.data() as FileVersion;
    const evidenceId = versionData.evidenceId;
    const wasLatest = versionData.isLatest;

    // Delete the version document
    await deleteDoc(doc(db, 'file_versions', versionId));

    // If deleted version was latest, update evidence and mark new latest
    if (wasLatest) {
        const remainingVersions = await getVersionHistory(evidenceId);

        if (remainingVersions.length > 0) {
            // Mark the next most recent as latest
            const newLatest = remainingVersions[0];
            await updateDoc(doc(db, 'file_versions', newLatest.id), {
                isLatest: true
            });

            // Update evidence document
            await updateDoc(doc(db, 'evidence', evidenceId), {
                currentVersion: newLatest.version,
                latestVersionId: newLatest.id,
                totalVersions: remainingVersions.length,
                url: newLatest.fileUrl,
            });
        } else {
            // No versions left, reset evidence
            await updateDoc(doc(db, 'evidence', evidenceId), {
                currentVersion: 0,
                latestVersionId: null,
                totalVersions: 0,
                url: '',
            });
        }
    } else {
        // Just update version count
        const remainingVersions = await getVersionHistory(evidenceId);
        await updateDoc(doc(db, 'evidence', evidenceId), {
            totalVersions: remainingVersions.length,
        });
    }

    return true;
}

/**
 * Revert evidence to a specific version (Admin only)
 * @param evidenceId - ID of the evidence document
 * @param versionId - ID of the version to revert to
 * @param userRole - Role of the user
 */
export async function revertToVersion(
    evidenceId: string,
    versionId: string,
    userRole: string
): Promise<void> {
    // Check admin permission
    const adminRoles = ['super_admin', 'central_admin'];
    if (!adminRoles.includes(userRole)) {
        throw new Error('ไม่มีสิทธิ์ย้อนกลับเวอร์ชัน เฉพาะ Admin เท่านั้น');
    }

    const versionDoc = await getDoc(doc(db, 'file_versions', versionId));
    if (!versionDoc.exists()) {
        throw new Error('ไม่พบเวอร์ชันที่ต้องการ');
    }

    const versionData = versionDoc.data() as FileVersion;

    // Mark all versions as not latest
    const allVersions = await getVersionHistory(evidenceId);
    for (const v of allVersions) {
        if (v.isLatest) {
            await updateDoc(doc(db, 'file_versions', v.id), {
                isLatest: false
            });
        }
    }

    // Mark selected version as latest
    await updateDoc(doc(db, 'file_versions', versionId), {
        isLatest: true
    });

    // Update evidence document
    await updateDoc(doc(db, 'evidence', evidenceId), {
        currentVersion: versionData.version,
        latestVersionId: versionId,
        url: versionData.fileUrl,
        lastUpdatedAt: serverTimestamp(),
    });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format upload timestamp for display
 * @param timestamp - Firestore Timestamp
 * @returns Formatted Thai date string
 */
export function formatUploadDate(timestamp: Timestamp | undefined): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
