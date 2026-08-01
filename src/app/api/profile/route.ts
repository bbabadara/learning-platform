import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { progress: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const completed = await prisma.userProgress.count({
    where: { userId: user.id, status: "completed" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isDemo: user.isDemo,
      createdAt: user.createdAt,
      progressCount: user._count.progress,
      completedChapters: completed,
    },
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  let body: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  const data: { name?: string; email?: string; passwordHash?: string } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (name.length < 2) {
      return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères." }, { status: 400 });
    }
    data.name = name;
  }

  const wantsEmailChange = body.email !== undefined && body.email.trim().toLowerCase() !== user.email;
  const wantsPasswordChange = body.newPassword !== undefined && body.newPassword.length > 0;

  if (wantsEmailChange || wantsPasswordChange) {
    if (!body.currentPassword) {
      return NextResponse.json(
        { error: "Entrez votre mot de passe actuel pour modifier votre email ou votre mot de passe." },
        { status: 400 },
      );
    }
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
    }
  }

  if (wantsEmailChange) {
    const email = body.email!.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    data.email = email;
  }

  if (wantsPasswordChange) {
    if (body.newPassword!.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }
    data.passwordHash = await bcrypt.hash(body.newPassword!, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune modification demandée." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({
      user: { id: updated.id, email: updated.email, name: updated.name },
      message: "Profil mis à jour.",
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }
    throw e;
  }
}
