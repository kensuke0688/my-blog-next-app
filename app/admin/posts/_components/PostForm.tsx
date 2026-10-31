"use client";

import { useState } from "react";
import {
  THUMBNAIL_ALLOWED_TYPES,
  THUMBNAIL_MAX_SIZE_BYTES,
  uploadThumbnail,
} from "@/lib/supabase/storage";

export type PostFormCategory = {
  id: number;
  name: string;
};

export type PostFormValues = {
  title: string;
  content: string;
  thumbnailUrl: string;
  userId: number;
  categoryIds: number[];
};

type PostFormProps = {
  categories: PostFormCategory[];
  initialValues?: PostFormValues;
  submitLabel: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
};

export default function PostForm({
  categories,
  initialValues,
  submitLabel,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialValues?.thumbnailUrl ?? ""
  );
  const [userId, setUserId] = useState(
    initialValues ? String(initialValues.userId) : ""
  );
  const [categoryIds, setCategoryIds] = useState<number[]>(
    initialValues?.categoryIds ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!THUMBNAIL_ALLOWED_TYPES.includes(file.type)) {
      setError("画像はjpeg・png・webpのいずれかの形式でアップロードしてください。");
      return;
    }
    if (file.size > THUMBNAIL_MAX_SIZE_BYTES) {
      setError("画像サイズは3MB以内にしてください。");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadThumbnail(file);
      setThumbnailUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました。");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsedUserId = Number(userId);
    if (!title || !content || !thumbnailUrl || !userId) {
      setError("すべての項目を入力してください。");
      return;
    }
    if (Number.isNaN(parsedUserId)) {
      setError("ユーザーIDは数値で入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        content,
        thumbnailUrl,
        userId: parsedUserId,
        categoryIds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <label htmlFor="title" className="pt-2 text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <label htmlFor="thumbnail" className="pt-2 text-sm font-medium text-gray-700">
          サムネイル画像
        </label>
        <div className="space-y-3">
          {thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt="サムネイルプレビュー"
              className="w-48 h-32 object-cover rounded-md border border-gray-200"
            />
          )}
          <input
            type="file"
            id="thumbnail"
            accept={THUMBNAIL_ALLOWED_TYPES.join(",")}
            onChange={handleThumbnailChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            disabled={isSubmitting || isUploading}
          />
          {isUploading && (
            <p className="text-sm text-gray-500">アップロード中です...</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <label htmlFor="content" className="pt-2 text-sm font-medium text-gray-700">
          本文
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <label htmlFor="userId" className="pt-2 text-sm font-medium text-gray-700">
          ユーザーID(投稿者)
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-[160px_1fr] items-start gap-4">
        <span className="pt-2 text-sm font-medium text-gray-700">カテゴリー</span>
        <div className="flex flex-wrap gap-4">
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">カテゴリーがありません。</p>
          )}
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={categoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                disabled={isSubmitting}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-[160px_1fr] gap-4">
        <div />
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
