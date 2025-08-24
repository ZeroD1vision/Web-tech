FROM node:20
WORKDIR /app

# Кэширование зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование приложения
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]