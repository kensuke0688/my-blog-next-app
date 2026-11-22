"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MeResponseBody } from "@/app/api/auth/me/route";
import type {
  PublicComment,
  ListCommentsResponseBody,
  CreateCommentRequestBody,
  CreateCommentResponseBody,
} from "@/app/api/posts/[id]/comments/route";
import type {
  UpdateCommentRequestBody,
  UpdateCommentResponseBody,
} from "@/app/api/comments/[id]/route";

type CommentSectionProps = {
  postId: number;
  authorId: number;
};

export default function CommentSection({ postId, authorId }: CommentSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [me, setMe] = useState<MeResponseBody | null>(null);
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      const [meRes, commentsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/posts/${postId}/comments`),
      ]);
      const meData: MeResponseBody = await meRes.json();
      const commentsData: ListCommentsResponseBody = await commentsRes.json();
      setMe(meData);
      setComments(commentsData.comments);
    };

    fetcher();
  }, [postId]);

  const prismaUserId = me?.isLoggedIn ? me.prismaUserId : null;
  const isPostAuthor = prismaUserId !== null && prismaUserId === authorId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newContent.trim()) {
      setError("コメントを入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const body: CreateCommentRequestBody = { content: newContent };
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "コメントの投稿に失敗しました。");
      }

      const data: CreateCommentResponseBody = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setNewContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment: PublicComment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleUpdate = async (commentId: number) => {
    setError(null);

    if (!editingContent.trim()) {
      setError("コメントを入力してください。");
      return;
    }

    try {
      const body: UpdateCommentRequestBody = { content: editingContent };
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "コメントの更新に失敗しました。");
      }

      const data: UpdateCommentResponseBody = await res.json();
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? data.comment : comment))
      );
      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("このコメントを削除しますか?")) {
      return;
    }

    setError(null);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "コメントの削除に失敗しました。");
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="font-bold text-xl text-gray-900 mb-4">
        コメント ({comments.length})
      </h3>

      <ul className="space-y-4 mb-8">
        {comments.map((comment) => {
          const isOwner = prismaUserId === comment.user.id;
          const canDelete = isOwner || isPostAuthor;

          return (
            <li key={comment.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {comment.user.name}
                </span>
                <time className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString("ja-JP")}
                </time>
              </div>

              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(comment.id)}
                      className="bg-gray-900 text-white px-4 py-1.5 rounded-md hover:bg-gray-800 text-sm"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-200 text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  <div className="flex gap-3 mt-2">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => startEditing(comment)}
                        className="text-blue-500 hover:underline text-xs"
                      >
                        編集
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {me?.isLoggedIn ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="コメントを入力"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={4}
            disabled={isSubmitting}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            コメントする
          </button>
        </form>
      ) : me !== null ? (
        <p className="text-sm text-gray-500">
          コメントするには
          <Link href="/sign_in" className="text-blue-500 hover:underline">
            ログイン
          </Link>
          してください。
        </p>
      ) : null}
    </div>
  );
}
