# 后端 Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app/server
ENV NODE_ENV=production

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
COPY server/package.json ./

EXPOSE 3001
CMD ["npm", "start"]
