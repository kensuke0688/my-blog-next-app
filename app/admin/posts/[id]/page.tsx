"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PostForm, {
  type PostFormCategory,
  type PostFormValues,
} from "@/app/admin/posts/_components/PostForm";
import type {
  GetPostResponseBody,
  UpdatePostRequestBody,
} from "@/app/api/admin/posts/[id]/route";
import type { ListCategoriesResponseBody } from "@/app/api/admin/categories/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<PostFormCategory[]>([]);
  const [initialValues, setInitialValues] = useState<PostFormValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const [postRes, categoriesRes] = await Promise.all([
          fetchWithAuth(`/api/admin/posts/${id}`),
          fetchWithAuth("/api/admin/categories"),
        ]);

        if (!postRes.ok) {
          throw new Error(`記事の取得に失敗しました。(status: ${postRes.status})`);
        }
        if (!categoriesRes.ok) {
          throw new Error(
            `カテゴリーの取得に失敗しました。(status: ${categoriesRes.status})`
          );
        }

        const post: GetPostResponseBody = await postRes.json();
        const categoryList: ListCategoriesResponseBody = await categoriesRes.json();

        setCategories(categoryList);
        setInitialValues({
          title: post.title,
          content: post.content,
          thumbnailUrl: post.thumbnailUrl,
          userId: post.userId,
          categoryIds: post.categories.map((pc) => pc.categoryId),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, [id]);

  const handleSubmit = async (values: PostFormValues) => {
    const body: UpdatePostRequestBody = values;

    const res = await fetchWithAuth(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`更新に失敗しました。(status: ${res.status})`);
    }

    router.push("/admin/posts");
  };

  return (
    <div className="max-w-2xl px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">記事の編集</h1>

      {loading && <p>読み込み中です...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && initialValues && (
        <PostForm
          categories={categories}
          initialValues={initialValues}
          submitLabel="更新する"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
