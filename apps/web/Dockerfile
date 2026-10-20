FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
# Parallel esbuild postinstalls can overwrite each other's binaries.
ENV npm_config_child_concurrency=1 \
    npm_config_fetch_timeout=600000
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile --filter @reactiv/web...
COPY . .
ENV SKIP_ENV_VALIDATION=true
RUN pnpm --filter @reactiv/web build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
