import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-700 text-white">
      <Link href="/" className="text-lg font-bold">
        Blog
      </Link>
      <Link href="/contact">お問い合わせ</Link>
    </header>
  );
}
