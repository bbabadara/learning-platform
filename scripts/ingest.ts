import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { parseQuiz } from "../src/lib/quiz-parser";
import { parseFlashcards } from "../src/lib/flashcard-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPOS_ROOT = join(__dirname, "..", "..");
const prisma = new PrismaClient();

const FORMATION_META: Record<string, { slug: string; icon: string; color: string; title: string }> = {
  "Modern-Frontend-Engineering": { slug: "frontend", icon: "LayoutGrid", color: "#f59e0b", title: "Modern Frontend Engineering" },
  "Modern-Backend-Engineering": { slug: "backend", icon: "Server", color: "#10b981", title: "Modern Backend Engineering" },
  "Modern-DevOps-Engineering": { slug: "devops", icon: "Infinity", color: "#3b82f6", title: "Modern DevOps Engineering" },
  "Modern-Java-Engineering": { slug: "java", icon: "Coffee", color: "#ef4444", title: "Modern Java Engineering" },
  "Modern-PHP-Engineering": { slug: "php", icon: "Code2", color: "#8b5cf6", title: "Modern PHP Engineering" },
  "Modern-Design-Patterns": { slug: "design-patterns", icon: "Puzzle", color: "#ec4899", title: "Modern Design Patterns" },
  "Modern-IS-Engineering": { slug: "analyse-conception", icon: "GitBranch", color: "#14b8a6", title: "Modern IS Engineering" },
  "Modern-Go-Engineering": { slug: "go", icon: "Rocket", color: "#06b6d4", title: "Modern Go Engineering" },
  "Modern-Python-Engineering": { slug: "python", icon: "CodeXml", color: "#22c55e", title: "Modern Python Engineering" },
  "Modern-Network-Engineering": { slug: "network", icon: "Network", color: "#f97316", title: "Modern Network Engineering" },
  "Modern-Algorithms-Engineering": { slug: "algorithms", icon: "Binary", color: "#a855f7", title: "Modern Algorithms Engineering" },
  "Modern-Mobile-Engineering": { slug: "mobile", icon: "Smartphone", color: "#6366f1", title: "Modern Mobile Engineering" },
  "Modern-SonarQube-Engineering": { slug: "sonarqube", icon: "Bug", color: "#dc2626", title: "Modern SonarQube Engineering" },
};

