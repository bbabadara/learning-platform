import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas modifier votre propre compte ici." },
      { status: 400 },
    );
  }

  let body: { role?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const data: { role?: string; status?: string } = {};
  if (body.role !== undefined) {
    if (body.role !== "admin" && body.role !== "user") {
      return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
    }
    data.role = body.role;
  }
  if (body.status !== undefined) {
    if (!["active", "pending", "disabled"].includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    data.status = body.status;
  }

  try {
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
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

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.isDemo) {
      return NextResponse.json(
        { error: "Le compte démo ne peut pas être supprimé." },
        { status: 400 },
      );
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    throw e;
  }
}
