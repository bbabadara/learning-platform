"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, User, ShieldCheck, LogOut, LogIn, UserPlus } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileMenu({
  userName,
  userEmail,
  isAdmin,
  isAuthenticated,
}: {
  userName: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {isAuthenticated && (
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {userName}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{userEmail}</p>
            </div>
          )}
          <nav className="flex flex-col p-2">
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Home className="h-4 w-4" /> Accueil
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                onClick={close}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <User className="h-4 w-4" /> Mon profil
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={close}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
              >
                <ShieldCheck className="h-4 w-4" /> Administration
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-1 flex items-center gap-2.5 rounded-lg border-t border-zinc-100 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-zinc-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <UserPlus className="h-4 w-4" /> S&apos;inscrire
                </Link>
                <Link
                  href="/login"
                  onClick={close}
                  className="mt-1 flex items-center gap-2.5 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <LogIn className="h-4 w-4" /> Se connecter
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
