# syntax=docker/dockerfile:1

# ---------------------------------------------------------------
# Étape 1 : dépendances
# ---------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------
# Étape 2 : build Next.js (standalone)
# La page d'accueil interroge la base au build => DATABASE_URL requis.
# ---------------------------------------------------------------
FROM node:22-slim AS builder
WORKDIR /app
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/build?sslmode=disable"
ARG NEXTAUTH_SECRET="build-secret"
ENV DATABASE_URL=${DATABASE_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET} \
    NEXTAUTH_URL="http://localhost:3000" \
    OTEL_SDK_DISABLED="true" \
    NEXT_TELEMETRY_DISABLED="1"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---------------------------------------------------------------
# Étape 3 : exécution (standalone + moteur Prisma)
# ---------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Moteur Prisma + client (nodupé par le standalone à cause du binaire natif)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Schéma Prisma exposé (diagnostic / migrations manuelles)
COPY --from=builder /app/prisma ./prisma

RUN chown -R node:node /app
USER node

EXPOSE 3000
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]