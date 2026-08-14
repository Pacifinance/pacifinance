# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# .env is deliberately excluded from the build context (.dockerignore) so
# server secrets never end up in an image layer - but that also means Vite
# sees none of the VITE_* values from it. These aren't secrets (they end up
# in the browser bundle either way), so pass them in explicitly as build
# args instead, sourced from .env via docker-compose.yml's `build.args`.
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_UMAMI_SCRIPT_URL
ARG VITE_WEB_PUSH_PUBLIC_KEY
ARG VITE_DEV_MODE
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY \
    VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID \
    VITE_UMAMI_SCRIPT_URL=$VITE_UMAMI_SCRIPT_URL \
    VITE_WEB_PUSH_PUBLIC_KEY=$VITE_WEB_PUSH_PUBLIC_KEY \
    VITE_DEV_MODE=$VITE_DEV_MODE
RUN npm run build

FROM nginx:1.27-alpine AS web
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

FROM node:22-alpine AS api
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY server ./server
COPY api ./api
EXPOSE 3000
# Run through the tsx CLI (same as package.json's "dev:server"), not
# `node --import tsx/esm <file>.ts` - handing node a .ts entry file directly
# while registering tsx/esm as a loader makes it load index.ts through both
# the CJS and ESM paths at once, which Node 22 rejects with
# ERR_REQUIRE_CYCLE_MODULE instead of running it.
CMD ["npx", "tsx", "server/src/index.ts"]
