"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export type AdminQuizQuestion = {
  id: string;
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

type FormState = {
  number: string;
  question: string;
  options: string;
  correctIndex: string;
  explanation: string;
};

const emptyForm: FormState = { number: "", question: "", options: "", correctIndex: "0", explanation: "" };

export default function QuizAdmin({
  chapterId,
  questions,
}: {
  chapterId: string;
  questions: AdminQuizQuestion[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(q: AdminQuizQuestion) {
    setEditingId(q.id);
    setForm({
      number: String(q.number),
      question: q.question,
      options: q.options.join("\n"),
      correctIndex: String(q.correctIndex),
      explanation: q.explanation,
    });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const options = form.options
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = {
      ...(form.number ? { number: Number(form.number) } : {}),
      question: form.question,
      options,
      correctIndex: Number(form.correctIndex),
      explanation: form.explanation,
    };

    const isEdit = editingId !== null;
    const res = await fetch(isEdit ? `/api/admin/quiz-questions/${editingId}` : "/api/admin/quiz-questions", {
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
    setForm(emptyForm);
    router.refresh();
  }

  async function handleDelete(q: AdminQuizQuestion) {
    if (!window.confirm(`Supprimer la question ${q.number} ?`)) return;
    const res = await fetch(`/api/admin/quiz-questions/${q.id}`, { method: "DELETE" });
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
        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Aucune question pour le moment. Ajoutez-en une ci-dessous.
          </p>
        )}
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  <span className="mr-1.5 text-zinc-400">Q{q.number}.</span>
                  {q.question}
                </p>
                <ul className="mt-2 space-y-1">
                  {q.options.map((option, idx) => (
                    <li
                      key={idx}
                      className={`text-sm ${
                        idx === q.correctIndex
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                      {idx === q.correctIndex && " ✓"}
                    </li>
                  ))}
                </ul>
                {q.explanation && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Explication : {q.explanation}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => startEdit(q)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(q)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editingId !== null || questions.length === 0) && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              {editingId !== null ? "Modifier la question" : "Ajouter une question"}
            </span>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
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
              <label htmlFor="q-question" className={labelClass}>Question *</label>
              <input
                id="q-question"
                type="text"
                required
                minLength={3}
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className={inputClass}
                placeholder="Que permet … ?"
              />
            </div>
            <div>
              <label htmlFor="q-options" className={labelClass}>
                Options (une par ligne) *
              </label>
              <textarea
                id="q-options"
                required
                rows={4}
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                className={`${inputClass} font-mono`}
                placeholder={"Première option\nDeuxième option\nTroisième option"}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="q-correct" className={labelClass}>
                  Bonne réponse (index A=0) *
                </label>
                <input
                  id="q-correct"
                  type="number"
                  required
                  min={0}
                  value={form.correctIndex}
                  onChange={(e) => setForm({ ...form, correctIndex: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="q-number" className={labelClass}>Numéro (auto si vide)</label>
                <input
                  id="q-number"
                  type="number"
                  min={0}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className={inputClass}
                  placeholder="auto"
                />
              </div>
            </div>
            <div>
              <label htmlFor="q-explanation" className={labelClass}>Explication</label>
              <textarea
                id="q-explanation"
                rows={2}
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className={inputClass}
                placeholder="Affichée après validation de la réponse"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : editingId !== null ? "Enregistrer" : "Ajouter la question"}
            </button>
            {questions.length > 0 && editingId !== null && (
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

      {editingId === null && questions.length > 0 && (
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
        >
          <Plus className="h-4 w-4" /> Ajouter une question
        </button>
      )}
    </div>
  );
}
