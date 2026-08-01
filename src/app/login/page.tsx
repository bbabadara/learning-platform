import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-500/15 to-violet-500/15 blur-3xl"
      />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
            M
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Connexion</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Accédez à vos formations et suivez votre progression.
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
