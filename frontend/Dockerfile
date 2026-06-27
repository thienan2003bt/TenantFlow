# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "start"]