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
    if(req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }
    next();
};
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Настройка CORS для безопасного взаимодействия с клиентом
app.use(cors({
    origin: 'http://localhost:3001', // Адрес клиентского приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
            data: 'Internal server error'
        });
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
