import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/admin/chapter-form";

export const metadata: Metadata = {
  title: "Nouveau chapitre — Admin",
};

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!formation) notFound();

  return (
    <div>
      <Link
        href={`/admin/formations/${formation.id}`}
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Retour aux chapitres
      </Link>
      <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouveau chapitre
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ChapterForm formationId={formation.id} formationTitle={formation.title} />
      </div>
    </div>
  );
}
