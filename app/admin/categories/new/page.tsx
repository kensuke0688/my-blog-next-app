"use client";

import { useRouter } from "next/navigation";
import CategoryForm, {
  type CategoryFormValues,
} from "@/app/admin/categories/_components/CategoryForm";
import type {
  CreateCategoryRequestBody,
  CategoryResponseBody,
} from "@/app/api/admin/categories/route";
import { fetchWithAuth } from "@/lib/supabase/fetchWithAuth";

export default function NewCategoryPage() {
  const router = useRouter();

  const handleSubmit = async (values: CategoryFormValues) => {
    const body: CreateCategoryRequestBody = values;

    const res = await fetchWithAuth("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`作成に失敗しました。(status: ${res.status})`);
    }

    const created: CategoryResponseBody = await res.json();
    router.push(`/admin/categories/${created.id}`);
  };

  return (
    <div className="max-w-2xl px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">
        カテゴリーの新規作成
      </h1>
      <CategoryForm submitLabel="作成する" onSubmit={handleSubmit} />
    </div>
  );
}
