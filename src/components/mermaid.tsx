"use client";

import { useEffect, useState } from "react";

type RenderState = {
  code: string;
  svg: string | null;
  error: boolean;
};

export default function Mermaid({ code }: { code: string }) {
  const [state, setState] = useState<RenderState>({ code, svg: null, error: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "neutral",
        });
        const id = `mmd-${crypto.randomUUID()}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled) setState({ code, svg, error: false });
      } catch {
        if (!cancelled) setState({ code, svg: null, error: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (state.code !== code) {
    return (
      <div className="my-4 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Diagramme en cours de génération...
      </div>
    );
  }

  if (state.error) {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <code>{code}</code>
      </pre>
    );
  }

  if (!state.svg) {
    return (
      <div className="my-4 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Diagramme en cours de génération...
      </div>
    );
  }

  return <div className="my-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: state.svg }} />;
}
