"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  label,
  message,
  compact = false,
}: {
  url: string;
  label: string;
  message?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(message ?? `Supprimer ${label} ? Cette action est définitive.`)) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Échec de la suppression.");
        setLoading(false);
      }
    } catch {
      alert("Échec de la suppression.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={
        compact
          ? "inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-500 disabled:opacity-50"
          : "inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
      }
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
