import AdminSidebar from "@/app/admin/_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
