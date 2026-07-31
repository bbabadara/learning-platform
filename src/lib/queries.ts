import { prisma } from "./prisma";

export type FormationWithStats = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  chapterCount: number;
  quizCount: number;
  flashcardCount: number;
};

export type ChapterWithMeta = {
  id: string;
  number: number;
  title: string;
  folderName: string;
  summary: string;
  hasQuiz: boolean;
  hasFlashcards: boolean;
  quizCount: number;
  flashcardCount: number;
};

export type ProgressState = {
  status: string;
  quizScore: number | null;
  quizCompletedAt: Date | null;
  lastReadAt: Date | null;
} | null;

export async function getFormations(): Promise<FormationWithStats[]> {
  const formations = await prisma.formation.findMany({
    orderBy: { order: "asc" },
    include: {
      chapters: {
        select: {
          hasQuiz: true,
          hasFlashcards: true,
          _count: { select: { quizQuestions: true, flashcards: true } },
        },
      },
    },
  });

  return formations.map((f) => ({
    id: f.id,
    slug: f.slug,
    title: f.title,
    tagline: f.tagline,
    description: f.description,
    icon: f.icon,
    color: f.color,
    chapterCount: f.chapters.length,
    quizCount: f.chapters.reduce((n, c) => n + c._count.quizQuestions, 0),
    flashcardCount: f.chapters.reduce((n, c) => n + c._count.flashcards, 0),
  }));
}

export async function getFormationBySlug(slug: string) {
  return prisma.formation.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { number: "asc" },
        select: {
          id: true,
          number: true,
          title: true,
          folderName: true,
          summary: true,
          hasQuiz: true,
          hasFlashcards: true,
          _count: { select: { quizQuestions: true, flashcards: true } },
        },
      },
    },
  });
}

export async function getChapter(
  formationId: string,
  chapterNumber: number,
) {
  return prisma.chapter.findUnique({
    where: { formationId_number: { formationId, number: chapterNumber } },
    include: {
      quizQuestions: { orderBy: { number: "asc" } },
      flashcards: { orderBy: { number: "asc" } },
    },
  });
}

export async function getChapterProgress(
  userId: string,
  chapterId: string,
): Promise<ProgressState> {
  const p = await prisma.userProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });
  if (!p) return null;
  return {
    status: p.status,
    quizScore: p.quizScore,
    quizCompletedAt: p.quizCompletedAt,
    lastReadAt: p.lastReadAt,
  };
}

export async function getChaptersProgress(
  userId: string,
  chapterIds: string[],
) {
  const rows = await prisma.userProgress.findMany({
    where: { userId, chapterId: { in: chapterIds } },
  });
  return new Map(rows.map((r) => [r.chapterId, r.status]));
}

export async function getFormationProgress(
  userId: string,
  formationId: string,
): Promise<{ done: number; total: number }> {
  const chapters = await prisma.chapter.findMany({
    where: { formationId },
    select: { id: true },
  });
  const total = chapters.length;
  const done = await prisma.userProgress.count({
    where: { userId, chapterId: { in: chapters.map((c) => c.id) }, status: "completed" },
  });
  return { done, total };
}
