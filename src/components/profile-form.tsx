"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function ProfileForm({
  name: initialName,
  email: initialEmail,
  role,
  isDemo,
  createdAt,
  progressCount,
  completedChapters,
}: {
  name: string;
  email: string;
  role: string;
  isDemo: boolean;
  createdAt: Date;
  progressCount: number;
  completedChapters: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const body: Record<string, string> = { name };
    if (email !== initialEmail) body.email = email;
    if (newPassword) {
      body.newPassword = newPassword;
      body.currentPassword = currentPassword;
    } else if (email !== initialEmail) {
      body.currentPassword = currentPassword;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    setSuccess("Profil mis à jour.");
    setCurrentPassword("");
    setNewPassword("");
    router.refresh();
  }

  const needsPassword = email !== initialEmail || newPassword.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{completedChapters}</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">chapitres terminés</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{progressCount}</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">chapitres suivis</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {role === "admin" ? "Admin" : "Étudiant"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">rôle</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            {success}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className={labelClass}>Nom</label>
            <input
              id="profile-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-email" className={labelClass}>Email</label>
            <input
              id="profile-email"
              type="email"
              required
              disabled={isDemo}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {isDemo && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                L&apos;email du compte démo ne peut pas être modifié.
              </p>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Changer de mot de passe
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="profile-current" className={labelClass}>
                  Mot de passe actuel
                </label>
                <input
                  id="profile-current"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="profile-new" className={labelClass}>
                  Nouveau mot de passe
                </label>
                <input
                  id="profile-new"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="8 caractères minimum"
                />
              </div>
            </div>
          </div>

          {needsPassword && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              Entrez votre mot de passe actuel pour valider les changements d&apos;email ou de mot de passe.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          {success && (
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Retour à l&apos;accueil
            </Link>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Membre depuis le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(createdAt)}.
        </p>
      </div>

      {role === "admin" && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <LayoutDashboard className="h-4 w-4" /> Aller à l&apos;administration
        </Link>
      )}
    </div>
  );
}
