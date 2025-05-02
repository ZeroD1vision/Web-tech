const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const movieController = require('./controllers/movieController');
const JWT_SECRET = process.env.JWT_SECRET || '911onelove911';

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware для проверки JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Полученный токен:', token);
    
    if(!token) return res.status(401).json({ message: 'Требуется авторизация' });

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
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Настройка CORS для безопасного взаимодействия с клиентом
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
}));

app.use(express.json());

// Аутентификация
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.get('/api/users/me', authMiddleware, authController.getCurrentUser);

app.get('/api/user-levels/:levelId', async (req, res) => {
    try {
        const level = await db.getLevelById(req.params.levelId);
        res.json({
            success: true,
            level
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка получения информации об уровне'
        });
    }
});

// Получение всех жанров
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
