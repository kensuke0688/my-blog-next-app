"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  ListCategoriesResponseBody,
  CategoriesErrorResponseBody,
} from "@/app/api/admin/categories/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ListCategoriesResponseBody>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/categories");
        if (!res.ok) {
          throw new Error(
            `カテゴリー一覧の取得に失敗しました。(status: ${res.status})`
          );
        }
        const data: ListCategoriesResponseBody = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("このカテゴリーを削除しますか?")) return;

    setDeletingId(categoryId);
    try {
      const res = await fetchWithAuth(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data: CategoriesErrorResponseBody | null = await res
          .json()
          .catch(() => null);
        throw new Error(data?.error ?? `削除に失敗しました。(status: ${res.status})`);
      }

      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-900">カテゴリー一覧</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          新規作成
        </Link>
      </div>

      {loading && <p>読み込み中です...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-gray-500">カテゴリーがありません。</p>
      )}

      <ul className="divide-y divide-gray-200">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-4 py-5 hover:bg-gray-50"
          >
            <Link
              href={`/admin/categories/${category.id}`}
              className="flex-1 font-bold text-gray-900"
            >
              {category.name}
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(category.id)}
              disabled={deletingId === category.id}
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
