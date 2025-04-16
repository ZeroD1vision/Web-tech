// Ограничить доступ к определённым маршрутам только для администраторов
const client = require('../config/db');

const isAdmin = async (req, res, next) => {
    const userId = req.user.id;
    const result = await client.query('SELECT role FROM users WHERE id = \$1', [userId]);

    if(result.rows.length > 0 && result.rows[0].role === 'admin') {
        return next(); // Пользователь администратор, продолжаем
    } else {
        return res.status(403).json({message: 'Доступ запрещен'})
    }
};

module.exports = { isAdmin };