const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Кэш на 1 час

const cacheMiddleware = (req, res, next) => {
    // Проверяем, является ли маршрут кэшируемым
    if (req.path.startsWith('/movies') || req.path.startsWith('/profile')) {
        return next(); // Пропускаем кэширование для маршрутов /movies/:id
    }
    const cacheKey = req.originalUrl; // Используем URL как ключ кэша
    // Применяем кэширование только для GET-запросов
    if (req.method === 'GET') {
        const cachedResponse = cache.get(cacheKey);

        if (cachedResponse) {
            console.log(`Отдаём из кэша: ${cacheKey}`);
            return res.send(cachedResponse);
        }

        // Переопределяем res.send, чтобы кэшировать ответ
        const originalSend = res.send.bind(res);
        res.send = (body) => {
            cache.set(cacheKey, body);
            console.log(`Кэшируем: ${cacheKey}`);
            return originalSend(body);
        };
    } else {
        // Если это не GET-запрос, устанавливаем заголовок
        res.set('Cache-Control', 'no-cache');
    }

    next();
};

module.exports = cacheMiddleware;