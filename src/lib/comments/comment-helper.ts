/**
 * Comment Helper
 * 
 * Functions for managing comments on Evidence and SAR items
 */

import { db } from '@/lib/firebase/config';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { Comment, CommentTargetType, User } from '@/types/database';
import { createNotification } from '@/lib/notification/notification-helper';

const COLLECTION_NAME = 'comments';

/**
 * Add a new comment
 */
export async function addComment(
    targetType: CommentTargetType,
    targetId: string,
    content: string,
    author: User,
    mentions: string[] = []
): Promise<string | null> {
    try {
        const commentData = {
            targetType,
            targetId,
            content,
            mentions,
            authorId: author.uid,
            authorName: author.displayName,
            authorPhotoURL: author.photoURL || null,
            createdAt: serverTimestamp(),
            isEdited: false,
            isDeleted: false,
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), commentData);

        // Send notifications to mentioned users
        if (mentions.length > 0) {
            await sendMentionNotifications(
                mentions,
                author,
                targetType,
                targetId,
                content
            );
        }

        return docRef.id;
    } catch (error) {
        console.error('Error adding comment:', error);
        return null;
    }
}

/**
 * Update an existing comment
 */
export async function updateComment(
    commentId: string,
    content: string,
    newMentions: string[] = [],
    existingMentions: string[] = [],
    author: User,
    targetType: CommentTargetType,
    targetId: string
): Promise<boolean> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, commentId), {
            content,
            mentions: newMentions,
            updatedAt: serverTimestamp(),
            isEdited: true,
        });

        // Send notifications only to newly mentioned users
        const addedMentions = newMentions.filter(uid => !existingMentions.includes(uid));
        if (addedMentions.length > 0) {
            await sendMentionNotifications(
                addedMentions,
                author,
                targetType,
                targetId,
                content
            );
        }

        return true;
    } catch (error) {
        console.error('Error updating comment:', error);
        return false;
    }
}

/**
 * Soft delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, commentId), {
            isDeleted: true,
            content: '[ความคิดเห็นถูกลบแล้ว]',
            updatedAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
}

/**
 * Get comments for a target (Evidence or SAR)
 */
export async function getComments(
    targetType: CommentTargetType,
    targetId: string
): Promise<Comment[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('targetType', '==', targetType),
            where('targetId', '==', targetId),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        const comments: Comment[] = [];

        snapshot.forEach((docSnap) => {
            comments.push({
                id: docSnap.id,
                ...docSnap.data(),
            } as Comment);
        });

        return comments;
    } catch (error) {
        console.error('Error getting comments:', error);
        return [];
    }
}

/**
 * Parse @mentions from comment content
 * Returns array of display names mentioned
 */
export function parseMentions(content: string): string[] {
    const mentionRegex = /@(\w+(?:\s+\w+)?)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    return matches.map(m => m.substring(1)); // Remove @ prefix
}

/**
 * Send notification to mentioned users
 */
async function sendMentionNotifications(
    mentionedUserIds: string[],
    author: User,
    targetType: CommentTargetType,
    targetId: string,
    content: string
): Promise<void> {
    const targetLabel = targetType === 'evidence' ? 'หลักฐาน' : 'SAR';
    const link = targetType === 'evidence'
        ? `/phase1/evidence-uploader?id=${targetId}`
        : `/phase4/sar-writer?section=${targetId}`;

    const shortContent = content.length > 50
        ? content.substring(0, 50) + '...'
        : content;

    for (const userId of mentionedUserIds) {
        // Don't notify yourself
        if (userId === author.uid) continue;

        await createNotification({
            userId,
            type: 'mention',
            title: `${author.displayName} กล่าวถึงคุณ`,
            message: `ใน${targetLabel}: "${shortContent}"`,
            source: {
                type: 'comment',
                id: targetId,
                name: author.displayName,
            },
            link,
        });
    }
}

/**
 * Get comment count for a target
 */
export async function getCommentCount(
    targetType: CommentTargetType,
    targetId: string
): Promise<number> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('targetType', '==', targetType),
            where('targetId', '==', targetId),
            where('isDeleted', '==', false)
        );

        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting comment count:', error);
        return 0;
    }
}
