"use client";

import Link from "next/link";
import { useState } from "react";
import type { ToggleLikeResponseBody } from "@/app/api/posts/[id]/likes/route";

type LikeButtonProps = {
  postId: number;
  initialLikeCount: number;
  initialLikedByMe: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md";
};

export default function LikeButton({
  postId,
  initialLikeCount,
  initialLikedByMe,
  isLoggedIn,
  size = "md",
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const iconSizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textSizeClass = size === "sm" ? "text-xs" : "text-sm";

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (isToggling) {
      return;
    }

    setShowLoginPrompt(false);

    const previousLikedByMe = likedByMe;
    const previousLikeCount = likeCount;
    setLikedByMe(!previousLikedByMe);
    setLikeCount(previousLikeCount + (previousLikedByMe ? -1 : 1));
    setIsToggling(true);

    try {
      const res = await fetch(`/api/posts/${postId}/likes`, { method: "POST" });

      if (!res.ok) {
        throw new Error("いいねの更新に失敗しました。");
      }

      const data: ToggleLikeResponseBody = await res.json();
      setLikedByMe(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLikedByMe(previousLikedByMe);
      setLikeCount(previousLikeCount);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="inline-flex flex-col items-start"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 ${textSizeClass} ${
          likedByMe ? "text-red-500" : "text-gray-400"
        } hover:text-red-500`}
        aria-pressed={likedByMe}
        aria-label={likedByMe ? "いいねを取り消す" : "いいねする"}
      >
        <svg
          viewBox="0 0 24 24"
          className={iconSizeClass}
          fill={likedByMe ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <span>{likeCount}</span>
      </button>
      {showLoginPrompt && (
        <p className="text-xs text-gray-500 mt-1">
          いいねするには
          <Link href="/sign_in" className="text-blue-500 hover:underline">
            ログイン
          </Link>
          してください。
        </p>
      )}
    </div>
  );
}
