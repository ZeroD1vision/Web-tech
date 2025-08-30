# Этап сборки
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап запуска
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf etc/nginx/conf.d/default.conf

EXPOSE 80