"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SignOutErrorResponseBody } from "@/app/api/auth/sign_out/route";

const navItems = [
  { href: "/admin/posts", label: "記事一覧" },
  { href: "/admin/categories", label: "カテゴリー一覧" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const res = await fetch("/api/auth/sign_out", { method: "POST" });

      if (!res.ok) {
        const data: SignOutErrorResponseBody | null = await res
          .json()
          .catch(() => null);
        throw new Error(data?.error ?? "ログアウトに失敗しました。");
      }

      router.push("/sign_in");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ログアウトに失敗しました。");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col justify-between">
      <ul>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-6 py-4 text-sm ${
                  isActive
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="text-left px-6 py-4 text-sm text-gray-500 hover:bg-gray-100 disabled:text-gray-400"
      >
        ログアウト
      </button>
    </nav>
  );
}
