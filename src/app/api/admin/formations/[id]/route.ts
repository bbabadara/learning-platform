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
    title?: string;
    slug?: string;
    tagline?: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
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
    slug?: string;
    tagline?: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
  } = { title };

  if (body.slug?.trim()) data.slug = body.slug.trim().toLowerCase();
  else data.slug = slugify(title);
  if (body.tagline !== undefined) data.tagline = body.tagline.trim();
  if (body.description !== undefined) data.description = body.description.trim();
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.color !== undefined) data.color = body.color;
  if (body.order !== undefined) data.order = body.order;

  try {
    const formation = await prisma.formation.update({ where: { id }, data });
    return NextResponse.json({ formation });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ce slug existe déjà." }, { status: 409 });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
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
    await prisma.formation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
    }
    throw e;
  }
}
