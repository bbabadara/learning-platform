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

  const slug = body.slug?.trim().toLowerCase() || slugify(title);
  if (!slug) {
    return NextResponse.json({ error: "Slug invalide." }, { status: 400 });
  }

  try {
    const formation = await prisma.formation.create({
      data: {
        slug,
        title,
        tagline: body.tagline?.trim() ?? "",
        description: body.description?.trim() ?? "",
        icon: body.icon || "BookOpen",
        color: body.color || "#6366f1",
        order: typeof body.order === "number" ? body.order : 0,
      },
    });
    return NextResponse.json({ formation }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ce slug existe déjà." }, { status: 409 });
    }
    throw e;
  }
}
