//const db = require('../config/db');

// Функция для получения всех пользователей (если потребуется)
const getAllUsers = async () => {
    try {
        const result = await pool.query('SELECT * FROM users');
        return result.rows; // Возвращаем массив всех пользователей
    } catch (error) {
        console.error('Ошибка при получении всех пользователей:', error);
        throw error; // Обрабатываем ошибку, если необходимо
    }
};

// Экспортируем функции и массив пользователей
module.exports = { getAllUsers };
