// Ограничить доступ к определённым маршрутам только для администраторов
const { pool } = require('../config/db');

const isAdmin = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const userId = req.user.id;

    try {
        const result = await pool.query('SELECT role FROM users WHERE id = \$1', [userId]);

        if (result.rows.length > 0 && result.rows[0].role === 'admin') {
            return next(); // Пользователь администратор, продолжаем
        } else {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = { isAdmin };