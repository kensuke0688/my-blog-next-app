"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ListPostsResponseBody, PostsErrorResponseBody } from "@/app/api/admin/posts/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ListPostsResponseBody>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/posts");
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
      const res = await fetchWithAuth(`/api/admin/posts/${postId}`, {
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
          <li
            key={post.id}
            className="flex items-center justify-between gap-4 py-5 hover:bg-gray-50"
          >
            <Link href={`/admin/posts/${post.id}`} className="flex-1">
              <h2 className="font-bold text-gray-900">{post.title}</h2>
              <time
                dateTime={post.createdAt}
                className="text-sm text-gray-500"
              >
                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
              </time>
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(post.id)}
              disabled={deletingId === post.id}
              className="flex-shrink-0 text-red-500 hover:underline text-sm disabled:text-gray-400"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
