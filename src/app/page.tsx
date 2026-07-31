import type { Metadata } from "next";
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <section className="mb-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Devenez ingénieur{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              full-stack
            </span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {formations.length} formations complètes de niveau ingénieur : cours détaillés, QCM
            corrigés et flashcards pour réviser. Progressez à votre rythme.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <span>{formations.length} formations</span>
            <span>{totalChapters} chapitres</span>
            <span>{totalQuiz} questions QCM</span>
            <span>{totalCards} flashcards</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Choisissez une formation
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((f) => (
            <FormationCard key={f.id} formation={f} />
          ))}
        </div>
      </section>
    </div>
  );
}
