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
    if (!id) {
        throw new Error('ID cannot be undefined or null');
    }
    const res = await pool.query('SELECT * FROM movies WHERE id = \$1', [id]);
    return res.rows[0];
};

// Функция для добавления пользователя в базу данных
const addUserToDB = async (user) => {
    const { username, nickname, password } = user;
    const query = 'INSERT INTO users (username, nickname, password) VALUES (\$1, \$2, \$3)';
    await pool.query(query, [username, nickname, password]);
};

const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = \$1', [id]);
    return result.rows[0]; // Возвращаем первого найденного пользователя или undefined
};

// Функция для проверки существования никнейма
const nicknameExists = async (nickname) => {
    const query = 'SELECT COUNT(*) FROM users WHERE nickname = \$1';
    const values = [nickname];

    try {
        const result = await pool.query(query, values);
        return parseInt(result.rows[0].count) > 0; // Если количество больше 0, никнейм существует
    } catch (error) {
        console.error('Ошибка при проверке никнейма:', error);
        throw error; // Обрабатываем ошибку
    }
};

// Функция для поиска пользователя по имени в базе данных
const findUserByUsernameInDB = async (username) => {
    if (!username) {
        throw new Error('Username cannot be undefined or null');
    }
    const query = 'SELECT * FROM users WHERE username = \$1';
    const result = await pool.query(query, [username]);
    return result.rows[0]; // Возвращает первого найденного пользователя или undefined
};

// Функция для получения всех пользователей (при необходимости)
const getAllUsersFromDB = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};

module.exports = {
    addUserToDB,
    findUserById,
    findUserByUsernameInDB,
    getAllUsersFromDB,
    getAllMovies,
    getMovieById,
    nicknameExists,
    pool,
};