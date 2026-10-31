"use client";

import { useState } from "react";

export type CategoryFormValues = {
  name: string;
};

type CategoryFormProps = {
  initialValues?: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export default function CategoryForm({
  initialValues,
  submitLabel,
  onSubmit,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("カテゴリー名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <label htmlFor="name" className="pt-2 text-sm font-medium text-gray-700">
          カテゴリー名
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-[160px_1fr] gap-4">
        <div />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
