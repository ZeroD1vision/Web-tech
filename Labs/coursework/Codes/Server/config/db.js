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
    .catch(err => console.error('дключения к PostgreSQL', err.stack));


// Функция для получения всех фильмов
const getAllMovies = async () => {
    const res = await pool.query('SELECT * FROM movies');
    return res.rows;
};

// Функция для получения фильма по ID
const getMovieById = async (id) => {
    console.log('Movie ID:', id); // Логируем ID перед выполнением запроса

    if (!id) {
        throw new Error('ID cannot be undefined or null');
    }
    const res = await pool.query('SELECT * FROM movies WHERE id = \$1', [id]);
    return res.rows[0];
};

// Функция для добавления пользователя в базу данных
const addUserToDB = async (user) => {
    const { username, nickname, password } = user;

    // Проверяем, существует ли никнейм
    if (await nicknameExists(nickname)) {
        throw new Error('Никнейм уже существует. Пожалуйста, выберите другой.');
    }

    const query = 'INSERT INTO users (username, nickname, password, level) VALUES (\$1, \$2, \$3, \$4) RETURNING *';
    const values = [username, nickname, password, 0]; // Уровень по умолчанию 0
    
    try {
        const result = await pool.query(query, values);

        // Логируем результат запроса
        console.log('Результат вставки:', result.rows[0]);
        
        console.log('Пользователь успешно добавлен в базу данных.');
        // Возвращаем созданного пользователя с его id
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка при добавлении пользователя в базу данных:', error);
        throw error; // Перебрасываем ошибку для дальнейшей обработки
    }
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
        console.log('Результат проверки никнейма:', parseInt(result.rows[0].count));
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
    console.log('Результат запроса:', result.rows[0]);
    return result.rows[0]; // Возвращает первого найденного пользователя или undefined
};

// Функция для получения всех пользователей (при необходимости)
const getAllUsersFromDB = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};

const updateMovie = async (id, updatedData) => {
    const { title, description, image } = updatedData;
    const query = `
        UPDATE movies
        SET title = \$1, description = \$2, image = \$3
        WHERE id = \$4
    `;

    try {
        const result = await pool.query(query, [title, description, image, id]);
        return result.rowCount > 0; // Возвращаем true, если обновление прошло успешно
    } catch (error) {
        console.error('Ошибка обновления фильма:', error);
        throw error; // Пробрасываем ошибку дальше для обработки в контроллере
    }
};

const deleteMovieById = async (id) => {
    console.log(id);
    try {
        console.log('await');
        const result = await pool.query('DELETE FROM movies WHERE id = \$1', [id]);
        console.log('afterawait');
        console.log(result);
        return true;
    } catch (err) {
        console.error(err);
        throw new Error('Ошибка сервера'); // Генерируем ошибку для обработки в контроллере
    }
};

const updateMoviePosition = async (movieId, newPosition) => {
    // Получаем текущую позицию элемента
    const currentMovie = await getMovieById(movieId);
    const currentPosition = currentMovie.position;

    // Если новая позиция меньше текущей, увеличиваем позицию всех элементов между текущей и новой
    if (newPosition < currentPosition) {
        await db.query(`
            UPDATE movies
            SET position = position + 1
            WHERE position >= \$1 AND position < \$2
        `, [newPosition, currentPosition]);
    } else if (newPosition > currentPosition) {
        // Если новая позиция больше текущей, уменьшаем позицию всех элементов между текущей и новой
        await db.query(`
            UPDATE movies
            SET position = position - 1
            WHERE position > \$1 AND position <= \$2
        `, [currentPosition, newPosition]);
    }

    // Обновляем позицию самого элемента
    await db.query(`
        UPDATE movies
        SET position = \$1
        WHERE id = \$2
    `, [newPosition, movieId]);
}

const getLevelById = async (levelId) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_levels WHERE id = $1',
            [levelId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка получения уровня:', error);
        throw error;
    }
};

module.exports = {
    addUserToDB,
    findUserById,
    findUserByUsernameInDB,
    getAllUsersFromDB,
    getAllMovies,
    getMovieById,
    nicknameExists,
    updateMovie,
    updateMoviePosition,
    deleteMovieById,
    getLevelById,
    pool,
};