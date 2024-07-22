FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

FROM base AS prod-deps
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --production

FROM base AS builder
COPY . .
RUN yarn --frozen-lockfile
RUN yarn build

FROM base AS app
COPY --from=builder /app/public ./public
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=prod-deps /app/node_modules ./node_modules
ENV NODE_ENV production

EXPOSE 10001

CMD ["PORT=10001", "yarn", "start"]