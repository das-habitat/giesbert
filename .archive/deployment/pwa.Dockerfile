FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app-shared/package.json ./app-shared/
COPY app-pwa/package.json ./app-pwa/

RUN pnpm install --frozen-lockfile

COPY app-shared ./app-shared
RUN pnpm --filter app-shared run build

COPY app-pwa ./app-pwa
RUN pnpm --filter app-pwa run build

FROM caddy:2-alpine AS runtime

COPY deployment/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/app-pwa/dist /srv

EXPOSE 80 443
