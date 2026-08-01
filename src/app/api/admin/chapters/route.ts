import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    formationId?: string;
    number?: number;
    title?: string;
    summary?: string;
    courseMarkdown?: string;
    objectives?: string[];
    prerequisites?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const formationId = body.formationId;
  const title = body.title?.trim();
  if (!formationId) {
    return NextResponse.json({ error: "formationId requis." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  }

  const formation = await prisma.formation.findUnique({
    where: { id: formationId },
    select: { id: true },
  });
  if (!formation) {
    return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
  }

  const maxChapter = await prisma.chapter.aggregate({
    where: { formationId },
    _max: { number: true },
  });
  const number =
    typeof body.number === "number" ? body.number : (maxChapter._max.number ?? 0) + 1;

  try {
    const chapter = await prisma.chapter.create({
      data: {
        formationId,
        number,
        title,
        folderName: slugify(title),
        summary: body.summary?.trim() ?? "",
        objectives: body.objectives ?? [],
        prerequisites: body.prerequisites ?? [],
        courseMarkdown: body.courseMarkdown ?? "",
      },
    });
    return NextResponse.json({ chapter }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Un chapitre avec ce numéro existe déjà." },
        { status: 409 },
      );
    }
    throw e;
  }
}
