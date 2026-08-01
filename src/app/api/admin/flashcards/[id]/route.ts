import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

async function refreshHasFlashcards(chapterId: string) {
  const count = await prisma.flashcard.count({ where: { chapterId } });
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { hasFlashcards: count > 0 },
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

  let body: { number?: number; question?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const existing = await prisma.flashcard.findUnique({
    where: { id },
    select: { chapterId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Flashcard introuvable." }, { status: 404 });
  }

  const data: { number?: number; question?: string; answer?: string } = {};
  if (body.question !== undefined) {
    const question = body.question.trim();
    if (question.length < 2) {
      return NextResponse.json({ error: "La question est requise." }, { status: 400 });
    }
    data.question = question;
  }
  if (body.answer !== undefined) {
    const answer = body.answer.trim();
    if (!answer) {
      return NextResponse.json({ error: "La réponse est requise." }, { status: 400 });
    }
    data.answer = answer;
  }
  if (typeof body.number === "number") data.number = body.number;

  try {
    const flashcard = await prisma.flashcard.update({ where: { id }, data });
    return NextResponse.json({ flashcard });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Flashcard introuvable." }, { status: 404 });
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

  const existing = await prisma.flashcard.findUnique({
    where: { id },
    select: { chapterId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Flashcard introuvable." }, { status: 404 });
  }

  await prisma.flashcard.delete({ where: { id } });
  await refreshHasFlashcards(existing.chapterId);

  return NextResponse.json({ ok: true });
}
