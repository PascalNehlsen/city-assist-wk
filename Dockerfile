FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --chown=nonroot:nonroot --from=builder /app/public ./public
COPY --chown=nonroot:nonroot --from=builder /app/.next/standalone ./
COPY --chown=nonroot:nonroot --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["server.js"]
