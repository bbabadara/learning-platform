import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  BookOpen,
  HelpCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  getFormationBySlug,
  getChapter,
  getChapterProgress,
  getChaptersProgress,
  getFormationProgress,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import Markdown from "@/components/markdown";
import CourseReader from "@/components/course-reader";
import QuizRunner, { type QuizQuestionData } from "@/components/quiz-runner";
import FlashcardsDeck, { type FlashcardData } from "@/components/flashcards-deck";
import ChapterTracker from "@/components/chapter-tracker";
import ChapterSidebar, { type ChapterSidebarItem } from "@/components/chapter-sidebar";

export const metadata: Metadata = {
  title: "Chapitre",
};

export default async function ChapterPage(
  props: PageProps<"/formation/[slug]/[chapterNumber]">,
) {
  const { slug, chapterNumber } = await props.params;
  const searchParams = await props.searchParams;
  const number = Number(chapterNumber);
  if (!Number.isInteger(number)) notFound();

  const [session, formation] = await Promise.all([
    getServerSession(authOptions),
    getFormationBySlug(slug),
  ]);
  if (!formation) notFound();

  const chapter = await getChapter(formation.id, number);
  if (!chapter) notFound();

  const hasCourse = chapter.courseMarkdown.trim().length > 0;
  const hasQuiz = chapter.quizQuestions.length > 0;
  const hasCards = chapter.flashcards.length > 0;

  const tabs = [
    { id: "cours", label: "Cours", icon: BookOpen, available: hasCourse },
    { id: "quiz", label: "Quiz", icon: HelpCircle, available: hasQuiz },
    { id: "flashcards", label: "Flashcards", icon: Layers, available: hasCards },
  ].filter((t) => t.available);

  const defaultTab = hasCourse ? "cours" : hasQuiz ? "quiz" : "flashcards";
  const requestedTab = typeof searchParams.tab === "string" ? searchParams.tab : null;
  const activeTab =
    requestedTab && tabs.some((t) => t.id === requestedTab) ? requestedTab : defaultTab;

  const progress = session?.user?.id
    ? await getChapterProgress(session.user.id, chapter.id)
    : null;

  const chapterList = formation.chapters;
  const currentIndex = chapterList.findIndex((c) => c.number === number);
  const prevChapter = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;

  let sidebarItems: ChapterSidebarItem[] = [];
  let done = 0;
  const total = chapterList.length;
  if (session?.user?.id) {
    const chapterIds = chapterList.map((c) => c.id);
    const progressMap = await getChaptersProgress(session.user.id, chapterIds);
    const f = await getFormationProgress(session.user.id, formation.id);
    done = f.done;
    sidebarItems = chapterList.map((c) => ({
      number: c.number,
      title: c.title,
      hasQuiz: c.hasQuiz,
      hasFlashcards: c.hasFlashcards,
      status: progressMap.get(c.id) ?? "not_started",
    }));
  } else {
    sidebarItems = chapterList.map((c) => ({
      number: c.number,
      title: c.title,
      hasQuiz: c.hasQuiz,
      hasFlashcards: c.hasFlashcards,
      status: "not_started",
    }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:flex lg:gap-8">
      <ChapterSidebar
        slug={formation.slug}
        title={formation.title}
        color={formation.color}
        chapters={sidebarItems}
        currentNumber={number}
        done={done}
        total={total}
        hasSession={!!session?.user?.id}
      />

      <div className="min-w-0 flex-1">
        <ChapterTracker chapterId={chapter.id} hasSession={!!session?.user?.id} />

        <Link
          href={`/formation/${formation.slug}`}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" /> {formation.title}
        </Link>

        <div className="mb-6">
          <p className="mb-1 text-sm font-medium" style={{ color: formation.color }}>
            Chapitre {chapter.number}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            {chapter.title}
          </h1>
          {chapter.summary && (
            <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-300">{chapter.summary}</p>
          )}
          {progress && progress.status === "completed" && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {progress.quizScore !== null
                ? `Terminé — Score : ${progress.quizScore}%`
                : "Chapitre terminé"}
            </p>
          )}
        </div>

        <nav className="mb-8 flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/formation/${formation.slug}/${number}?tab=${tab.id}`}
                className={cn(
                  "inline-flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:py-2 sm:text-sm",
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {activeTab === "cours" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <CourseReader content={chapter.courseMarkdown} />
            <Markdown content={chapter.courseMarkdown} />
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <QuizRunner
              chapterId={chapter.id}
              hasSession={!!session?.user?.id}
              questions={chapter.quizQuestions as QuizQuestionData[]}
            />
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <FlashcardsDeck cards={chapter.flashcards as FlashcardData[]} />
          </div>
        )}

        <div className="mt-10 flex items-stretch justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          {prevChapter ? (
            <Link
              href={`/formation/${formation.slug}/${prevChapter.number}`}
              className="group inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span className="min-w-0">
                <span className="block text-xs text-zinc-400 dark:text-zinc-500">Précédent</span>
                <span className="block truncate">
                  Chapitre {prevChapter.number} — {prevChapter.title}
                </span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {nextChapter ? (
            <Link
              href={`/formation/${formation.slug}/${nextChapter.number}`}
              className="group inline-flex min-w-0 flex-1 items-center justify-end gap-2 text-right text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              <span className="min-w-0">
                <span className="block text-xs text-zinc-400 dark:text-zinc-500">Suivant</span>
                <span className="block truncate">
                  Chapitre {nextChapter.number} — {nextChapter.title}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
