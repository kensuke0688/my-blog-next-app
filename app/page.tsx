"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  categories: string[];
  tags: string[];
  content: string;
  commentCount: number;
  likeCount: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts);
      setLoading(false);
    };

    fetcher();
  }, []);

  if (loading) {
    return <p>記事を読み込み中です...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">記事一覧</h1>
      <ul className="divide-y divide-gray-200">
        {posts.map((post) => (
          <li className="flex flex-col gap-2 py-6" key={post.id}>
            <Link href={`/article/${post.id}`} className="flex gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.thumbnailUrl}
                alt={`${post.title} thumbnail`}
                className="w-48 h-32 object-cover flex-shrink-0"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                  </time>
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs"
                    >
                      {category}
                    </span>
                  ))}
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-bold text-lg text-gray-900">
                  {post.title}
                </h2>
                <div
                  className="text-gray-500 text-sm line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </Link>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>コメント {post.commentCount}件</span>
              <span
                className={`inline-flex items-center gap-1 ${
                  post.likeCount > 0 ? "text-red-500" : "text-gray-400"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill={post.likeCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                {post.likeCount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
