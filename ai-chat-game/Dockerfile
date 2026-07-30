# 前端 Dockerfile（构建 -> nginx 托管静态文件）
FROM node:20-alpine AS builder

ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
