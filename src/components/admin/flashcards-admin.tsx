"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export type AdminFlashcard = {
  id: string;
  number: number;
  question: string;
  answer: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function FlashcardsAdmin({
  chapterId,
  flashcards,
}: {
  chapterId: string;
  flashcards: AdminFlashcard[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startAdd() {
    setEditingId(null);
    setNumber("");
    setQuestion("");
    setAnswer("");
    setError(null);
  }

  function startEdit(f: AdminFlashcard) {
    setEditingId(f.id);
    setNumber(String(f.number));
    setQuestion(f.question);
    setAnswer(f.answer);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = { ...(number ? { number: Number(number) } : {}), question, answer };
    const isEdit = editingId !== null;
    const res = await fetch(isEdit ? `/api/admin/flashcards/${editingId}` : "/api/admin/flashcards", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? body : { ...body, chapterId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    setEditingId(null);
    startAdd();
    router.refresh();
  }

  async function handleDelete(f: AdminFlashcard) {
    if (!window.confirm(`Supprimer la flashcard ${f.number} ?`)) return;
    const res = await fetch(`/api/admin/flashcards/${f.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Échec de la suppression.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {flashcards.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Aucune flashcard pour le moment. Ajoutez-en une ci-dessous.
          </p>
        )}
        {flashcards.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  <span className="mr-1.5 text-zinc-400">F{f.number}.</span>
                  {f.question}
                </p>
                <p className="mt-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {f.answer}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => startEdit(f)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(f)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editingId !== null || flashcards.length === 0) && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              {editingId !== null ? "Modifier la flashcard" : "Ajouter une flashcard"}
            </span>
            {editingId !== null && (
              <button
                type="button"
                onClick={startAdd}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </h3>

          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="f-question" className={labelClass}>Question *</label>
              <input
                id="f-question"
                type="text"
                required
                minLength={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={inputClass}
                placeholder="Face avant de la carte"
              />
            </div>
            <div>
              <label htmlFor="f-answer" className={labelClass}>Réponse *</label>
              <textarea
                id="f-answer"
                required
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className={inputClass}
                placeholder="Face arrière de la carte"
              />
            </div>
            <div>
              <label htmlFor="f-number" className={labelClass}>Numéro (auto si vide)</label>
              <input
                id="f-number"
                type="number"
                min={0}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className={inputClass}
                placeholder="auto"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : editingId !== null ? "Enregistrer" : "Ajouter la flashcard"}
            </button>
            {flashcards.length > 0 && editingId !== null && (
              <button
                type="button"
                onClick={startAdd}
                className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Ajouter une autre
              </button>
            )}
          </div>
        </form>
      )}

      {editingId === null && flashcards.length > 0 && (
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
        >
          <Plus className="h-4 w-4" /> Ajouter une flashcard
        </button>
      )}
    </div>
  );
}
