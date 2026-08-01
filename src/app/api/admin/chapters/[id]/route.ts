import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

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

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  }

  const data: {
    title: string;
    number?: number;
    folderName?: string;
    summary?: string;
    courseMarkdown?: string;
    objectives?: string[];
    prerequisites?: string[];
  } = { title, folderName: slugify(title) };

  if (typeof body.number === "number") data.number = body.number;
  if (body.summary !== undefined) data.summary = body.summary.trim();
  if (body.courseMarkdown !== undefined) data.courseMarkdown = body.courseMarkdown;
  if (body.objectives !== undefined) data.objectives = body.objectives;
  if (body.prerequisites !== undefined) data.prerequisites = body.prerequisites;

  try {
    const chapter = await prisma.chapter.update({ where: { id }, data });
    return NextResponse.json({ chapter });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Un chapitre avec ce numéro existe déjà." },
        { status: 409 },
      );
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await prisma.chapter.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
    }
    throw e;
  }
}
