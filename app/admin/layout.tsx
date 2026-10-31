import AdminSidebar from "@/app/admin/_components/AdminSidebar";
import AuthGuard from "@/app/admin/_components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
