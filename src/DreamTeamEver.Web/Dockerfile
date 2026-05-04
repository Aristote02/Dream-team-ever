FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist/board-app-client /usr/share/nginx/html
RUN echo 'server { listen 80; server_name localhost; location / { root /usr/share/nginx/html/browser; index index.html; try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf

