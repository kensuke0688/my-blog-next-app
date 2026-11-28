"use client";

import Link from "next/link";
import { useState } from "react";
import HeartIcon from "@/app/components/HeartIcon";
import type { ToggleLikeResponseBody } from "@/app/api/posts/[id]/likes/route";

type LikeButtonProps = {
  postId: number;
  initialLikeCount: number;
  initialLikedByMe: boolean;
  isLoggedIn: boolean;
};

export default function LikeButton({
  postId,
  initialLikeCount,
  initialLikedByMe,
  isLoggedIn,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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
        className={`inline-flex items-center gap-1 text-sm ${
          likedByMe ? "text-red-500" : "text-gray-400"
        } hover:text-red-500`}
        aria-pressed={likedByMe}
        aria-label={likedByMe ? "いいねを取り消す" : "いいねする"}
      >
        <HeartIcon filled={likedByMe} />
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
