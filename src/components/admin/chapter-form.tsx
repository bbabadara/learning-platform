"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ChapterFormData = {
  id: string;
  number: number;
  title: string;
  summary: string;
  courseMarkdown: string;
  objectives: unknown;
  prerequisites: unknown;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function toLines(value: unknown): string {
  return Array.isArray(value) ? value.join("\n") : "";
}

export default function ChapterForm({
  formationId,
  formationTitle,
  chapter,
}: {
  formationId: string;
  formationTitle?: string;
  chapter?: ChapterFormData;
}) {
  const router = useRouter();
  const isEdit = !!chapter;

  const [number, setNumber] = useState(chapter?.number ?? 0);
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [summary, setSummary] = useState(chapter?.summary ?? "");
  const [courseMarkdown, setCourseMarkdown] = useState(chapter?.courseMarkdown ?? "");
  const [objectives, setObjectives] = useState(toLines(chapter?.objectives));
  const [prerequisites, setPrerequisites] = useState(toLines(chapter?.prerequisites));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      number: number > 0 ? number : undefined,
      title,
      summary,
      courseMarkdown,
      objectives: objectives
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      prerequisites: prerequisites
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const url = isEdit ? `/api/admin/chapters/${chapter!.id}` : "/api/admin/chapters";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? body : { ...body, formationId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    router.push(`/admin/formations/${formationId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="number" className={labelClass}>
            Numéro (auto si vide)
          </label>
          <input
            id="number"
            type="number"
            min={0}
            value={number || ""}
            onChange={(e) => setNumber(Number(e.target.value))}
            className={inputClass}
            placeholder="auto"
          />
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>
            Titre *
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Ex : Chapitre 05 — Bases de Données"
          />
        </div>
      </div>

      <div>
        <label htmlFor="summary" className={labelClass}>
          Résumé
        </label>
        <textarea
          id="summary"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={inputClass}
          placeholder="Court résumé affiché dans la liste des chapitres"
        />
      </div>

      <div>
        <label htmlFor="courseMarkdown" className={labelClass}>
          Contenu du cours (Markdown)
        </label>
        <textarea
          id="courseMarkdown"
          rows={14}
          value={courseMarkdown}
          onChange={(e) => setCourseMarkdown(e.target.value)}
          className={`${inputClass} font-mono`}
          placeholder={"# Titre\n\nRédigez le cours en Markdown (## sections, - listes, ```code```, tableaux...)."}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="objectives" className={labelClass}>
            Objectifs (un par ligne)
          </label>
          <textarea
            id="objectives"
            rows={4}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            className={inputClass}
            placeholder={"Comprendre les bases\nSavoir configurer un serveur"}
          />
        </div>
        <div>
          <label htmlFor="prerequisites" className={labelClass}>
            Prérequis (un par ligne)
          </label>
          <textarea
            id="prerequisites"
            rows={4}
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            className={inputClass}
            placeholder={"Connaître le HTML\nNotions de JavaScript"}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer le chapitre"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Annuler
        </button>
      </div>

      {formationTitle && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Formation : {formationTitle}
        </p>
      )}
    </form>
  );
}
