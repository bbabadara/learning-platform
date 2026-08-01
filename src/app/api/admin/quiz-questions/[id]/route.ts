import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function parseOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const options = value.map((o) => String(o).trim()).filter(Boolean);
  if (options.length < 2) return null;
  return options;
}

async function refreshHasQuiz(chapterId: string) {
  const count = await prisma.quizQuestion.count({ where: { chapterId } });
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { hasQuiz: count > 0 },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
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

  const existing = await prisma.quizQuestion.findUnique({
    where: { id },
    select: { chapterId: true, options: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
  }

  const data: {
    number?: number;
    question?: string;
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  } = {};

  if (body.question !== undefined) {
    const question = body.question.trim();
    if (question.length < 3) {
      return NextResponse.json({ error: "La question est requise." }, { status: 400 });
    }
    data.question = question;
  }
  if (body.options !== undefined) {
    const options = parseOptions(body.options);
    if (!options) {
      return NextResponse.json(
        { error: "Il faut au moins 2 options non vides." },
        { status: 400 },
      );
    }
    data.options = options;
    if (body.correctIndex !== undefined) {
      if (body.correctIndex < 0 || body.correctIndex >= options.length) {
        return NextResponse.json(
          { error: "Index de la bonne réponse invalide." },
          { status: 400 },
        );
      }
      data.correctIndex = body.correctIndex;
    }
  } else if (body.correctIndex !== undefined) {
    const options = (existing.options as string[]) ?? [];
    if (body.correctIndex < 0 || body.correctIndex >= options.length) {
      return NextResponse.json({ error: "Index de la bonne réponse invalide." }, { status: 400 });
    }
    data.correctIndex = body.correctIndex;
  }
  if (typeof body.number === "number") data.number = body.number;
  if (body.explanation !== undefined) data.explanation = body.explanation.trim();

  try {
    const questionData = await prisma.quizQuestion.update({ where: { id }, data });
    return NextResponse.json({ question: questionData });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const existing = await prisma.quizQuestion.findUnique({
    where: { id },
    select: { chapterId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
  }

  await prisma.quizQuestion.delete({ where: { id } });
  await refreshHasQuiz(existing.chapterId);

  return NextResponse.json({ ok: true });
}
