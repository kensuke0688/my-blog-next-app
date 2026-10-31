"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/posts", label: "記事一覧" },
  { href: "/admin/categories", label: "カテゴリー一覧" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-200">
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
    </nav>
  );
}
