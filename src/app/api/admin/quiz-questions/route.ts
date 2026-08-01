import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function parseOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const options = value.map((o) => String(o).trim()).filter(Boolean);
  if (options.length < 2) return null;
  return options;
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    chapterId?: string;
    number?: number;
    question?: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const chapterId = body.chapterId;
  const question = body.question?.trim();
  const options = parseOptions(body.options);

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId requis." }, { status: 400 });
  }
  if (!question || question.length < 3) {
    return NextResponse.json({ error: "La question est requise." }, { status: 400 });
  }
  if (!options) {
    return NextResponse.json(
      { error: "Il faut au moins 2 options non vides." },
      { status: 400 },
    );
  }
  if (
    typeof body.correctIndex !== "number" ||
    body.correctIndex < 0 ||
    body.correctIndex >= options.length
  ) {
    return NextResponse.json({ error: "Index de la bonne réponse invalide." }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true },
  });
  if (!chapter) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const max = await prisma.quizQuestion.aggregate({
    where: { chapterId },
    _max: { number: true },
  });
  const number = typeof body.number === "number" ? body.number : (max._max.number ?? 0) + 1;

  const questionData = await prisma.quizQuestion.create({
    data: {
      chapterId,
      number,
      question,
      options,
      correctIndex: body.correctIndex,
      explanation: body.explanation?.trim() ?? "",
    },
  });

  await prisma.chapter.update({ where: { id: chapterId }, data: { hasQuiz: true } });

  return NextResponse.json({ question: questionData }, { status: 201 });
}
