"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Mermaid from "./mermaid";

const components: Components = {
  h1: (props) => <h1 className="mb-4 mt-6 text-3xl font-bold" {...props} />,
  h2: (props) => (
    <h2 className="mb-3 mt-8 border-b border-zinc-200 pb-2 text-2xl font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50" {...props} />
  ),
  h3: (props) => <h3 className="mb-2 mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50" {...props} />,
  h4: (props) => <h4 className="mb-2 mt-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50" {...props} />,
  p: (props) => <p className="my-3 leading-7 text-zinc-700 dark:text-zinc-300" {...props} />,
  ul: (props) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-800"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-zinc-900 dark:text-zinc-50" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-4 border-indigo-300 bg-indigo-50/60 px-4 py-2 text-zinc-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-zinc-300"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-zinc-100 dark:bg-zinc-900" {...props} />,
  th: (props) => (
    <th className="border border-zinc-200 px-3 py-2 text-left font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50" {...props} />
  ),
  td: (props) => (
    <td className="border border-zinc-200 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300" {...props} />
  ),
  code: (props) => {
    if (props.className?.includes("language-mermaid")) {
      return <Mermaid code={String(props.children)} />;
    }
    if (props.className?.startsWith("language-")) {
      return <code className="font-mono text-[0.9em]" {...props} />;
    }
    return (
      <code
        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.85em] font-mono text-rose-600 dark:bg-zinc-800 dark:text-rose-400"
        {...props}
      />
    );
  },
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-sm text-zinc-100 dark:border-zinc-800"
      {...props}
    />
  ),
  hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,
};

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
