'use client';

import { useState, useEffect, useRef } from 'react';
import { Comment, CommentTargetType, User } from '@/types/database';
import { useAuthStore } from '@/stores/auth-store';
import {
    addComment,
    updateComment,
    deleteComment,
    getComments,
} from '@/lib/comments/comment-helper';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Send, MoreVertical, Edit2, Trash2, AtSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface CommentSectionProps {
    targetType: CommentTargetType;
    targetId: string;
}

interface UserSuggestion {
    uid: string;
    displayName: string;
    photoURL?: string;
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // @mention
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
    const [mentionSearch, setMentionSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch comments
    const fetchComments = async () => {
        setLoading(true);
        const data = await getComments(targetType, targetId);
        setComments(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [targetType, targetId]);

    // Search users for @mention
    const searchUsers = async (searchTerm: string) => {
        if (searchTerm.length < 1) {
            setSuggestions([]);
            return;
        }

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('status', '==', 'approved'));
            const snapshot = await getDocs(q);

            const filtered: UserSuggestion[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filtered.push({
                        uid: doc.id,
                        displayName: data.displayName,
                        photoURL: data.photoURL,
                    });
                }
            });

            setSuggestions(filtered.slice(0, 5));
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    // Handle input change with @mention detection
    const handleInputChange = (value: string, isEdit = false) => {
        if (isEdit) {
            setEditContent(value);
        } else {
            setNewComment(value);
        }

        // Detect @mention
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = value.substring(lastAtIndex + 1);
            const spaceIndex = textAfterAt.indexOf(' ');

            if (spaceIndex === -1) {
                setMentionSearch(textAfterAt);
                searchUsers(textAfterAt);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    // Insert mention
    const insertMention = (user: UserSuggestion, isEdit = false) => {
        const currentText = isEdit ? editContent : newComment;
        const lastAtIndex = currentText.lastIndexOf('@');
        const newText = currentText.substring(0, lastAtIndex) + `@${user.displayName} `;

        if (isEdit) {
            setEditContent(newText);
        } else {
            setNewComment(newText);
        }

        setShowSuggestions(false);
        textareaRef.current?.focus();
    };

    // Extract mentioned user IDs from content
    const extractMentionedUserIds = async (content: string): Promise<string[]> => {
        const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)?)/g;
        const matches = content.match(mentionRegex);
        if (!matches) return [];

        const displayNames = matches.map(m => m.substring(1).trim());

        // Find user IDs by display name
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const userIds: string[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (displayNames.some(name =>
                data.displayName.toLowerCase() === name.toLowerCase()
            )) {
                userIds.push(doc.id);
            }
        });

        return userIds;
    };

    // Submit new comment
    const handleSubmit = async () => {
        if (!newComment.trim() || !user) return;

        setSubmitting(true);
        const mentionedIds = await extractMentionedUserIds(newComment);

        const result = await addComment(
            targetType,
            targetId,
            newComment.trim(),
            user as User,
            mentionedIds
        );

        if (result) {
            setNewComment('');
            fetchComments();
            toast.success('เพิ่มความคิดเห็นแล้ว');
        } else {
            toast.error('เกิดข้อผิดพลาด');
        }
        setSubmitting(false);
    };

    // Update comment
    const handleUpdate = async (commentId: string, existingMentions: string[]) => {
        if (!editContent.trim() || !user) return;

        setSubmitting(true);
        const mentionedIds = await extractMentionedUserIds(editContent);

        const success = await updateComment(
            commentId,
            editContent.trim(),
            mentionedIds,
            existingMentions,
            user as User,
            targetType,
            targetId
        );

        if (success) {
            setEditingId(null);
            setEditContent('');
            fetchComments();
            toast.success('แก้ไขความคิดเห็นแล้ว');
        } else {
            toast.error('เกิดข้อผิดพลาด');
        }
        setSubmitting(false);
    };

    // Delete comment
    const handleDelete = async (commentId: string) => {
        if (!confirm('ยืนยันการลบความคิดเห็นนี้?')) return;

        const success = await deleteComment(commentId);
        if (success) {
            fetchComments();
            toast.success('ลบความคิดเห็นแล้ว');
        } else {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    // Render content with highlighted mentions
    const renderContent = (content: string) => {
        const parts = content.split(/(@\w+(?:\s+\w+)?)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="text-indigo-600 font-medium">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageSquare className="h-4 w-4" />
                ความคิดเห็น ({comments.filter(c => !c.isDeleted).length})
            </div>

            {/* Comment List */}
            {loading ? (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                    ยังไม่มีความคิดเห็น
                </p>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={`flex gap-3 p-3 rounded-lg ${comment.isDeleted ? 'bg-slate-50' : 'bg-white border'
                                }`}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.authorPhotoURL} />
                                <AvatarFallback>
                                    {comment.authorName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {comment.authorName}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {comment.createdAt?.toDate && formatDistanceToNow(
                                            comment.createdAt.toDate(),
                                            { addSuffix: true, locale: th }
                                        )}
                                    </span>
                                    {comment.isEdited && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                            แก้ไขแล้ว
                                        </Badge>
                                    )}
                                </div>

                                {editingId === comment.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) => handleInputChange(e.target.value, true)}
                                            className="min-h-[60px]"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdate(comment.id, comment.mentions)}
                                                disabled={submitting}
                                            >
                                                {submitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                                บันทึก
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingId(null)}
                                            >
                                                ยกเลิก
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm ${comment.isDeleted ? 'text-slate-400 italic' : ''}`}>
                                        {renderContent(comment.content)}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {user?.uid === comment.authorId && !comment.isDeleted && editingId !== comment.id && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditContent(comment.content);
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            แก้ไข
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            ลบ
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Comment Input */}
            {user && (
                <div className="relative">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={newComment}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="เขียนความคิดเห็น... ใช้ @ เพื่อกล่าวถึงผู้ใช้"
                                    className="min-h-[60px] pr-10"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 bottom-1 h-8 w-8 text-slate-400 hover:text-indigo-600"
                                    onClick={() => {
                                        setNewComment(prev => prev + '@');
                                        textareaRef.current?.focus();
                                    }}
                                    title="กล่าวถึงผู้ใช้"
                                >
                                    <AtSign className="h-4 w-4" />
                                </Button>

                                {/* Mention Suggestions */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute bottom-full left-0 w-64 bg-white border rounded-md shadow-lg mb-1 z-50">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s.uid}
                                                onClick={() => insertMention(s)}
                                                className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 text-left"
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={s.photoURL} />
                                                    <AvatarFallback>{s.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm truncate">{s.displayName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || submitting}
                                size="sm"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                ส่ง
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
