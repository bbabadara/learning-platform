import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Layers, HelpCircle, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { getFormations } from "@/lib/queries";
import FormationCard from "@/components/formation-card";

export const metadata: Metadata = {
  title: "Accueil",
};

export default async function HomePage() {
  const formations = await getFormations();

  const totalQuiz = formations.reduce((n, f) => n + f.quizCount, 0);
  const totalCards = formations.reduce((n, f) => n + f.flashcardCount, 0);
  const totalChapters = formations.reduce((n, f) => n + f.chapterCount, 0);

  const stats = [
    { label: "Formations", value: formations.length, icon: GraduationCap },
    { label: "Chapitres", value: totalChapters, icon: Layers },
    { label: "Questions QCM", value: totalQuiz, icon: HelpCircle },
    { label: "Flashcards", value: totalCards, icon: BookOpen },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 px-6 py-12 text-center shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl"
        />
        <div className="relative animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            {formations.length} parcours de niveau ingénieur
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Devenez ingénieur{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              full-stack
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {formations.length} formations complètes : cours détaillés, QCM corrigés et flashcards
            pour réviser. Progressez à votre rythme.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#formations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/40"
            >
              Explorer les formations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-12 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/10 text-indigo-600 dark:text-indigo-400">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {s.value}
                </p>
                <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <section id="formations">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Choisissez une formation
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Un parcours complet par domaine, du cours au QCM.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((f) => (
            <FormationCard key={f.id} formation={f} />
          ))}
        </div>
      </section>
    </div>
  );
}
