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
    const res = await pool.query(`
        SELECT 
          m.*,
          COALESCE(AVG(r.rating), 0) AS rating,
          COUNT(r.id) AS ratings_count,
          ARRAY_AGG(DISTINCT g.id) FILTER (WHERE g.id IS NOT NULL) AS genre_ids,
          STRING_AGG(DISTINCT g.name, ', ') AS genres
        FROM movies m
        LEFT JOIN ratings r ON m.id = r.movie_id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.id = $1
        GROUP BY m.id
      `, [id]);
      return {
        ...res.rows[0],
        release_year: parseInt(res.rows[0].release_year) || null
    };
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

// Получение всех жанров
const getAllGenres = async () => {
    const res = await pool.query('SELECT * FROM genres');
    return res.rows;
};

// Обновление жанров фильма
const updateMovieGenres = async (movieId, genreIds) => {
    // Удаляем старые жанры
    await pool.query('DELETE FROM movie_genres WHERE movie_id = $1', [movieId]);
    
    // Добавляем новые
    for (const genreId of genreIds) {
        await pool.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)',
            [movieId, genreId]
        );
    }
};

// Функция для добавления пользователя в базу данных
const addUserToDB = async (user) => {
    const { username, nickname, password, email } = user;

    // Проверяем, существует ли никнейм
    if (await nicknameExists(nickname)) {
        throw new Error('Никнейм уже существует. Пожалуйста, выберите другой.');
    }

    const query = `
        INSERT INTO users 
            (username, nickname, password, email, level) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `;
    const values = [username, nickname, password, email, 0]; // Уровень по умолчанию 0
    
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
    const result = await pool.query(`
    SELECT 
      users.*,
      user_levels.name as level_name,
      user_levels.description as level_description
    FROM users
    LEFT JOIN user_levels ON users.level = user_levels.id
    WHERE users.id = $1
  `, [id]);
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
    const query = `
        SELECT 
            id, 
            username, 
            password, 
            nickname, 
            role, 
            level
        FROM users 
        WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

// Функция для получения всех пользователей (при необходимости)
const getAllUsersFromDB = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};


const updateUser = async (userId, userData) => {
    const { nickname, email } = userData;
    const query = `
    UPDATE users
    SET nickname = $1, email = $2
    WHERE id = $3
    RETURNING *
    `;
    const values = [nickname, email, userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка обновления профиля пользователя', error);
        throw new Error('Ошибка при обновлении профиля');
    }
};


const deleteUserById = async (userId) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    } catch {
        console.error('Ошибка обновления пользователя:', error);
        throw new Error('Ошибка при обновлении профиля');
    }
};


const createMovie = async (movieData) => {
    const { title, description, image, trailerid, position, release_year } = movieData;
    const query = `
        INSERT INTO movies 
            (title, 
            description, 
            image, 
            trailerid, 
            position,
            release_year)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [
        title, 
        description, 
        image || null, 
        trailerid, 
        position || 0,
        release_year ? parseInt(release_year) : null
    ];
    

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка создания фильма:', error);
        throw error;
    }
}

const updateMovie = async (id, movieData) => {
    const { title, description, image, trailerid, position, release_year } = movieData;
    const query = `
        UPDATE movies
        SET title = $1, 
            description = $2, 
            image = $3, 
            trailerid = $4, 
            position = $5,
            release_year = $6
        WHERE id = $7
        RETURNING *
    `;
    const values = [
        title, 
        description, 
        image, 
        trailerid, 
        position || 0, 
        release_year ? parseInt(release_year) : null,
        id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};


const updateMoviePosition = async (movieId, newPosition) => {
    await pool.query(`
        UPDATE movies
        SET position = position + 1
        WHERE position >= \$1 AND position < \$2
    `, [newPosition, currentPosition]);

    await pool.query(`
        UPDATE movies
        SET position = position - 1
        WHERE position > \$1 AND position <= \$2
    `, [currentPosition, newPosition]);

    await pool.query(`
        UPDATE movies
        SET position = \$1
        WHERE id = \$2
    `, [newPosition, movieId]);
}

const getLevelById = async (levelId) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM user_levels WHERE id = $1',
            [levelId]
        );
        return rows[0] || null;
    } catch (error) {
        throw new Error(`Ошибка получения уровня: ${error.message}`);
    }
};

module.exports = {
    addUserToDB,
    findUserById,
    findUserByUsernameInDB,
    updateUser,
    deleteUserById,
    getAllUsersFromDB,
    getAllMovies,
    getMovieById,
    deleteMovieById,
    getAllGenres,
    updateMovieGenres,
    nicknameExists,
    createMovie,
    updateMovie,
    updateMoviePosition,
    getLevelById,
    pool,
};