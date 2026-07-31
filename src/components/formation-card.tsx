import Link from "next/link";
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
  Layers,
} from "lucide-react";
import type { FormationWithStats } from "@/lib/queries";

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

export default function FormationCard({ formation }: { formation: FormationWithStats }) {
  const Icon = ICONS[formation.icon] ?? BookOpen;

  return (
    <Link
      href={`/formation/${formation.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: formation.color }}
      />
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: formation.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50">
          {formation.title}
        </h2>
      </div>
      {formation.tagline && (
        <p className="mb-4 text-sm font-medium" style={{ color: formation.color }}>
          {formation.tagline}
        </p>
      )}
      <p className="mb-6 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {formation.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {formation.chapterCount} chapitres
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5" />
          {formation.quizCount} questions
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          {formation.flashcardCount} flashcards
        </span>
      </div>
    </Link>
  );
}
