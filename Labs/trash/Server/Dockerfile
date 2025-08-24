FROM node:18-alpine

WORKDIR /app

# Установка wait-port для проверки доступности БД
RUN npm install -g wait-port

# Установка необходимых утилит
RUN npm install -g wait-port && \
    apk add --no-cache postgresql-client curl  # Добавили curl

COPY package*.json ./
RUN npm install --production
COPY . .

RUN mkdir -p /app/public/images
COPY public/images /app/public/images

RUN apk add --no-cache postgresql-client

CMD ["sh", "-c", "wait-port -t 30000 postgres:5432 && node server.js"]
EXPOSE 3000