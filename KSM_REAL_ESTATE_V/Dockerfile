# Dockerfile for KSM Real Estate Frontend Next.js
# Author: ulrich675
# Date: 2026-07-13

# ==================== Build Stage ====================
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first (leverage layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy code and configuration files
COPY tsconfig.json next.config.ts eslint.config.mjs next-env.d.ts ./
COPY public ./public
COPY src ./src

# Disable telemetry and build Next.js app in production standalone mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ==================== Run Stage ====================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package metadata
COPY package.json ./

# Copy compiled standalone server and static assets from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose Next.js default port
EXPOSE 3000

# Start the Node.js standalone server
CMD ["node", "server.js"]
