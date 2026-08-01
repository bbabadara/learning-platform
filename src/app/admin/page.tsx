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
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboard() {
  const [
    formationCount,
    chapterCount,
    quizCount,
    flashcardCount,
    userCount,
    pendingCount,
    progressCount,
    completedCount,
  ] = await Promise.all([
    prisma.formation.count(),
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
      value: formationCount,
      icon: GraduationCap,
      href: "/admin/formations",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      label: "Chapitres",
      value: chapterCount,
      icon: BookOpen,
      href: "/admin/formations",
      color: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
    },
    {
      label: "Questions QCM",
      value: quizCount,
      icon: ListChecks,
      href: "/admin/formations",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "Flashcards",
      value: flashcardCount,
      icon: Layers,
      href: "/admin/formations",
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
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Tableau de bord</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Vue d&apos;ensemble de la plateforme.
          </p>
        </div>
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
            className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-7 text-zinc-900 dark:text-zinc-50">{s.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400 dark:text-zinc-600" />
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
          <ArrowRight className="ml-auto h-4 w-4 shrink-0" />
        </Link>
      )}
    </div>
  );
}
