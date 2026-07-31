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
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Connexion</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Accédez à vos formations et suivez votre progression.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
