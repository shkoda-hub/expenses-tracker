## base
FROM node:24-bookworm-slim as base
WORKDIR /app

## deps
FROM base as deps

RUN apt-get update \
 && apt-get install -y --no-install-recommends procps \
 && rm -rf /var/lib/apt/lists/*

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=nest-cli.json,target=nest-cli.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

## build
FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

## dev
FROM build as dev
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

## production
FROM base as prod

ENV NODE_ENV production

#WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
