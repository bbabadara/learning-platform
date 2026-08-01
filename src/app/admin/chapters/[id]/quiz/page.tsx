import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizAdmin from "@/components/admin/quiz-admin";

export const metadata: Metadata = {
  title: "QCM — Admin",
};

export default async function AdminQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      formation: { select: { title: true, slug: true } },
      quizQuestions: { orderBy: { number: "asc" } },
    },
  });
  if (!chapter) notFound();

  const questions = chapter.quizQuestions.map((q) => ({
    id: q.id,
    number: q.number,
    question: q.question,
    options: (q.options as string[]) ?? [],
    correctIndex: q.correctIndex,
    explanation: q.explanation,
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
          QCM du chapitre {chapter.number}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{chapter.title}</p>
      </div>

      <QuizAdmin chapterId={chapter.id} questions={questions} />
    </div>
  );
}
