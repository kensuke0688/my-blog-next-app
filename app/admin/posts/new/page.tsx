"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PostForm, {
  type PostFormCategory,
  type PostFormValues,
} from "@/app/admin/posts/_components/PostForm";
import type {
  CreatePostRequestBody,
  CreatePostResponseBody,
} from "@/app/api/admin/posts/route";
import type { ListCategoriesResponseBody } from "@/app/api/admin/categories/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<PostFormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/categories");
        if (!res.ok) {
          throw new Error(`カテゴリーの取得に失敗しました。(status: ${res.status})`);
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

  const handleSubmit = async (values: PostFormValues) => {
    const body: CreatePostRequestBody = values;

    const res = await fetchWithAuth("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`作成に失敗しました。(status: ${res.status})`);
    }

    const created: CreatePostResponseBody = await res.json();
    router.push(`/admin/posts/${created.id}`);
  };

  return (
    <div className="max-w-2xl px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">記事の新規作成</h1>

      {loading && <p>読み込み中です...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        <PostForm
          categories={categories}
          submitLabel="作成する"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
