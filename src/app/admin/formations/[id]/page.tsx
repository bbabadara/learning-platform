import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Eye, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Chapitres — Admin",
};

export default async function FormationChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { number: "asc" },
        include: { _count: { select: { quizQuestions: true, flashcards: true } } },
      },
    },
  });
  if (!formation) notFound();

  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Retour au tableau de bord
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {formation.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formation.chapters.length} chapitres
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/formation/${formation.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Eye className="h-4 w-4" /> Voir la formation
          </Link>
          <Link
            href={`/admin/formations/${formation.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" /> Modifier
          </Link>
          <Link
            href={`/admin/formations/${formation.id}/chapters/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Nouveau chapitre
          </Link>
        </div>
      </div>

      {formation.chapters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Aucun chapitre pour le moment.
        </p>
      ) : (
        <ol className="space-y-2">
          {formation.chapters.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: formation.color }}
              >
                {c.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                  {c.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {c._count.quizQuestions} QCM · {c._count.flashcards} flashcards
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm">
                <Link
                  href={`/admin/chapters/${c.id}/edit`}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Modifier
                </Link>
                <DeleteButton
                  compact
                  url={`/api/admin/chapters/${c.id}`}
                  label={`le chapitre ${c.number}`}
                  message={`Supprimer le chapitre « ${c.title} » ? Les QCM, flashcards et progressions liés seront supprimés.`}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
