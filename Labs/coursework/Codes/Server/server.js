const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');
const client = require('prom-client');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const movieController = require('./controllers/movieController');

const JWT_SECRET = process.env.JWT_SECRET || '911onelove9111';

const app = express();
const PORT = process.env.PORT || 3000;

// Создаем реестр метрик
const register = new client.Registry();

// Добавляем стандартные метрики Node.js
client.collectDefaultMetrics({ register });

// Метрика для времени ответа
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Длительность HTTP-запросов в секундах',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);


// Валидация фильмов
const movieValidation = [
    body('title')
      .trim()
      .notEmpty().withMessage('Название обязательно')
      .isLength({ max: 100 }).withMessage('Максимум 100 символов'),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Описание обязательно'),
    
      body('release_year')
      .exists().withMessage('Год выпуска обязателен')
      .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
      .withMessage('Некорректный год выпуска')
      .toInt(),
    
    // body('image')
    //   .isURL().withMessage('Некорректный URL изображения')
    //   .matches(/\.(jpeg|jpg|gif|png)$/).withMessage('Неподдерживаемый формат изображения'),
    
    body('trailerid')
      .trim()
      .notEmpty().withMessage('Идентификатор трейлера обязателен'),
    
    body('genres')
      .isArray({ min: 1 }).withMessage('Выберите хотя бы один жанр'),
    
    body('position')
      .isInt({ min: 0 }).withMessage('Позиция должна быть положительным числом')
];


const userUpdateValidation = [
    body('nickname')
        .trim()
        .notEmpty().withMessage('Никнейм обязателен')
        .isLength({ max: 30 }).withMessage('Максимум 30 символов'),

    body('email')
        .optional()
        .isEmail().withMessage('Некорректный email')
];


const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
              path: err.param,
              msg: err.msg
            }))
        });
    }
    next();
};


// Middleware для сбора метрик
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ 
      method: req.method, 
      route: req.route?.path || req.path || 'unknown', 
      code: res.statusCode 
    });
  });
  next();
});

// Middleware cookies 
app.use(cookieParser());

// Настройка CORS для безопасного взаимодействия с клиентом
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'http://localhost:8080'
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400 // 24 часа
};

app.use(cors(corsOptions));

// Явная обработка preflight-запросов
app.options('/*path', cors(corsOptions), (req, res) => {
    res.sendStatus(204);
});

// Middleware для проверки JWT
const authMiddleware = (req, res, next) => {
    console.log("Incoming cookies:", req.headers.cookie);
    console.log("Parsed cookies:", req.cookies);
    console.log("Cookies:", req.cookies);
    if (req.method === 'OPTIONS') {
      return next();
    }
    const token = req.cookies.accessToken;
    console.log('Полученный токен из кук:', token);
    // const token = req.headers.authorization?.split(' ')[1];
    // console.log('Полученный токен:', token);
    
    if (!token) {
        console.log('Токен отсутствует');
        return res.status(401).json({ message: 'Требуется авторизация' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Декодированный токен:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Ошибка верификации токена:', error.message);
        res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Middleware для администарторов
const isAdmin = (req, res, next) => {
    if (!req.user?.role || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Доступ запрещен. Требуются права администратора' 
        });
    }
    next();
};

app.options('/api/movies', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Эндпоинт для Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Cookies:', req.cookies);
    next();
  });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Аутентификация
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logoutUser);

