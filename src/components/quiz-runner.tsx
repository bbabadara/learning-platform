"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizQuestionData = {
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizRunner({
  chapterId,
  questions,
  hasSession,
}: {
  chapterId: string;
  questions: QuizQuestionData[];
  hasSession: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);

  const question = questions[current];
  const isLast = current === questions.length - 1;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  async function submitScore(finalScore: number) {
    if (!hasSession || saved) return;
    setSaved(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, quizScore: finalScore }),
      });
    } catch {
      setSaved(false);
    }
  }

  function validate() {
    if (selected === null) return;
    const nextAnswers = { ...answers, [question.number]: selected };
    setAnswers(nextAnswers);
    setValidated(true);
    const count = Object.keys(nextAnswers).filter(
      (n) => nextAnswers[Number(n)] === questions.find((q) => q.number === Number(n))?.correctIndex,
    ).length;
    setScore(count);
  }

  function next() {
    if (isLast) {
      const finalScore = Math.round(
        (Object.keys(answers).filter(
          (n) => answers[Number(n)] === questions.find((q) => q.number === Number(n))?.correctIndex,
        ).length /
          questions.length) *
          100,
      );
      setFinished(true);
      submitScore(finalScore);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setValidated(false);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setValidated(false);
    setAnswers({});
    setFinished(false);
    setScore(0);
    setSaved(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl py-8 text-center">
        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Award className="h-8 w-8" />
          </span>
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Quiz terminé !</h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Vous avez obtenu{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{score}</span> bonnes
          réponses sur {questions.length}.
        </p>
        <p className="mt-1 text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {Math.round((score / questions.length) * 100)}%
        </p>
        {hasSession && (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {saved ? "Score enregistré dans votre progression." : "Enregistrement du score..."}
          </p>
        )}
        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <RotateCcw className="h-4 w-4" /> Recommencer
        </button>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === question.correctIndex;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            Question {current + 1} / {questions.length}
          </span>
          <span>{answeredCount} répondues</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${((current + (validated ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="mb-5 text-lg font-semibold leading-7 text-zinc-900 dark:text-zinc-50">
        {question.question}
      </h3>

      <div className="space-y-2.5">
        {question.options.map((option, idx) => {
          const chosen = selected === idx;
          const showResult = validated && (chosen || idx === question.correctIndex);
          return (
            <button
              key={idx}
              disabled={validated}
              onClick={() => setSelected(idx)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                !validated &&
                  "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40",
                validated &&
                  idx === question.correctIndex &&
                  "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50",
                validated &&
                  chosen &&
                  idx !== question.correctIndex &&
                  "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/50",
                validated &&
                  !chosen &&
                  idx !== question.correctIndex &&
                  "border-zinc-200 opacity-60 dark:border-zinc-700",
                !validated && chosen && "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  showResult
                    ? idx === question.correctIndex
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : chosen
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-zinc-300 text-zinc-500 dark:border-zinc-600"
                    : chosen
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-zinc-300 text-zinc-500 dark:border-zinc-600",
                )}
              >
                {LETTERS[idx]}
              </span>
              <span className="leading-6 text-zinc-800 dark:text-zinc-200">{option}</span>
              {showResult &&
                (idx === question.correctIndex ? (
                  <CheckCircle2 className="ml-auto mt-1 h-5 w-5 shrink-0 text-emerald-500" />
                ) : chosen ? (
                  <XCircle className="ml-auto mt-1 h-5 w-5 shrink-0 text-red-500" />
                ) : null)}
            </button>
          );
        })}
      </div>

      {validated && question.explanation && (
        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3 text-sm leading-6",
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100",
          )}
        >
          <p className="font-semibold">
            {isCorrect ? "Bonne réponse !" : "Mauvaise réponse."}
          </p>
          {question.explanation && <p className="mt-1">{question.explanation}</p>}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!validated ? (
          <button
            onClick={validate}
            disabled={selected === null}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            Valider
          </button>
        ) : (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {isLast ? "Voir les résultats" : "Question suivante"}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
