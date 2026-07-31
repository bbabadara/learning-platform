"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Shuffle,
  Check,
  X,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FlashcardData = {
  number: number;
  question: string;
  answer: string;
};

export default function FlashcardsDeck({ cards }: { cards: FlashcardData[] }) {
  const [order, setOrder] = useState<number[]>(() => cards.map((c) => c.number));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const currentNumber = order[index];
  const card = useMemo(() => cards.find((c) => c.number === currentNumber)!, [cards, currentNumber]);

  function shuffle() {
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
  }

  function reset() {
    setOrder(cards.map((c) => c.number));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
  }

  function mark(result: "known" | "unknown") {
    if (result === "known") setKnown((s) => new Set(s).add(card.number));
    else setUnknown((s) => new Set(s).add(card.number));
    if (index === order.length - 1) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function prev() {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setFlipped(false);
  }

  function next() {
    if (index === order.length - 1) return;
    setIndex((i) => i + 1);
    setFlipped(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl py-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Layers className="h-8 w-8" />
          </span>
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Session terminée !</h3>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-emerald-500">{known.size}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Acquises</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-red-500">{unknown.size}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">À revoir</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          {unknown.size > 0 && (
            <button
              onClick={() => {
                setOrder([...unknown]);
                setIndex(0);
                setFlipped(false);
                setKnown(new Set());
                setUnknown(new Set());
                setFinished(false);
              }}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              Revoir les {unknown.size} à retravailler
            </button>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <RefreshCcw className="h-4 w-4" /> Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Carte {index + 1} / {order.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> {known.size}
          </span>
          <span className="inline-flex items-center gap-1 text-red-500">
            <X className="h-3.5 w-3.5" /> {unknown.size}
          </span>
        </div>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${(index / order.length) * 100}%` }}
        />
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "relative flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all",
          flipped
            ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600",
        )}
      >
        <span className="absolute left-4 top-4 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {flipped ? "Réponse" : "Question"}
        </span>
        <p className="max-w-lg text-xl font-semibold leading-8 text-zinc-900 dark:text-zinc-50">
          {flipped ? card.answer : card.question}
        </p>
        <span className="absolute bottom-4 text-xs text-zinc-400 dark:text-zinc-500">
          Cliquez pour {flipped ? "voir la question" : "retourner la carte"}
        </span>
      </button>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {flipped ? (
          <>
            <button
              onClick={() => mark("unknown")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
            >
              <X className="h-4 w-4" /> À revoir
            </button>
            <button
              onClick={() => mark("known")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <Check className="h-4 w-4" /> Acquise
            </button>
          </>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Voir la réponse
          </button>
        )}

        <button
          onClick={next}
          disabled={index === order.length - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={shuffle}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <Shuffle className="h-4 w-4" /> Mélanger
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <RefreshCcw className="h-4 w-4" /> Réinitialiser
        </button>
      </div>
    </div>
  );
}