app.options('/api/users/me', cors(corsOptions));
app.get('/api/users/me', authMiddleware, authController.getCurrentUser);
app.put('/api/users/me', 
    authMiddleware,
    userUpdateValidation, 
    handleValidation,
    async (req, res) => {
    try { 
        const updatedUser = await db.updateUser(req.user.id, req.body);
        res.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


app.delete('/api/users/me', authMiddleware, async (req, res) => {
    try {
        await db.deleteUserById(req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Ошибка при удалении аккаунта'
        });
    }
});

app.get('/api/user-levels/:levelId', async (req, res) => {
    console.log(`Запрос уровня с ID: ${req.params.levelId}`);
    try {
        const level = await db.getLevelById(req.params.levelId);
        console.log('Результат запроса уровня:', level);
        res.json({
            success: true,
            level
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения информации об уровне'
        });
    }
});

// Получение всех жанров
app.options('/api/genres', cors(corsOptions));
app.get('/api/genres', async (req, res) => {
    try {
        const genres = await db.getAllGenres();
        res.json({ 
            success: true, 
            genres 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения жанров' });
    }
});


app.get('/api/movies', async (req, res) => {
    try {
        const movies = await db.getAllMovies();
        res.status(200).json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('Database Error: ', error);
        res.status(500).json({
            success: false,
            data: 'Внутренняя ошибка сервера'
        });
    }
});

app.get('/api/movies/search', async (req, res) => {
    try {
        const { search, genre, yearFrom, yearTo } = req.query;

        let baseQuery = `
            SELECT 
                m.*,
                COALESCE(AVG(r.rating), 0) AS rating,
                COUNT(r.id) AS ratings_count,
                ARRAY_AGG(DISTINCT g.id) AS genre_ids,
                STRING_AGG(DISTINCT g.name, ', ') AS genres
            FROM movies m
            LEFT JOIN ratings r ON m.id = r.movie_id
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
        `;

        const conditions = [];
        const params = [];

        // Поиск по названию
        if (search) {
            conditions.push(`m.title ILIKE $${params.length + 1}`);
            params.push(`%${search}%`);
        }

        // Фильтр по жанру
        if (genre) {
            conditions.push(`EXISTS (
                SELECT 1 FROM movie_genres mg
                WHERE mg.movie_id = m.id AND mg.genre_id = $${params.length + 1}
            )`);
            params.push(genre);
        }

        // Фильтр по году
        const yearConditions = [];
        if (yearFrom) {
            yearConditions.push(`m.release_year >= $${params.length + 1}`);
            params.push(parseInt(yearFrom));
        }
        if (yearTo) {
            yearConditions.push(`m.release_year <= $${params.length + 1}`);
            params.push(parseInt(yearTo));
        }
        if (yearConditions.length) {
            conditions.push(`(${yearConditions.join(' AND ')})`);
        }

        // Собираем окончательный запрос
        if (conditions.length) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }

        baseQuery += ' GROUP BY m.id ORDER BY m.position';

        const result = await db.pool.query(baseQuery, params);
        res.json({ 
            success: true, 
            data: result.rows.map(movie => ({
                ...movie,
                release_year: parseInt(movie.release_year)
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при выполнении поиска' 
        });
    }
});

// Получение фильма по ID
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await db.getMovieById(req.params.id);
        if(!movie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        const movieWithDetails = {
            ...movie,
            release_year: movie.release_year,
            rating: movie.rating || 0,
            genre: movie.genre || 'Не указан',
            trailerid: movie.trailerid
        };

        res.json({
            success: true, 
            movie: movieWithDetails 
        });
    } catch (error) {
        console.error('Ошибка получения фильма:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// Создание фильма (только для админов)
app.post('/api/movies', authMiddleware, isAdmin, movieValidation, handleValidation, async (req, res) => {
    try {
        const { genres, ...movieData } = req.body;
        console.log(movieData);
        const newMovie = await db.createMovie(movieData);
        
        if(genres?.length) {
            await db.updateMovieGenres(newMovie.id, genres);
        }
        
        res.status(201).json({ success: true, movie: newMovie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Обновление фильма (только для админов)
app.put('/api/movies/:id', authMiddleware, isAdmin, movieValidation, handleValidation, async (req, res) => {
    console.log('User role:', req.user.role);
    try {
        const { genres, release_year, ...restData } = req.body;
        console.log('Received update data:', req.body);

        // Формируем полный объект данных для обновления
        const movieData = { 
            ...restData,
            release_year: parseInt(release_year) // Преобразуем в число
        };

        // Проверка наличия обязательного поля
        if (typeof movieData.release_year === 'undefined') {
            throw new Error('Поле release_year обязательно для заполнения');
        }

        const updatedMovie = await db.updateMovie(req.params.id, movieData);
        
        if(genres) {
            await db.updateMovieGenres(req.params.id, genres);
        }
        
        res.json({ success: true, movie: updatedMovie });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Удаление фильма (только для админов)
//Добавить модальное окно 
app.delete('/api/movies/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await db.deleteMovieById(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

//!!!!!!!!!!!!!!!!!!app.post('/api/auth/about', );

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
