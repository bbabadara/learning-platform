"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type FormationFormData = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  order: number;
};

const ICON_OPTIONS = [
  "BookOpen",
  "LayoutGrid",
  "Server",
  "Infinity",
  "Coffee",
  "Code2",
  "Puzzle",
  "GitBranch",
  "Rocket",
  "CodeXml",
  "Network",
  "Binary",
  "Smartphone",
  "Bug",
];

const COLOR_OPTIONS = [
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
];

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function FormationForm({ formation }: { formation?: FormationFormData }) {
  const router = useRouter();
  const isEdit = !!formation;

  const [title, setTitle] = useState(formation?.title ?? "");
  const [slug, setSlug] = useState(formation?.slug ?? "");
  const [tagline, setTagline] = useState(formation?.tagline ?? "");
  const [description, setDescription] = useState(formation?.description ?? "");
  const [icon, setIcon] = useState(formation?.icon ?? "BookOpen");
  const [color, setColor] = useState(formation?.color ?? "#6366f1");
  const [order, setOrder] = useState(formation?.order ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isEdit ? `/api/admin/formations/${formation!.id}` : "/api/admin/formations";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || undefined,
        tagline,
        description,
        icon,
        color,
        order: Number(order) || 0,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin");
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
            placeholder="Ex : Modern AI Engineering"
          />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug (URL)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClass}
            placeholder="auto-généré depuis le titre"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tagline" className={labelClass}>
          Accroche
        </label>
        <input
          id="tagline"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className={inputClass}
          placeholder="Ex : De débutant à architecte"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Présentation de la formation"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="icon" className={labelClass}>
            Icône
          </label>
          <select
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={inputClass}
          >
            {ICON_OPTIONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Ordre d&apos;affichage
          </label>
          <input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Couleur</span>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
              className={`h-8 w-8 rounded-full border-2 transition-transform ${
                color === c ? "scale-110 border-zinc-900 dark:border-zinc-100" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-zinc-300 bg-white dark:border-zinc-700"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{color}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer la formation"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
