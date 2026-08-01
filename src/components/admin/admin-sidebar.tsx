"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
  Users,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap, exact: false },
  { href: "/admin/users", label: "Utilisateurs", icon: Users, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <nav className="flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
          M
        </span>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          Administration
        </span>
      </div>

      <div className="py-3">{navContent}</div>

      <div className="mt-auto space-y-1 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
        <div className="mb-2 flex items-center gap-3 px-2 pt-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{name}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
          </div>
        </div>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <ExternalLink className="h-4 w-4 shrink-0" /> Voir le site
        </Link>
        <div className="flex items-center justify-between gap-2 px-3 py-1">
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-zinc-900 dark:text-zinc-50">Administration</span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-zinc-900">
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
