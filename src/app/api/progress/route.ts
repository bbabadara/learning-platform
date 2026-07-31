import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: {
    chapterId?: string;
    status?: string;
    quizScore?: number | null;
    lastReadAt?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.chapterId) {
    return NextResponse.json({ error: "chapterId requis" }, { status: 400 });
  }

  const data: {
    status?: string;
    quizScore?: number;
    quizCompletedAt?: Date;
    lastReadAt?: Date;
  } = {};

  if (body.status) data.status = body.status;
  if (typeof body.quizScore === "number") {
    data.quizScore = body.quizScore;
    data.quizCompletedAt = new Date();
    data.status = "completed";
  }
  if (body.lastReadAt) data.lastReadAt = new Date();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
  }

  const existing = await prisma.userProgress.findUnique({
    where: { userId_chapterId: { userId: session.user.id, chapterId: body.chapterId } },
  });

  const progress = existing
    ? await prisma.userProgress.update({
        where: { userId_chapterId: { userId: session.user.id, chapterId: body.chapterId } },
        data,
      })
    : await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          chapterId: body.chapterId,
          ...data,
        },
      });

  return NextResponse.json({ progress });
}
