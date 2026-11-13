"use client";

import Link from "next/link";
import type { ListPostsResponseBody } from "@/app/api/admin/posts/route";

export type PostListItemPost = Pick<
  ListPostsResponseBody[number],
  "id" | "title" | "createdAt"
>;

type PostListItemProps = {
  post: PostListItemPost;
  isDeleting: boolean;
  onDelete: (postId: number) => void;
};

export default function PostListItem({
  post,
  isDeleting,
  onDelete,
}: PostListItemProps) {
  return (
    <li className="flex items-center justify-between gap-4 py-5 hover:bg-gray-50">
      <Link href={`/admin/posts/${post.id}`} className="flex-1">
        <h2 className="font-bold text-gray-900">{post.title}</h2>
        <time dateTime={post.createdAt} className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
        </time>
      </Link>
      <button
        type="button"
        onClick={() => onDelete(post.id)}
        disabled={isDeleting}
        className="flex-shrink-0 text-red-500 hover:underline text-sm disabled:text-gray-400"
      >
        削除
      </button>
    </li>
  );
}
