# Learning Platform

Plateforme d'apprentissage en ligne regroupant les **13 formations** « Modern-*-Engineering »
(cours en Markdown, quiz QCM et flashcards), avec comptes utilisateurs, validation des
inscriptions par un administrateur, page de profil et suivi de progression.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Prisma 6 + PostgreSQL (Neon)
- NextAuth 4 (identifiants email / mot de passe, session JWT)
- react-markdown + remark-gfm + remark-math + rehype-katex + mermaid
- lucide-react (icônes)
- Mode sombre / clair (persisté, sans flash au chargement)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Compte démo : `demo@formation.dev` / `demo1234`

## Créer un compte administrateur

```bash
npm run admin:create                # crée admin@formation.dev avec un mot de passe généré
npm run admin:create prenom@ex.com monMotDePasse   # avec email et mot de passe précisés
```

Le script est idempotent (upsert) et force le statut `active` + le rôle `admin`.

## Inscription et validation des comptes

1. Un visiteur s'inscrit sur `/register` : le compte est créé avec le statut **en attente**.
2. Il ne peut pas se connecter tant qu'un administrateur ne l'a pas validé.
3. L'administrateur valide (ou supprime) le compte sur `/admin/users`.

## Ingestion du contenu

Le contenu est lu dans les dépôts `../Modern-*-Engineering` (un dossier par formation,
avec des chapitres `NN-…`, chacun contenant `course.md`, `quiz/` et `flashcards/`).

```bash
npm run ingest
```

Le script est idempotent : il fait des upserts sur les formations/chapitres et
réécrit les quiz/flashcards à chaque exécution.

### Dépôts des 13 formations

Chaque dossier est un dépôt git à cloner dans `../` :

- [Modern-Algorithms-Engineering](https://github.com/bbabadara/Modern-Algorithms-Engineering)
- [Modern-Backend-Engineering](https://github.com/bbabadara/Modern-Backend-Engineering)
- [Modern-Design-Patterns](https://github.com/bbabadara/Modern-Design-Patterns)
- [Modern-DevOps-Engineering](https://github.com/bbabadara/Modern-DevOps-Engineering)
- [Modern-Frontend-Engineering](https://github.com/bbabadara/Modern-Frontend-Engineering)
- [Modern-Go-Engineering](https://github.com/bbabadara/Modern-Go-Engineering)
- [Modern-IS-Engineering](https://github.com/bbabadara/Modern-IS-Engineering)
- [Modern-Java-Engineering](https://github.com/bbabadara/Modern-Java-Engineering)
- [Modern-Mobile-Engineering](https://github.com/bbabadara/Modern-Mobile-Engineering)
- [Modern-Network-Engineering](https://github.com/bbabadara/Modern-Network-Engineering)
- [Modern-PHP-Engineering](https://github.com/bbabadara/Modern-PHP-Engineering)
- [Modern-Python-Engineering](https://github.com/bbabadara/Modern-Python-Engineering)
- [Modern-SonarQube-Engineering](https://github.com/bbabadara/formation-sonarqube)

## Commandes utiles

```bash
npm run lint        # ESLint
npm run build       # build de production
npm run typecheck   # tsc --noEmit
npm run db:push     # synchronise le schéma Prisma avec la base
npm run admin:create  # crée / met à jour un compte administrateur
```

## Routes

### Public

- `/` — liste des formations
- `/formation/[slug]` — chapitres d'une formation + progression
- `/formation/[slug]/[chapterNumber]` — chapitre (tabs cours / quiz / flashcards)
- `/login` — connexion
- `/register` — création de compte (validation requise ensuite)
- `/profile` — page « Mon profil » (nom, email, mot de passe) — authentifié

### Administration (rôle admin)

- `/admin` — tableau de bord avec statistiques (formations, chapitres, QCM, flashcards, comptes, progressions)
- `/admin/formations` — liste / création des formations
- `/admin/formations/[id]` — chapitres d'une formation (gestion QCM / flashcards / chapitre)
- `/admin/formations/[id]/edit` — modification d'une formation
- `/admin/formations/new` — nouvelle formation
- `/admin/formations/[id]/chapters/new` — nouveau chapitre
- `/admin/chapters/[id]/edit` — modification d'un chapitre
- `/admin/chapters/[id]/quiz` — gestion des questions QCM d'un chapitre
- `/admin/chapters/[id]/flashcards` — gestion des flashcards d'un chapitre
- `/admin/users` — comptes : liste, création, validation des inscriptions, rôles, suppression

### API

- `POST /api/register` — inscription (email, nom, mot de passe ≥ 8 caractères) → compte en attente
- `POST /api/progress` — enregistrement de la progression (authentifié)
- `GET|PUT /api/profile` — lecture / mise à jour du profil (authentifié)
- `GET|POST /api/admin/users`, `PATCH|DELETE /api/admin/users/[id]` — gestion des comptes (admin)
- `GET|POST /api/admin/formations`, `PUT|DELETE /api/admin/formations/[id]` (admin)
- `GET|POST /api/admin/chapters`, `PUT|DELETE /api/admin/chapters/[id]` (admin)
- `POST /api/admin/quiz-questions`, `PUT|DELETE /api/admin/quiz-questions/[id]` (admin)
- `POST /api/admin/flashcards`, `PUT|DELETE /api/admin/flashcards/[id]` (admin)

## Base de données

Le schéma est dans `prisma/schema.prisma`. Le workflow utilisé est **`prisma db push`**
(pas de dossiers de migrations commités).

## Déploiement (Vercel + Neon Postgres)

SQLite ne fonctionne pas sur Vercel (fichiers en lecture seule). En production, on utilise
un Postgres hébergé chez [Neon](https://neon.tech).

### 1. Créer la base Neon

1. Aller sur https://neon.tech, créer un compte, créer un projet.
2. Copier la **connection string** (`postgresql://...`).
3. La mettre dans `.env` → `DATABASE_URL`.

### 2. Initialiser la base

```bash
npm run db:push   # crée les tables dans Postgres
npm run ingest    # charge les 13 formations (depuis ../Modern-*-Engineering)
npm run admin:create
```

### 3. Variables d'environnement Vercel

Dans **Settings → Environment Variables** :

- `DATABASE_URL` → la connection string Neon
- `NEXTAUTH_SECRET` → une clé aléatoire (ex. `openssl rand -base64 32`)
- `NEXTAUTH_URL` → `https://<ton-projet>.vercel.app`

### 4. Branches

La branche `main` (production) contient l'app ; la branche `deploy` porte les
changements avant leur fusion dans `main`. Vercel redéploie sur chaque push.
