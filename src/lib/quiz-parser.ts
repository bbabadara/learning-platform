export interface ParsedQuizQuestion {
  number: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_RE =
  /^#{0,3}\s*\*?\*?(?:Q|Question)\s*(?<q1>\d+)\s*[:.\-—–]?\s*(?<t1>.*)$|^#{1,3}\s*(?<q2>\d+)\s*[.:)]\s*(?<t2>.*)$|^\*\*(?<q3>\d+)\s*[.:)]\s*(?<t3>.*)\*\*\s*$/gm;

const OPTION_RE = /^[-*]\s*\[([ xX])\]\s*(.*)$/gm;
const PLAIN_OPTION_RE = /^[-*]?\s*([A-Da-d])[.)]\s*(.*)$/gm;
const LETTER_PREFIX_RE = /^([A-Da-d])[.)]?\s+(.*)$/;

const ANSWER_LETTER_RE = /(?:R[ée]ponse|R[ée]p\.?|R)\s*:\s*([A-Da-d])\b/i;
const ANSWER_TEXT_RE = /(?:R[ée]ponse|R[ée]p\.?|R)\s*:\s*(.+?)(?:\*\*|\n|$)/i;

function clean(text: string): string {
  return text.replace(/\*\*/g, "").replace(/^\s+|\s+$/g, "");
}

function normalize(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/[✅✓>]/g, "")
    .replace(/>>\s*[A-Da-d]\s*<</g, "")
    .replace(/^\s+|\s+$/g, "")
    .replace(/[.!?;:]$/, "")
    .toLowerCase();
}

function stripLetterPrefix(text: string): { letter: string | null; text: string } {
  const m = text.match(LETTER_PREFIX_RE);
  if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  return { letter: null, text };
}

function sectionBetween(md: string, heading: RegExp): string {
  const m = md.match(heading);
  if (!m || m.index === undefined) return "";
  const rest = md.slice(m.index + m[0].length);
  const end = rest.match(/\n#{2,3}\s+/);
  return end ? rest.slice(0, end.index) : rest;
}

function buildAnswerMap(md: string): Map<number, string> {
  const map = new Map<number, string>();
  const section = sectionBetween(
    md,
    /^#{1,3}\s*(?:Corrigé|Corrige|Réponses|Reponses|Correction)\s*$/m,
  );
  if (!section) return map;
  const re = /(\d+)\s*[|.:)\]]\s*\*{0,2}\s*([A-Da-d])\b/g;
  for (const m of section.matchAll(re)) {
    const n = parseInt(m[1], 10);
    if (!map.has(n)) map.set(n, m[2].toUpperCase());
  }
  return map;
}

function buildExplanationMap(md: string): Map<number, string> {
  const map = new Map<number, string>();
  const section = sectionBetween(md, /^#{2,3}\s*Explications?\s*$/m);
  if (!section) return map;
  const re = /-\s*\*\*Q(\d+)\*\*\s*:?\s*([\s\S]*?)(?=\n\s*-\s*\*\*Q\d|\n\s*$|$)/g;
  for (const m of section.matchAll(re)) {
    if (m[2] && m[2].trim()) map.set(parseInt(m[1], 10), m[2].trim());
  }
  return map;
}

function extractExplanation(block: string): string {
  const m = block.match(
    /\*\*Explication\s*:?\s*\*\*\s*([\s\S]*?)(?=\n\s*\n|\n##|\n###|$)/,
  );
  if (m && m[1].trim()) return m[1].trim();
  return "";
}

export function parseQuiz(markdown: string): ParsedQuizQuestion[] {
  const questions: ParsedQuizQuestion[] = [];
  const seen = new Set<number>();
  const answerMap = buildAnswerMap(markdown);
  const docExplanations = buildExplanationMap(markdown);

  const matches = [...markdown.matchAll(QUESTION_RE)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const nStr = m.groups?.q1 ?? m.groups?.q2 ?? m.groups?.q3;
    if (!nStr) continue;
    const number = parseInt(nStr, 10);
    if (seen.has(number)) continue;
    seen.add(number);

    const next = matches[i + 1];
    const blockStart = (m.index ?? 0) + m[0].length;
    const block = markdown.slice(blockStart, next ? next.index : markdown.length);

    const title = clean(m.groups?.t1 ?? m.groups?.t2 ?? m.groups?.t3 ?? "");
    const paraLine = block
      .split("\n")
      .map((l) => l.trim())
      .find(
        (l) =>
          l &&
          !l.startsWith("-") &&
          !l.startsWith("*") &&
          !l.startsWith("|") &&
          !l.startsWith("<") &&
          !l.startsWith(">"),
      );

    let question = title;
    if (paraLine && title && !title.endsWith("?")) {
      question = paraLine;
    }
    if (!question) {
      const bold = block.match(/^\*\*(.+?)\*\*\s*$/m);
      question = clean(bold ? bold[1] : paraLine ?? "");
    }
    if (!question) continue;

    const options: string[] = [];
    const letters: string[] = [];
    let correctIndex = -1;

    const checkboxMatches = [...block.matchAll(OPTION_RE)];
    if (checkboxMatches.length > 0) {
      checkboxMatches.forEach((opt, idx) => {
        const checked = opt[1].toLowerCase() === "x";
        const { letter, text } = stripLetterPrefix(opt[2]);
        options.push(clean(text));
        if (letter) letters.push(letter);
        if (correctIndex === -1 && (checked || /[✅✓]/.test(opt[2]))) correctIndex = idx;
      });
    } else {
      const plainMatches = [...block.matchAll(PLAIN_OPTION_RE)];
      plainMatches.forEach((opt, idx) => {
        const marked = /[✅✓]/.test(opt[2]);
        options.push(clean(opt[2]));
        letters.push(opt[1].toUpperCase());
        if (correctIndex === -1 && marked) correctIndex = idx;
      });
    }

    if (options.length < 2) continue;

    if (correctIndex === -1) {
      const marker = block.match(/>>\s*([A-Da-d])\s*<</);
      if (marker) {
        const idx = letters.indexOf(marker[1].toUpperCase());
        if (idx !== -1) correctIndex = idx;
      }
    }

    if (correctIndex === -1) {
      const rep = block.match(ANSWER_LETTER_RE);
      if (rep) {
        const idx = letters.indexOf(rep[1].toUpperCase());
        if (idx !== -1) correctIndex = idx;
      }
    }

    if (correctIndex === -1) {
      const rep = block.match(ANSWER_TEXT_RE);
      if (rep) {
        const target = normalize(rep[1]);
        if (target) {
          const idx = options.findIndex((o) => normalize(o) === target);
          if (idx !== -1) correctIndex = idx;
        }
      }
    }

    if (correctIndex === -1 && answerMap.has(number)) {
      const idx = letters.indexOf(answerMap.get(number)!);
      if (idx !== -1) correctIndex = idx;
    }

    if (correctIndex === -1) continue;

    let explanation = extractExplanation(block);
    if (!explanation && docExplanations.has(number)) {
      explanation = docExplanations.get(number)!;
    }

    questions.push({ number, question, options, correctIndex, explanation });
  }

  return questions.sort((a, b) => a.number - b.number);
}
