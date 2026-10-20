FROM node:22-bookworm-slim AS base
RUN npm install -g pnpm@11.17.0
WORKDIR /app

FROM base AS build
# Parallel esbuild postinstalls can overwrite each other's binaries.
ENV npm_config_child_concurrency=1 \
    npm_config_fetch_timeout=600000
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api apps/api
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts packages/contracts
# --legacy copies @reactiv/contracts into the image. Current pnpm will not
# deploy a workspace package unless its dependencies are injected.
RUN pnpm --filter @reactiv/api deploy --prod --legacy /out

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out ./
USER node
EXPOSE 3001
CMD ["node", "--import", "tsx", "src/server.ts"]
