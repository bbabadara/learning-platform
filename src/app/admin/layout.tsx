import { requireAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <div className="lg:flex lg:items-stretch">
      <AdminSidebar
        name={session.user.name ?? "Admin"}
        email={session.user.email ?? ""}
      />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
