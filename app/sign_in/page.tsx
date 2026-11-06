"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  SignInRequestBody,
  SignInErrorResponseBody,
} from "@/app/api/auth/sign_in/route";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const body: SignInRequestBody = { email, password };

    const res = await fetch("/api/auth/sign_in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data: SignInErrorResponseBody | null = await res
        .json()
        .catch(() => null);
      alert(data?.error ?? "ログインに失敗しました。");
      return;
    }

    router.push("/admin/posts");
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8">ログイン</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 text-sm font-medium"
        >
          ログイン
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        アカウントをお持ちでない方は
        <Link href="/sign_up" className="text-blue-600 hover:underline">
          会員登録
        </Link>
      </p>
    </div>
  );
}
