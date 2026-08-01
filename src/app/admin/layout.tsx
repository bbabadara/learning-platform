import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Administration
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gérer les formations et les chapitres — {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/admin"
            className="text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Tableau de bord
          </Link>
          <Link
            href="/"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Voir le site
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
