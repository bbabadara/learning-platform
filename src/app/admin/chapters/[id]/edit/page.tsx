import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ChapterForm, { type ChapterFormData } from "@/components/admin/chapter-form";

export const metadata: Metadata = {
  title: "Modifier le chapitre — Admin",
};

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { formation: { select: { id: true, title: true } } },
  });
  if (!chapter) notFound();

  const data: ChapterFormData = {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    summary: chapter.summary,
    courseMarkdown: chapter.courseMarkdown,
    objectives: chapter.objectives,
    prerequisites: chapter.prerequisites,
  };

  return (
    <div>
      <Link
        href={`/admin/formations/${chapter.formation.id}`}
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Retour aux chapitres
      </Link>
      <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Modifier le chapitre {chapter.number}
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ChapterForm
          formationId={chapter.formation.id}
          formationTitle={chapter.formation.title}
          chapter={data}
        />
      </div>
    </div>
  );
}
