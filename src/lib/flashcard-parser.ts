export interface ParsedFlashcard {
  number: number;
  question: string;
  answer: string;
}

const CARD_RE =
  /^#{0,3}\s*\*?\*?(?:Flashcard|Carte|Card|F)\s*(?<n1>\d+)(?:\s*\*?\*?\s*(?<t1>.*))?$|^#{2,3}\s*(?<n2>\d+)\s*(?:[.:)\-—–]\s*(?<t2>[^\s].*?))?$/gm;

const FACE_SLOT_RE =
  /\*\*(?:Question|Q|Face|Recto|Front|R)\s*:?\s*\*\*\s*:?\s*(.*?)(?=\s*\*\*(?:R[ée]ponse|R|V|Dos|Verso|Back|A)|\n|$)/m;

const BACK_SLOT_RE =
  /\*\*(?:R[ée]ponse|R|V|Dos|Verso|Back|A)\s*:?\s*\*\*\s*:?\s*(.*)$/m;

const PLAIN_SLOT_RE = /^(?:Q|Question|R[ée]ponse|R)\s*:\s*(.*)$/gm;

const DETAILS_RE =
  /<details>\s*<summary>\s*(?:R[ée]ponse|Verso|Answer|Recto|Dos|V|R)\s*<\/summary>\s*([\s\S]*?)<\/details>/i;

function clean(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/^#{1,3}\s+/, "")
    .replace(/^\s+|\s+$/g, "");
}

function stripLeading(text: string): string {
  return text.replace(/^[\s—–:.\-]+/, "").trim();
}

export function parseFlashcards(markdown: string): ParsedFlashcard[] {
  const cards: ParsedFlashcard[] = [];
  const seen = new Set<number>();

  const matches = [...markdown.matchAll(CARD_RE)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const nStr = m.groups?.n1 ?? m.groups?.n2;
    if (!nStr) continue;
    const number = parseInt(nStr, 10);
    if (seen.has(number)) continue;
    seen.add(number);

    const next = matches[i + 1];
    const blockStart = (m.index ?? 0) + m[0].length;
    const block = markdown.slice(blockStart, next ? next.index : markdown.length);

    let question = "";
    let answer = "";

    const titleLine = stripLeading(m.groups?.t1 ?? m.groups?.t2 ?? "");
    const face = block.match(FACE_SLOT_RE);
    const back = block.match(BACK_SLOT_RE);
    if (face && back && (face.index ?? 0) < (back.index ?? 0)) {
      question = clean(face[1]);
      answer = clean(back[1]);
    } else if (titleLine) {
      const faceT = titleLine.match(FACE_SLOT_RE);
      const backT = titleLine.match(BACK_SLOT_RE);
      if (faceT && backT && (faceT.index ?? 0) < (backT.index ?? 0)) {
        question = clean(faceT[1]);
        answer = clean(backT[1]);
      }
    }
    if (question && answer) {
      cards.push({ number, question, answer });
      continue;
    } else {
      const plainSlots = [...block.matchAll(PLAIN_SLOT_RE)];
      if (plainSlots.length >= 2) {
        question = clean(plainSlots[0][1]);
        answer = clean(plainSlots[1][1]);
      } else {
        const details = block.match(DETAILS_RE);
        if (details) {
          const before = block.split("<details>")[0];
          const qLine = before
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l && !l.startsWith("<"));
          question = qLine
            ? clean(qLine)
            : clean(stripLeading(m.groups?.t1 ?? m.groups?.t2 ?? ""));
          answer = clean(details[1]);
        } else {
          const title = stripLeading(m.groups?.t2 ?? m.groups?.t1 ?? "");
          if (title) {
            const qLine = block
              .split("\n")
              .map((l) => l.trim())
              .find((l) => l && !l.startsWith("<") && !l.startsWith("|"));
            question = clean(title);
            answer = qLine ? clean(qLine) : "";
          }
        }
      }
    }

    if (!question || !answer) continue;

    cards.push({ number, question, answer });
  }

  if (cards.length === 0) {
    const rows = [
      ...markdown.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|$/gm),
    ];
    for (const r of rows) {
      const number = parseInt(r[1], 10);
      const question = clean(r[2]);
      const answer = clean(r[3]);
      if (question && answer) cards.push({ number, question, answer });
    }
    cards.sort((a, b) => a.number - b.number);
  }

  return cards.sort((a, b) => a.number - b.number);
}
