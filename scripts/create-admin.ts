import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = (process.argv[2] ?? "admin@formation.dev").toLowerCase().trim();
const givenPassword = process.argv[3];

function generatePassword(): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.randomBytes(14))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function main() {
  const password = givenPassword ?? generatePassword();
  if (password.length < 8) {
    console.error("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  for (let attempt = 1; attempt <= 10; attempt++) {
    const prisma = new PrismaClient();
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.user.update({
          where: { email },
          data: { role: "admin", status: "active", passwordHash },
        });
        console.log(`Compte admin mis à jour : ${email}`);
      } else {
        await prisma.user.create({
          data: { email, name: "Administrateur", passwordHash, role: "admin", status: "active" },
        });
        console.log(`Compte admin créé : ${email}`);
      }
      if (!givenPassword) {
        console.log("Mot de passe généré (à changer après connexion) :");
        console.log(password);
      }
      await prisma.$disconnect();
      return;
    } catch (e) {
      await prisma.$disconnect().catch(() => {});
      const msg = (e as Error).message;
      if (/can't reach|P1001|connect/i.test(msg) && attempt < 10) {
        console.log(`Tentative ${attempt} : connexion DB instable, nouvel essai...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      console.error(msg);
      process.exit(1);
    }
  }
}

main();
