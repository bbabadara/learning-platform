export type TextSegment = {
  id: number;
  text: string;
};

function splitSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized.split(
    /(?<=[.!?…;])\s+(?=[«"'\s]*[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ0-9#])/,
  );
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function toSegments(markdown: string): TextSegment[] {
  let md = markdown.replace(/^\uFEFF/, "");

  md = md.replace(/^---[\s\S]*?---\s*/m, "");
  md = md.replace(/```[\s\S]*?```/g, "");
  md = md.replace(/\$\$[\s\S]*?\$\$/g, "");
  md = md.replace(/\$[^$\n]+\$/g, "");
  md = md.replace(/<!--[\s\S]*?-->/g, "");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/!\[[^\]]*\]\([^)]*\)/g, "");

  const sentences: string[] = [];

  const push = (line: string) => {
    const t = line
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[`*_~#]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!t || /^[-*]\s*$/.test(t)) return;
    for (const s of splitSentences(t)) sentences.push(s);
  };

  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/^\|.*\|\s*$/.test(line.trim())) {
      if (/^\|[\s:-]+\|[\s:-]+\|/.test(line.trim())) continue;
      const cells = line
        .trim()
        .replace(/^\||\|\s*$/g, "")
        .split("|")
        .map((c) => c.trim().replace(/[`*]/g, ""))
        .filter(Boolean);
      if (cells.some((c) => /^:?-{2,}:?$/.test(c))) continue;
      push(cells.join(", ") + ".");
      continue;
    }

    line = line.replace(/^#{1,6}\s+/, "");

    if (/^\s*>\s?/.test(line)) line = line.replace(/^\s*>\s?/, "");

    line = line.replace(/^[-*+]\s+/, "");
    line = line.replace(/^\d+[.)]\s+/, "");

    push(line);
  }

  return sentences.map((text, id) => ({ id, text }));
}