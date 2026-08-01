"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Circle,
  HelpCircle,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChapterSidebarItem = {
  number: number;
  title: string;
  hasQuiz: boolean;
  hasFlashcards: boolean;
  status: string;
};

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />;
  }
  if (status === "in_progress") {
    return <PlayCircle className="h-4 w-4 shrink-0 text-amber-500" />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />;
}

function ChapterList({
  slug,
  chapters,
  currentNumber,
  color,
}: {
  slug: string;
  chapters: ChapterSidebarItem[];
  currentNumber: number;
  color: string;
}) {
  return (
    <nav className="space-y-0.5">
      {chapters.map((c) => {
        const current = c.number === currentNumber;
        return (
          <Link
            key={c.number}
            href={`/formation/${slug}/${c.number}`}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              current
                ? "bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                current
                  ? "text-white"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
              )}
              style={current ? { backgroundColor: color } : undefined}
            >
              {c.number}
            </span>
            <span className="min-w-0 flex-1 truncate">{c.title}</span>
            <span className="flex shrink-0 items-center gap-1">
              {c.hasQuiz && <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />}
              {c.hasFlashcards && <Layers className="h-3.5 w-3.5 text-zinc-400" />}
              <StatusIcon status={c.status} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function TocContent({
  slug,
  title,
  color,
  chapters,
  currentNumber,
  done,
  total,
  hasSession,
}: {
  slug: string;
  title: string;
  color: string;
  chapters: ChapterSidebarItem[];
  currentNumber: number;
  done: number;
  total: number;
  hasSession: boolean;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <Link
        href={`/formation/${slug}`}
        className="group mb-3 flex items-center gap-2.5"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {title.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-50 dark:group-hover:text-zinc-300">
            {title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {chapters.length} chapitres · Chapitre {currentNumber}
          </p>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400 dark:text-zinc-600" />
      </Link>

      {hasSession && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Progression</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      )}

      <ChapterList
        slug={slug}
        chapters={chapters}
        currentNumber={currentNumber}
        color={color}
      />
    </>
  );
}

export default function ChapterSidebar(props: {
  slug: string;
  title: string;
  color: string;
  chapters: ChapterSidebarItem[];
  currentNumber: number;
  done: number;
  total: number;
  hasSession: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          <span className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: props.color }}
            >
              {props.currentNumber}
            </span>
            Sommaire
          </span>
          <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
            <TocContent {...props} />
          </div>
        )}
      </div>

      <aside className="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-72 shrink-0 flex-col overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
        <TocContent {...props} />
      </aside>
    </>
  );
}
