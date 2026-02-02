# --- Stage 1: Base Build ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

# Dummy URL for Prisma generation
ENV DATABASE_URL="mongodb+srv://dummy:dummy@cluster.mongodb.net/dummy"
RUN npx prisma generate --schema=./prisma/schema.prisma

# Workspace sync and build
RUN npx nx sync
RUN npx nx build api --prod
RUN npx nx build user-ui --prod
RUN npx nx build admin-ui --prod

# --- Stage 2: Production API ---
FROM node:20-alpine AS api
WORKDIR /app
RUN apk add --no-cache openssl

# API builds to apps/api/dist
COPY --from=builder /app/apps/api/dist ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev

EXPOSE 3000
# Runtime sync for Cloud MongoDB Atlas
CMD npx prisma db push --schema=./prisma/schema.prisma && node main.js

# --- Stage 3: Production UI (Next.js) ---
FROM node:20-alpine AS ui
WORKDIR /app
ENV NODE_ENV=production

# Next.js builds to .next folder
COPY --from=builder /app/apps/user-ui/.next ./.next
COPY --from=builder /app/apps/user-ui/public ./public
COPY --from=builder /app/apps/user-ui/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev

EXPOSE 3001
CMD ["npx", "next", "start"]

# --- Stage 4: Production Admin UI (Next.js) ---
FROM node:20-alpine AS admin-ui
WORKDIR /app
ENV NODE_ENV=production

# Next.js builds to .next folder
COPY --from=builder /app/apps/admin-ui/.next ./.next
COPY --from=builder /app/apps/admin-ui/public ./public
COPY --from=builder /app/apps/admin-ui/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev

EXPOSE 3002
CMD ["npx", "next", "start"]