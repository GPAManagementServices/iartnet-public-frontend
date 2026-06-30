# Build context: repository root (/opt/iartnet_frontend)
#
# Public URLs (NUXT_PUBLIC_*, NUXT_SITE_URL) must be available during `pnpm build`
# so they are baked into `.output` (Nitro + client). Setting them only on the
# runtime container is not enough: pass build-args or ENV in this stage.
#
# STG defaults (see _ai-context/IARTNET_ENVIRONMENTS.md) apply in nuxt.config.ts
# only when these args are omitted or empty.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV CI=1

# pnpm fisso e riproducibile
RUN corepack enable pnpm && corepack use pnpm@10.31.0

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NUXT_PUBLIC_APP_VERSION=0.0.0-dev
ENV NUXT_PUBLIC_APP_VERSION=${NUXT_PUBLIC_APP_VERSION}

# Baked at build time (see nuxt.config.ts — runtimeConfig.public + siteUrl / i18n)
ARG NUXT_PUBLIC_BASE_URL
ARG NUXT_PUBLIC_BASE_DATA_URL
ARG NUXT_PUBLIC_BASEIIIF_URL
ARG NUXT_SITE_URL
ARG NUXT_PUBLIC_SITE_URL
ARG NUXT_PUBLIC_SHOW_HIDDEN_DATA
ARG NUXT_PUBLIC_WAI_ENABLED
ARG NUXT_PUBLIC_WAI_SITE_ID
ARG NUXT_PUBLIC_WAI_TRACKER_URL
ARG NUXT_PUBLIC_WAI_DOMAINS
ARG NUXT_PUBLIC_SITEMAP_ENABLED=false

ENV NUXT_PUBLIC_BASE_URL=${NUXT_PUBLIC_BASE_URL}
ENV NUXT_PUBLIC_BASE_DATA_URL=${NUXT_PUBLIC_BASE_DATA_URL}
ENV NUXT_PUBLIC_BASEIIIF_URL=${NUXT_PUBLIC_BASEIIIF_URL}
ENV NUXT_SITE_URL=${NUXT_SITE_URL}
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
ENV NUXT_PUBLIC_SHOW_HIDDEN_DATA=${NUXT_PUBLIC_SHOW_HIDDEN_DATA}
ENV NUXT_PUBLIC_WAI_ENABLED=${NUXT_PUBLIC_WAI_ENABLED}
ENV NUXT_PUBLIC_WAI_SITE_ID=${NUXT_PUBLIC_WAI_SITE_ID}
ENV NUXT_PUBLIC_WAI_TRACKER_URL=${NUXT_PUBLIC_WAI_TRACKER_URL}
ENV NUXT_PUBLIC_WAI_DOMAINS=${NUXT_PUBLIC_WAI_DOMAINS}
ENV NUXT_PUBLIC_SITEMAP_ENABLED=${NUXT_PUBLIC_SITEMAP_ENABLED}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# pulizia preventiva di artefatti precedenti
RUN rm -rf .nuxt .output
RUN pnpm build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Nuxt per Docker: basta .output
COPY --from=build /app/.output ./

EXPOSE 3000
CMD ["node", "/app/server/index.mjs"]
