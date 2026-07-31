# Learning Platform

Plateforme d'apprentissage en ligne regroupant les 12 formations « Modern-*-Engineering »
(cours en Markdown, quiz QCM et flashcards), avec comptes utilisateurs et suivi de progression.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Prisma 6 + SQLite
- NextAuth 4 (identifiants email / mot de passe, session JWT)
- react-markdown + remark-gfm + remark-math + rehype-katex + mermaid
- lucide-react (icônes)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Compte démo : `demo@formation.dev` / `demo1234`

## Ingestion du contenu

Le contenu est lu dans les dépôts `../Modern-*-Engineering` (un dossier par formation,
avec des chapitres `NN-…`, chacun contenant `course.md`, `quiz/` et `flashcards/`).

```bash
npm run ingest
```

Le script est idempotent : il fait des upserts sur les formations/chapitres et
réécrit les quiz/flashcards à chaque exécution.

## Commandes utiles

```bash
npm run lint      # ESLint
npm run build     # build de production
npm run typecheck # tsc --noEmit
```

## Routes

- `/` — liste des formations
- `/formation/[slug]` — chapitres d'une formation + progression
- `/formation/[slug]/[chapterNumber]` — chapitre (tabs cours / quiz / flashcards)
- `/login` — connexion
- `/register` — création de compte
- `POST /api/register` — inscription (email, nom, mot de passe ≥ 8 caractères)
- `POST /api/progress` — enregistrement de la progression (authentifié)

## Base de données

Le fichier SQLite est `prisma/dev.db`. Le schéma est dans `prisma/schema.prisma`.

## Déploiement (Vercel gratuit + Neon Postgres)

L'app utilise une base de données : **SQLite ne fonctionne pas sur Vercel**
(fichiers en lecture seule). En production, on utilise un Postgres hébergé gratuit chez
[Neon](https://neon.tech).

### 1. Créer la base Neon

1. Aller sur https://neon.tech, créer un compte, créer un projet (région : près de toi).
2. Copier la **connection string** (onglet Connect → `postgresql://...`).
3. Mettre cette string dans `.env` → `DATABASE_URL`.

### 2. Initialiser et peupler la base

```bash
npm run db:push   # crée les tables dans Postgres
npm run ingest    # charge les 12 formations (depuis ../Modern-*-Engineering)
```

### 3. Créer le dépôt GitHub et pousser

```bash
git remote add origin https://github.com/bbabadara/learning-platform.git
git push -u origin main
git push -u origin deploy
```

### 4. Créer le projet Vercel

1. Aller sur https://vercel.com → **Add New → Project** → importer le dépôt GitHub.
2. Framework : Next.js (détecté automatiquement). Build : `npm run build`.
3. Ajouter les variables d'environnement dans **Settings → Environment Variables** :
   - `DATABASE_URL` → la connection string Neon
   - `NEXTAUTH_SECRET` → une clé aléatoire (ex. `openssl rand -base64 32`)
   - `NEXTAUTH_URL` → `https://<ton-projet>.vercel.app` (l'URL donnée par Vercel)
4. Déployer. La branche `main` (production) contient l'app ; la branche `deploy`
   porte les changements de déploiement avant leur fusion.
