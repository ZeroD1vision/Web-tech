const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || '911onelove911';
const SALT_ROUNDS = 10;

const registerUser = async (req, res) => {
    try {
        const { username, nickname, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await db.addUserToDB({
            username,
            nickname,
            password: hashedPassword
        });
        
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role // Добавляем роль в ответ
            },
            message: 'Регистрация прошла успешно!'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Ошибка регистрации: ' + error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.findUserByUsernameInDB(username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Неверные учетные данные');
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                role: user.role // Добавляем роль в токен
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role // Добавляем роль в ответ
            },
            message: 'Вход выполнен успешно!'
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Неверное имя пользователя или пароль'
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) throw new Error('Пользователь не найден');
        
        const userData = {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role, // Явно добавляем роль
            credits: Number(user.credits),
            tickets: Number(user.tickets),
            subscriptions: Number(user.subscriptions)
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Ошибка в getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};