"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CategoryForm, {
  type CategoryFormValues,
} from "@/app/admin/categories/_components/CategoryForm";
import type {
  GetCategoryResponseBody,
  UpdateCategoryRequestBody,
} from "@/app/api/admin/categories/[id]/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [initialValues, setInitialValues] =
    useState<CategoryFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetchWithAuth(`/api/admin/categories/${id}`);
        if (!res.ok) {
          throw new Error(`カテゴリーの取得に失敗しました。(status: ${res.status})`);
        }
        const category: GetCategoryResponseBody = await res.json();
        setInitialValues({ name: category.name });
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetcher();
  }, [id]);

  const handleSubmit = async (values: CategoryFormValues) => {
    const body: UpdateCategoryRequestBody = values;

    const res = await fetchWithAuth(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`更新に失敗しました。(status: ${res.status})`);
    }

    router.push("/admin/categories");
  };

  return (
    <div className="max-w-2xl px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">カテゴリーの編集</h1>

      {loading && <p>読み込み中です...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && initialValues && (
        <CategoryForm
          initialValues={initialValues}
          submitLabel="更新する"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
