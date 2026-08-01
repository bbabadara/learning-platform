import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    chapterId?: string;
    number?: number;
    question?: string;
    answer?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const chapterId = body.chapterId;
  const question = body.question?.trim();
  const answer = body.answer?.trim();

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId requis." }, { status: 400 });
  }
  if (!question || question.length < 2) {
    return NextResponse.json({ error: "La question est requise." }, { status: 400 });
  }
  if (!answer) {
    return NextResponse.json({ error: "La réponse est requise." }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true },
  });
  if (!chapter) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const max = await prisma.flashcard.aggregate({
    where: { chapterId },
    _max: { number: true },
  });
  const number = typeof body.number === "number" ? body.number : (max._max.number ?? 0) + 1;

  const flashcard = await prisma.flashcard.create({
    data: { chapterId, number, question, answer },
  });

  await prisma.chapter.update({ where: { id: chapterId }, data: { hasFlashcards: true } });

  return NextResponse.json({ flashcard }, { status: 201 });
}
