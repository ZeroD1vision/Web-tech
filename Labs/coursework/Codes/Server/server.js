const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Настройка CORS для безопасного взаимодействия с клиентом
app.use(cors({
    origin: 'http://localhost:3001', // Укажите адрес вашего клиентского приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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


// Основной маршрут
app.get('/', (req, res) => {
    res.send('API работает!');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
