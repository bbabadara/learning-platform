import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  LayoutGrid,
  Server,
  Infinity,
  Coffee,
  Code2,
  Puzzle,
  GitBranch,
  Rocket,
  CodeXml,
  Network,
  Binary,
  Smartphone,
  Bug,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Circle,
  PlayCircle,
  Layers,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  getFormationBySlug,
  getChaptersProgress,
  getFormationProgress,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Formation",
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Server,
  Infinity,
  Coffee,
  Code2,
  Puzzle,
  GitBranch,
  Rocket,
  CodeXml,
  Network,
  Binary,
  Smartphone,
  Bug,
};

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 sm:px-2.5">
        <CheckCircle2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Terminé</span>
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400 sm:px-2.5">
        <PlayCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">En cours</span>
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:px-2.5">
      <Circle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Non commencé</span>
    </span>
  );
}

export default async function FormationPage(props: PageProps<"/formation/[slug]">) {
  const { slug } = await props.params;
  const [session, formation] = await Promise.all([
    getServerSession(authOptions),
    getFormationBySlug(slug),
  ]);

  if (!formation) notFound();

  const Icon = ICONS[formation.icon] ?? BookOpen;
  const glow = /^#[0-9a-fA-F]{6}$/.test(formation.color)
    ? `${formation.color}26`
    : undefined;

  let progressMap = new Map<string, string>();
  let done = 0;
  let total = formation.chapters.length;
  if (session?.user?.id) {
    const chapterIds = formation.chapters.map((c) => c.id);
    progressMap = await getChaptersProgress(session.user.id, chapterIds);
    const f = await getFormationProgress(session.user.id, formation.id);
    done = f.done;
    total = f.total;
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ChevronLeft className="h-4 w-4" /> Toutes les formations
      </Link>

      <div className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8">
        {glow && (
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 blur-2xl"
            style={{ backgroundColor: glow }}
          />
        )}
        <div className="relative flex items-start gap-3 sm:gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md sm:h-16 sm:w-16"
            style={{ backgroundColor: formation.color }}
          >
            <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {formation.title}
            </h1>
            {formation.tagline && (
              <p className="mt-1 font-medium" style={{ color: formation.color }}>
                {formation.tagline}
              </p>
            )}
          </div>
        </div>

        {formation.description && (
          <p className="relative mt-4 leading-7 text-zinc-600 dark:text-zinc-300">
            {formation.description}
          </p>
        )}

        {session?.user ? (
          <div className="relative mt-6">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Progression</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {done}/{total} chapitres terminés · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full shadow-sm transition-all"
                style={{ width: `${pct}%`, backgroundColor: formation.color }}
              />
            </div>
          </div>
        ) : (
          <p className="relative mt-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Connectez-vous
            </Link>{" "}
            pour suivre votre progression.
          </p>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Chapitres</h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {formation.chapters.length} chapitres pour maîtriser le domaine.
          </p>
        </div>
        <ol className="space-y-3">
          {formation.chapters.map((c) => {
            const status = progressMap.get(c.id) ?? "not_started";
            return (
              <li key={c.id}>
                <Link
                  href={`/formation/${formation.slug}/${c.number}`}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900",
                    status === "completed"
                      ? "border-emerald-200 dark:border-emerald-900"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
                  )}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: formation.color }}
                  >
                    {c.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-50 dark:group-hover:text-zinc-300">
                      {c.title}
                    </p>
                    {c.summary && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {c.summary}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                      {c.hasQuiz && (
                        <span className="inline-flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" /> {c._count.quizQuestions} QCM
                        </span>
                      )}
                      {c.hasFlashcards && (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" /> {c._count.flashcards} flashcards
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={status} />
                    <ArrowRight className="h-4 w-4 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400 dark:text-zinc-600" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
