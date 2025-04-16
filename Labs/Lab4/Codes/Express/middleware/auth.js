/* auth.js
const jwt = require('jsonwebtoken'); // или другой метод аутентификации
const client = require('../config/db');

const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    try {
        const decoded = jwt.verify(token, 'ваш_секретный_ключ'); // Замените на ваш секретный ключ
        const userId = decoded.id;

        // Получаем информацию о пользователе из базы данных
        const result = await client.query('SELECT * FROM users WHERE id = \$1', [userId]);
        if (result.rows.length > 0) {
            req.user = result.rows[0]; // Сохраняем пользователя в req.user
            return next(); // Продолжаем выполнение следующего middleware
        } else {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Недействительный токен' });
    }
};

module.exports = { authenticate };*/
