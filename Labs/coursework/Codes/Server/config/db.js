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
    const res = await pool.query(`SELECT * 
        FROM movies 
        ORDER BY 
            CASE WHEN position = 0 THEN 1 ELSE 0 END,
            position ASC
    `);
    return res.rows;
};

// Функция для получения фильма по ID
const getMovieById = async (id) => {
    const res = await pool.query(
        'SELECT id, title, description, image, trailerid, position FROM movies WHERE id = $1', 
        [id]
    );
    return res.rows[0];
};

const deleteMovieById = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM movies WHERE id = $1 RETURNING *', 
            [id]
        );
        
        if (result.rowCount === 0) {
            throw new Error(`Фильм с ID ${id} не найден`);
        }
        
        return result.rows[0];
    } catch (error) {
        console.error(`Ошибка удаления фильма ID ${id}:`, error);
        throw error;
    }
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
    const query = 'SELECT id, username, password, nickname, role FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

// Функция для получения всех пользователей (при необходимости)
const getAllUsersFromDB = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};

const createMovie = async (movieData) => {
    const { title, description, image, trailerid, position } = movieData;
    const query = `
        INSERT INTO movies (title, description, image, trailerid, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [title, description, image, trailerid, position || 0];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка создания фильма:', error);
        throw error;
    }
}

const updateMovie = async (id, movieData) => {
    const { title, description, image, trailerid, position } = movieData;
    const query = `
        UPDATE movies
        SET title = $1, 
            description = $2, 
            image = $3, 
            trailerid = $4, 
            position = $5
        WHERE id = $6
        RETURNING *
    `;
    const values = [title, description, image, trailerid, position, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
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
    deleteMovieById,
    nicknameExists,
    createMovie,
    updateMovie,
    updateMoviePosition,
    getLevelById,
    pool,
};