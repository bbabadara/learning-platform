import type { Metadata } from "next";
import Link from "next/link";
import FormationForm from "@/components/admin/formation-form";

export const metadata: Metadata = {
  title: "Nouvelle formation — Admin",
};

export default function NewFormationPage() {
  return (
    <div>
      <Link
        href="/admin/formations"
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Retour aux formations
      </Link>
      <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Nouvelle formation
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <FormationForm />
      </div>
    </div>
  );
}
