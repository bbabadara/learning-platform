import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getFormations } from "@/lib/queries";
import DeleteButton from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Formations — Admin",
};

export default async function AdminFormationsPage() {
  const formations = await getFormations();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Formations ({formations.length})
        </h2>
        <Link
          href="/admin/formations/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> Nouvelle formation
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
  );
}
