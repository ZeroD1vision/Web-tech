//const { Client } = require('pg');
const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Проверяем соединение с базой данных
pool.connect()
    .then(() => console.log('Подключение к PostgreSQL успешно!'))
    .catch(err => console.error('Ошибка подключения к PostgreSQL', err.stack));


// Функция для получения всех фильмов
const getAllMovies = async () => {
    const res = await pool.query('SELECT * FROM movies');
    return res.rows;
};

// Функция для получения фильма по ID
const getMovieById = async (id) => {
    const res = await pool.query('SELECT * FROM movies WHERE id = \$1', [id]);
    return res.rows[0];
};

module.exports = {
    getAllMovies,
    getMovieById,
    pool,
};