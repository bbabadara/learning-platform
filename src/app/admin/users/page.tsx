import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import UsersAdmin from "@/components/admin/users-admin";

export const metadata: Metadata = {
  title: "Utilisateurs — Admin",
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  isDemo: boolean;
  createdAt: Date;
  progressCount: number;
};

export default async function AdminUsersPage() {
  const rows = await prisma.user.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isDemo: true,
      createdAt: true,
      _count: { select: { progress: true } },
    },
  });

  const users: AdminUser[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    isDemo: u.isDemo,
    createdAt: u.createdAt,
    progressCount: u._count.progress,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Comptes ({users.length})
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Les nouvelles inscriptions doivent être validées avant de pouvoir se connecter.
        </p>
      </div>
      <UsersAdmin users={users} />
    </div>
  );
}
