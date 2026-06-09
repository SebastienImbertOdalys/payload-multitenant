# ────────────────────────────────────────────────────────────────────────────
# Stage 1 – deps: install all dependencies (cached layer)
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy manifest files only — maximises Docker layer cache hits
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ────────────────────────────────────────────────────────────────────────────
# Stage 2 – builder: compile Next.js + Payload
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Re-use installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Ensure public/ exists even if the repo does not define static assets yet
RUN mkdir -p public

# Build-time env stubs — real values are injected at runtime
ENV NODE_ENV=production
ENV DATABASE_URL=mongodb://mongo:27017/payload
ENV PAYLOAD_SECRET=build_time_secret_placeholder

RUN pnpm build

# ────────────────────────────────────────────────────────────────────────────
# Stage 3 – runner: minimal production image
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user/group
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone server bundle produced by `output: 'standalone'`
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Public folder (uploads, favicon, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone entry point
CMD ["node", "server.js"]
