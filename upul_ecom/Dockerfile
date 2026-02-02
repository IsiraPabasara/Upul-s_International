# --- Stage 1: Base Build ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

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

# Create minimal package.json for API with only backend dependencies
RUN node -e " \
  const pkg = require('./package.json'); \
  const apiDeps = { \
    '@prisma/client': pkg.dependencies['@prisma/client'], \
    'bcrypt': pkg.dependencies['bcrypt'], \
    'bcryptjs': pkg.dependencies['bcryptjs'], \
    'cookie-parser': pkg.dependencies['cookie-parser'], \
    'cors': pkg.dependencies['cors'], \
    'dotenv': pkg.dependencies['dotenv'], \
    'ejs': pkg.dependencies['ejs'], \
    'express': pkg.dependencies['express'], \
    'express-rate-limit': pkg.dependencies['express-rate-limit'], \
    'helmet': pkg.dependencies['helmet'], \
    'imagekit': pkg.dependencies['imagekit'], \
    'ioredis': pkg.dependencies['ioredis'], \
    'jsonwebtoken': pkg.dependencies['jsonwebtoken'], \
    'morgan': pkg.dependencies['morgan'], \
    'nodemailer': pkg.dependencies['nodemailer'], \
    'slugify': pkg.dependencies['slugify'], \
    'swagger-ui-express': pkg.dependencies['swagger-ui-express'], \
    'uuid': pkg.dependencies['uuid'], \
    'zod': pkg.dependencies['zod'] \
  }; \
  const minPkg = { name: 'api', version: '1.0.0', dependencies: apiDeps }; \
  require('fs').writeFileSync('./api-package.json', JSON.stringify(minPkg, null, 2)); \
"

# Clean up builder
RUN rm -rf node_modules/.cache .next/cache apps/*/node_modules

# Aggressively prune standalone output to reduce size
RUN cd apps/user-ui/.next/standalone && \
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name "LICENSE*" -o -name "*.map" -o -name "*.d.ts" -o -name "*.d.mts" -o -name "CHANGELOG*" -o -name "readme*" -o -name "README*" -o -name "*.flow" -o -name "*.ts.map" -o -name "*.mts" -o -name "*.cts" \) -delete 2>/dev/null || true && \
    find . -type d \( -name "test" -o -name "tests" -o -name "__tests__" -o -name "docs" -o -name ".github" -o -name "example" -o -name "examples" -o -name "benchmark" -o -name "benchmarks" -o -name ".idea" -o -name ".vscode" \) -exec rm -rf {} + 2>/dev/null || true && \
    find . -name "package.json" -exec sed -i 's/"types":.*,//g' {} \; 2>/dev/null || true && \
    find . -type f -name "*.node" ! -path "*linux-x64*" ! -path "*linuxmusl-x64*" -delete 2>/dev/null || true

# --- Stage 2: Production API (Minimal) ---
FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library
ENV PRISMA_CLIENT_ENGINE_TYPE=library

COPY --from=builder /app/apps/api/dist ./
COPY --from=builder /app/api-package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install only API dependencies
RUN npm install --omit=dev --omit=optional && \
    npm cache clean --force && \
    find node_modules -type f \( -name "*.md" -o -name "LICENSE*" -o -name "*.map" \) -delete && \
    find node_modules -type d \( -name "test" -o -name "tests" -o -name "__tests__" \) -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/*

EXPOSE 3000
CMD npx prisma@6.19 db push --schema=./prisma/schema.prisma && node main.js

# --- Stage 3: Production UI (Next.js Standalone) ---
# Using distroless for minimal size - only ~50MB base
FROM gcr.io/distroless/nodejs20-debian12 AS ui
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0

# For Nx monorepos, standalone includes full app structure with all deps bundled
COPY --from=builder /app/apps/user-ui/.next/standalone ./
COPY --from=builder /app/apps/user-ui/.next/static ./apps/user-ui/.next/static
COPY --from=builder /app/apps/user-ui/public ./apps/user-ui/public

EXPOSE 3001
CMD ["apps/user-ui/server.js"]