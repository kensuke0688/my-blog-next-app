"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CommentSection from "./_components/CommentSection";
import LikeButton from "@/app/components/LikeButton";
import type { MeResponseBody } from "@/app/api/auth/me/route";
import type { GetLikeStatusResponseBody } from "@/app/api/posts/[id]/likes/route";

type Article = {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  categories: string[];
  tags: string[];
  content: string;
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [me, setMe] = useState<MeResponseBody | null>(null);
  const [likeStatus, setLikeStatus] =
    useState<GetLikeStatusResponseBody | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      const [postRes, meRes, likeRes] = await Promise.all([
        fetch(`/api/posts/${id}`),
        fetch("/api/auth/me"),
        fetch(`/api/posts/${id}/likes`),
      ]);
      const postData = await postRes.json();
      const meData: MeResponseBody = await meRes.json();
      const likeData: GetLikeStatusResponseBody = await likeRes.json();
      setArticle(postData.post);
      setMe(meData);
      setLikeStatus(likeData);
    };

    fetcher();
  }, [id]);

  if (!article || !likeStatus) {
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
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
          <h2 className="font-bold text-2xl text-gray-900">{article.title}</h2>
          <div className="pt-4">
            <LikeButton
              postId={article.id}
              initialLikeCount={likeStatus.likeCount}
              initialLikedByMe={likeStatus.likedByMe}
              isLoggedIn={me?.isLoggedIn ?? false}
            />
          </div>
          <div
            className="text-gray-500 text-base pt-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
      <CommentSection postId={article.id} />
      <Link href="/" className="mt-10 block text-blue-500 hover:underline">
        記事一覧に戻る
      </Link>
    </div>
  );
}
