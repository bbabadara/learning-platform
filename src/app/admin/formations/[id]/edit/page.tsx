import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormationForm, { type FormationFormData } from "@/components/admin/formation-form";

export const metadata: Metadata = {
  title: "Modifier — Admin",
};

export default async function EditFormationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formation = await prisma.formation.findUnique({ where: { id } });
  if (!formation) notFound();

  const data: FormationFormData = {
    id: formation.id,
    slug: formation.slug,
    title: formation.title,
    tagline: formation.tagline,
    description: formation.description,
    icon: formation.icon,
    color: formation.color,
    order: formation.order,
  };

  return (
    <div>
      <Link
        href="/admin"
        className="mb-4 inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
      >
        ← Retour au tableau de bord
      </Link>
      <h2 className="mb-5 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Modifier la formation
      </h2>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <FormationForm formation={data} />
      </div>
    </div>
  );
}
