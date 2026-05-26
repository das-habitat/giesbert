FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app-shared/package.json ./app-shared/
COPY app-server/package.json ./app-server/

RUN pnpm install --frozen-lockfile

COPY app-shared ./app-shared
RUN pnpm --filter app-shared run build

COPY app-server ./app-server
RUN pnpm --filter app-server exec prisma generate
RUN pnpm --filter app-server run build

FROM node:22-alpine AS runtime

WORKDIR /usr/src/app

# needed for pnpm symlinks
COPY --from=build /usr/src/app/node_modules ./node_modules

COPY --from=build /usr/src/app/app-shared/dist ./app-shared/dist
COPY --from=build /usr/src/app/app-shared/package.json ./app-shared/package.json
COPY --from=build /usr/src/app/app-shared/node_modules ./app-shared/node_modules

COPY --from=build /usr/src/app/app-server/dist ./app-server/dist
COPY --from=build /usr/src/app/app-server/package.json ./app-server/package.json
COPY --from=build /usr/src/app/app-server/node_modules ./app-server/node_modules
COPY --from=build /usr/src/app/app-server/prisma ./app-server/prisma
COPY --from=build /usr/src/app/app-server/prisma.config.ts ./app-server/prisma.config.ts

USER node

EXPOSE 3000

WORKDIR /usr/src/app/app-server

CMD ["sh", "-c", "npm run db:migrate && npm run start:prod"]
