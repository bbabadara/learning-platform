import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Mon profil",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { progress: true } } },
  });
  if (!user) redirect("/login");

  const completedChapters = await prisma.userProgress.count({
    where: { userId: user.id, status: "completed" },
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mon profil
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gérez vos informations personnelles.
        </p>
      </div>
      <ProfileForm
        name={user.name}
        email={user.email}
        role={user.role}
        isDemo={user.isDemo}
        createdAt={user.createdAt}
        progressCount={user._count.progress}
        completedChapters={completedChapters}
      />
    </div>
  );
}
