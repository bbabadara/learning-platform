import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FlashcardsAdmin from "@/components/admin/flashcards-admin";

export const metadata: Metadata = {
  title: "Flashcards — Admin",
};

export default async function AdminFlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      formation: { select: { title: true, slug: true } },
      flashcards: { orderBy: { number: "asc" } },
    },
  });
  if (!chapter) notFound();

  const flashcards = chapter.flashcards.map((f) => ({
    id: f.id,
    number: f.number,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div>
      <Link
        href={`/admin/formations/${chapter.formationId}`}
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Chapitres de « {chapter.formation.title} »
      </Link>

      <div className="mb-5">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Flashcards du chapitre {chapter.number}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{chapter.title}</p>
      </div>

      <FlashcardsAdmin chapterId={chapter.id} flashcards={flashcards} />
    </div>
  );
}
