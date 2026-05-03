FROM node:20-alpine AS base
WORKDIR /app
# openssl: Prisma on musl；ca-certificates: HTTPS to registry / engine downloads
RUN apk add --no-cache libc6-compat openssl ca-certificates

FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
# 构建不包含 .env；Prisma 解析 datasource 时部分版本需要该变量
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
# npm registry + Prisma 引擎下载偶有 TLS 中断，整轮 npm ci 重试可避免偶发构建失败
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && i=1 \
  && while true; do \
       npm ci --no-audit --no-fund && break; \
       [ "$i" -ge 8 ] && exit 1; \
       sleep $((i * 15)); \
       i=$((i + 1)); \
     done

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node server.js"]
