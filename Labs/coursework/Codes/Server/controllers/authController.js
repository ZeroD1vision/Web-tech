const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || '911onelove9111';
const SALT_ROUNDS = 10;

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
    
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

const refreshToken = async (req, res) => {
    // const { refreshToken } = req.body;
    
    // try {
    //     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    //     const user = await db.findUserById(decoded.id);
        
    //     if (!user) throw new Error('Пользователь не найден');
        
    //     const newTokens = generateTokens(user);
        
    //     res.json({
    //         success: true,
    //         ...newTokens
    //     });

    try {
        const refreshToken = req.cookies.refreshToken;
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await db.findUserById(decoded.id);

        if (!user) throw new Error('Пользователь не найден');

        const { newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Обновляем куки
        res.cookie('accessToken', newAccessToken, { /* options */ });
        res.cookie('refreshToken', newRefreshToken, { /* options */ });
        
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: 'Недействительный refresh токен' 
        });
    }
};


const registerUser = async (req, res) => {
    try {
        const { username, nickname, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await db.addUserToDB({
            username,
            nickname,
            password: hashedPassword
        });
        
        const tokens = generateTokens(user);

        res.status(201).json({
            success: true,
            ...tokens,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role // Добавляем роль в ответ
            },
            message: 'Теперь вы зарегестрированы!'
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

        const { accessToken, refreshToken } = generateTokens(user);

        // const tokens = generateTokens(user);

        // res.json({
        //     success: true,
        //     ...tokens,
        //     user: {
        //         id: user.id,
        //         username: user.username,
        //         nickname: user.nickname,
        //         role: user.role // Добавляем роль в ответ
        //     },
        //     message: 'Вход выполнен успешно!'
        // });

        // Устанавливаем куки
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Для HTTP в разработке
            sameSite: "Lax", // Измените с "None" на "Lax" для локальной разработки
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
            maxAge: 15 * 60 * 1000 // 15 минут
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // Для HTTP в разработке
            sameSite: "Lax", // Измените с "None" на "Lax" для локальной разработки
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role
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


const logoutUser = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Должно совпадать с настройками при установке
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);
    
    res.json({ success: true, message: 'Вы вышли из аккаунта' });
};


const getCurrentUser = async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) throw new Error('Пользователь не найден');

        let levelInfo = null;
        if (user.level) {
            levelInfo = await db.getLevelById(user.level);
        }
        
        const userData = {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            credits: Number(user.credits),
            tickets: Number(user.tickets),
            subscriptions: Number(user.subscriptions),
            level: levelInfo ? {
                id: levelInfo.id,
                name: levelInfo.name,
                description: levelInfo.description
            } : null
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
    getCurrentUser,
    logoutUser,
    refreshToken,
    generateTokens
};