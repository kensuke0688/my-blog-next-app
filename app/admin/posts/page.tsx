"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ListPostsResponseBody, PostsErrorResponseBody } from "@/app/api/admin/posts/route";
import PostListItem from "@/app/admin/posts/_components/PostListItem";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ListPostsResponseBody>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/admin/posts");
        if (!res.ok) {
          throw new Error(`記事一覧の取得に失敗しました。(status: ${res.status})`);
        }
        const data: ListPostsResponseBody = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (postId: number) => {
    if (!window.confirm("この記事を削除しますか?")) return;

    setDeletingId(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data: PostsErrorResponseBody | null = await res
          .json()
          .catch(() => null);
        throw new Error(data?.error ?? `削除に失敗しました。(status: ${res.status})`);
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-900">記事一覧</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>

      {loading && <p>読み込み中です...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-500">記事がありません。</p>
      )}

      <ul className="divide-y divide-gray-200">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            isDeleting={deletingId === post.id}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
