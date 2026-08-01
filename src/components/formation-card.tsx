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
  ArrowRight,
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
  const glow = /^#[0-9a-fA-F]{6}$/.test(formation.color)
    ? `${formation.color}1a`
    : undefined;

  return (
    <Link
      href={`/formation/${formation.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/40"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: formation.color }}
      />
      {glow && (
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: glow }}
        />
      )}
      <div className="relative mb-4 flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: formation.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50">
          {formation.title}
        </h2>
      </div>
      {formation.tagline && (
        <p className="relative mb-4 text-sm font-medium" style={{ color: formation.color }}>
          {formation.tagline}
        </p>
      )}
      <p className="relative mb-6 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {formation.description}
      </p>
      <div className="relative flex items-center justify-between gap-3">
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
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-indigo-400">
          Explorer
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
