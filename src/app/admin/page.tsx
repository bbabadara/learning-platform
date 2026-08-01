import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  GraduationCap,
  BookOpen,
  ListChecks,
  Layers,
  Users,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { getFormations } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboard() {
  const [formations, chapterCount, quizCount, flashcardCount, userCount, pendingCount, progressCount, completedCount] =
    await Promise.all([
      getFormations(),
      prisma.chapter.count(),
      prisma.quizQuestion.count(),
      prisma.flashcard.count(),
      prisma.user.count(),
      prisma.user.count({ where: { status: "pending" } }),
      prisma.userProgress.count(),
      prisma.userProgress.count({ where: { status: "completed" } }),
    ]);

  const stats = [
    {
      label: "Formations",
      value: formations.length,
      icon: GraduationCap,
      href: "/admin",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      label: "Chapitres",
      value: chapterCount,
      icon: BookOpen,
      href: "/admin",
      color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    },
    {
      label: "Questions QCM",
      value: quizCount,
      icon: ListChecks,
      href: "/admin",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "Flashcards",
      value: flashcardCount,
      icon: Layers,
      href: "/admin",
      color: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    },
    {
      label: "Comptes",
      value: userCount,
      icon: Users,
      href: "/admin/users",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    },
    {
      label: "Chapitres terminés",
      value: `${completedCount}/${progressCount}`,
      icon: CheckCircle2,
      href: "/admin/users",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Tableau de bord</h2>
        <Link
          href="/admin/formations/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> Nouvelle formation
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-7 text-zinc-900 dark:text-zinc-50">{s.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {pendingCount > 0 && (
        <Link
          href="/admin/users"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {pendingCount} compte{pendingCount > 1 ? "s" : ""} en attente de validation
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Valider ou refuser ces inscriptions.
            </p>
          </div>
        </Link>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Formations ({formations.length})
          </h3>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Gérer les comptes →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {formations.map((f) => (
            <div
              key={f.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: f.color }}
                >
                  {f.title.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/formations/${f.id}`}
                    className="block truncate font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {f.title}
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {f.chapterCount} chapitres · {f.quizCount} QCM · {f.flashcardCount} flashcards
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
                <Link
                  href={`/admin/formations/${f.id}`}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Chapitres
                </Link>
                <Link
                  href={`/admin/formations/${f.id}/edit`}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Modifier
                </Link>
                <DeleteButton
                  url={`/api/admin/formations/${f.id}`}
                  label={`la formation « ${f.title} »`}
                  message={`Supprimer la formation « ${f.title} » et tous ses chapitres ? Cette action est définitive.`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