function read(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function parseRepoReadme(md: string | null) {
  if (!md) return { title: "", tagline: "", description: "" };
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
  const tagline = md.match(/^>\s*(.+)$/m)?.[1]?.trim() ?? "";
  const pourquoi = md.match(/##\s*Pourquoi ce cours\s*\??\n([\s\S]*?)(?=\n##\s|\n---|\n$)/);
  let description = "";
  if (pourquoi) {
    description = pourquoi[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("-") && !l.startsWith("*") && !l.startsWith("!") && !l.startsWith("["))
      .join(" ")
      .trim();
  }
  if (!description) {
    const firstPara = md.split("\n\n").find(
      (p) => p.trim() && !p.trim().startsWith("#") && !p.trim().startsWith(">") && !p.trim().startsWith("["),
    );
    description = firstPara?.trim() ?? "";
  }
  return { title, tagline, description };
}

function parseChapterReadme(md: string, folder: string) {
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? folder;
  const beforeFirstSection = md.split(/^##\s/m)[0] ?? "";
  const summaryLines = beforeFirstSection
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const summary = summaryLines.join(" ").trim() || title;

  const section = (name: string): string[] => {
    const re = new RegExp(`##\\s*${name}\\s*\n([\\s\\S]*?)(?=\\n##\\s|\\n---|$)`);
    const m = md.match(re);
    if (!m) return [];
    return m[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-") || l.startsWith("*"))
      .map((l) => l.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);
  };

  return { title, summary, objectives: section("Objectifs"), prerequisites: section("Prérequis") };
}

async function main() {
  console.log("Ingestion du contenu des formations...");
  const formations = readdirSync(REPOS_ROOT)
    .filter((name) => name.startsWith("Modern-") && (name.endsWith("-Engineering") || name.endsWith("-Patterns")))
    .sort();

  let totalChapters = 0;
  let totalQuiz = 0;
  let totalCards = 0;

  for (const folderName of formations) {
    const repoPath = join(REPOS_ROOT, folderName);
    const meta = FORMATION_META[folderName] ?? {
      slug: folderName.toLowerCase().replace(/^modern-/, "").replace(/-engineering$/, ""),
      icon: "BookOpen",
      color: "#64748b",
      title: folderName.replace(/-/g, " "),
    };

    const repoMd = read(join(repoPath, "README.md"));
    const repo = parseRepoReadme(repoMd);
    const slug = meta.slug;

    const chapterDirs = readdirSync(repoPath)
      .filter((d) => /^\d{2}-/.test(d) && existsSync(join(repoPath, d)))
      .sort();

    const existing = await prisma.formation.findUnique({ where: { slug } });
    const formation = existing
      ? await prisma.formation.update({
          where: { slug },
          data: {
            title: repo.title || meta.title,
            tagline: repo.tagline,
            description: repo.description,
            icon: meta.icon,
            color: meta.color,
          },
        })
      : await prisma.formation.create({
          data: {
            slug,
            title: repo.title || meta.title,
            tagline: repo.tagline,
            description: repo.description,
            icon: meta.icon,
            color: meta.color,
            order: formations.indexOf(folderName),
          },
        });

    const existingChapters = await prisma.chapter.findMany({ where: { formationId: formation.id } });
    const existingMap = new Map(existingChapters.map((c) => [c.number, c]));
    let formationChapters = 0;

    for (const dir of chapterDirs) {
      const folderPath = join(repoPath, dir);
      const chReadme = read(join(folderPath, "README.md")) ?? "";
      const parsed = parseChapterReadme(chReadme, dir);
      const number = parseInt(dir.slice(0, 2), 10);
      const courseMarkdown = read(join(folderPath, "course.md")) ?? "";

      const quizMd = read(join(folderPath, "quiz", "README.md"));
      const cardMd = read(join(folderPath, "flashcards", "README.md"));

      const quizQuestions = quizMd ? parseQuiz(quizMd) : [];
      const flashcards = cardMd ? parseFlashcards(cardMd) : [];

      const data = {
        number,
        title: parsed.title,
        folderName: dir,
        summary: parsed.summary,
        objectives: parsed.objectives,
        prerequisites: parsed.prerequisites,
        courseMarkdown,
        hasQuiz: quizQuestions.length > 0,
        hasFlashcards: flashcards.length > 0,
      };

      let chapter;
      if (existingMap.has(number)) {
        chapter = await prisma.chapter.update({ where: { id: existingMap.get(number)!.id }, data });
      } else {
        chapter = await prisma.chapter.create({ data: { ...data, formationId: formation.id } });
      }

      if (quizQuestions.length > 0) {
        await prisma.quizQuestion.deleteMany({ where: { chapterId: chapter.id } });
        await prisma.quizQuestion.createMany({
          data: quizQuestions.map((q) => ({
            chapterId: chapter.id,
            number: q.number,
            question: q.question,
            options: q.options as string[],
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })),
        });
      }

      if (flashcards.length > 0) {
        await prisma.flashcard.deleteMany({ where: { chapterId: chapter.id } });
        await prisma.flashcard.createMany({
          data: flashcards.map((c) => ({
            chapterId: chapter.id,
            number: c.number,
            question: c.question,
            answer: c.answer,
          })),
        });
      }

      totalChapters++;
      totalQuiz += quizQuestions.length;
      totalCards += flashcards.length;
      formationChapters++;
    }

    if (chapterDirs.length === 0 && folderName === "Modern-SonarQube-Engineering") {
      const quizDir = join(repoPath, "docs", "quiz");
      if (existsSync(quizDir)) {
        const quizFiles = readdirSync(quizDir)
          .filter((f) => /^Q\d{2}-.*\.md$/.test(f))
          .sort();
        const parsed = new Map<number, { f: string; quizMd: string; quizQuestions: Awaited<ReturnType<typeof parseQuiz>> }>();
        for (const f of quizFiles) {
          const quizMd = read(join(quizDir, f)) ?? "";
          if (!quizMd.trim()) continue;
          const quizQuestions = parseQuiz(quizMd);
          if (quizQuestions.length === 0) continue;
          parsed.set(parseInt(f.slice(1, 3), 10), { f, quizMd, quizQuestions });
        }
        for (const [num, ch] of existingMap) {
          if (!parsed.has(num)) {
            await prisma.chapter.delete({ where: { id: ch.id } });
          }
        }
        for (const [number, { f, quizMd, quizQuestions }] of parsed) {
          const title = quizMd.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? f;
          const summary = quizMd
            .split(/^##\s/m)[0]
            .split("\n")
            .slice(1)
            .map((l) => l.trim())
            .filter(Boolean)
            .join(" ")
            .trim() || title;
          const data = {
            number,
            title,
            folderName: f,
            summary,
            objectives: [] as string[],
            prerequisites: [] as string[],
            courseMarkdown: "",
            hasQuiz: true,
            hasFlashcards: false,
          };
          let chapter;
          if (existingMap.has(number)) {
            chapter = await prisma.chapter.update({ where: { id: existingMap.get(number)!.id }, data });
          } else {
            chapter = await prisma.chapter.create({ data: { ...data, formationId: formation.id } });
          }
          await prisma.quizQuestion.deleteMany({ where: { chapterId: chapter.id } });
          await prisma.quizQuestion.createMany({
            data: quizQuestions.map((q) => ({
              chapterId: chapter.id,
              number: q.number,
              question: q.question,
              options: q.options as string[],
              correctIndex: q.correctIndex,
              explanation: q.explanation,
            })),
          });
          totalChapters++;
          totalQuiz += quizQuestions.length;
          formationChapters++;
        }
      }
    }

    console.log(`✓ ${folderName} (${slug}) — ${formationChapters} chapitres`);
  }

  const demo = await prisma.user.findUnique({ where: { email: "demo@formation.dev" } });
  if (!demo) {
    await prisma.user.create({
      data: {
        email: "demo@formation.dev",
        name: "Étudiant Démo",
        isDemo: true,
        passwordHash: await bcrypt.hash("demo1234", 10),
      },
    });
    console.log("✓ Compte démo créé (demo@formation.dev / demo1234)");
  }

  console.log(
    `\nTerminé : ${formations.length} formations, ${totalChapters} chapitres, ${totalQuiz} questions quiz, ${totalCards} flashcards.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
