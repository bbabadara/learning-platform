import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isDemo: true,
      createdAt: true,
      _count: { select: { progress: true } },
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      isDemo: u.isDemo,
      createdAt: u.createdAt,
      progressCount: u._count.progress,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { name?: string; email?: string; password?: string; role?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Le nom doit contenir au moins 2 caractères." },
      { status: 400 },
    );
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 },
    );
  }

  const role = body.role === "admin" ? "admin" : "user";
  const status = body.status === "pending" ? "pending" : "active";

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, status },
    });
    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }
    throw e;
  }
}
