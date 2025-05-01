const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');
const authController = require('./controllers/authController');
const movieController = require('./controllers/movieController');
const JWT_SECRET = process.env.JWT_SECRET || '911onelove911';

const app = express();
const PORT = process.env.PORT || 3000;

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

        let query = `
            SELECT m.*,
            `;
    } catch (error) {}
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
            year: new Date(movie.release_year).getFullYear(),
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
app.post('/api/movies', authMiddleware, isAdmin, async (req, res) => {
    try {
        const newMovie = await db.createMovie(req.body);
        res.status(201).json({ success: true, movie: newMovie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Обновление фильма (только для админов)
app.put('/api/movies/:id', authMiddleware, isAdmin, async (req, res) => {
    console.log('User role:', req.user.role);
    try {
        const updatedMovie = await db.updateMovie(req.params.id, req.body);
        res.json({ 
            success: true, 
            movie: updatedMovie 
        });
    } catch (error) {
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
