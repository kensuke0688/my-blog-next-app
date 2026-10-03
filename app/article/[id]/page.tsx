"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Article = {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  categories: string[];
  content: string;
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      const res = await fetch(
        `https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/posts/${id}`
      );
      const data = await res.json();
      setArticle(data.post);
    };

    fetcher();
  }, [id]);

  if (!article) {
    return <p>記事を読み込み中です...</p>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8">
      <div className="flex flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.thumbnailUrl}
          alt={`${article.title} thumbnail`}
          className="w-full h-96 pt-6 object-cover flex-shrink-0"
        />
        <div className="flex flex-col pt-6">
          <div className="flex items-center gap-2 pb-4 text-base text-gray-500">
            <time dateTime={article.createdAt}>
              {new Date(article.createdAt).toLocaleDateString("ja-JP")}
            </time>
            {article.categories.map((category) => (
              <span
                key={category}
                className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs"
              >
                {category}
              </span>
            ))}
          </div>
          <h2 className="font-bold text-2xl text-gray-900">
            {article.title}
          </h2>
          <div
            className="text-gray-500 text-base pt-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
      <Link href="/" className="text-blue-500 hover:underline">
        記事一覧に戻る
      </Link>
    </div>
  );
}
