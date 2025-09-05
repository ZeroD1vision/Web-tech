const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || '911onelove9111';
const SALT_ROUNDS = 10;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/'
  });

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '60m' }
      );
    
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await db.findUserById(decoded.id);

        if (!user) {
            console.log('No user with this token');
            return res.status(401).json({ success: false });
        }

        const { accessToken, refreshToken: newRefresh } = generateTokens(user);

        // Общие настройки для кук
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
        };

        // Обновляем куки
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', newRefresh, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });
        
        return res.json({ success: true });
    } catch (error) {
        console.log('Mistake in generating tokens');
        // Очищаем куки при ошибке
        res.clearCookie('accessToken', getCookieOptions());
        res.clearCookie('refreshToken', getCookieOptions());
        return res.status(401).json({ success: false });
    }
};


const registerUser = async (req, res) => {
    try {
        // Деструктурируем с значениями по умолчанию
        const { 
            username, 
            nickname = null, 
            password, 
            email = null 
        } = req.body;

        // Валидация обязательных полей
        if (!username || !password) {
            throw new Error('Username и password обязательны');
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Передаём только существующие значения
        const userData = {
            username,
            password: hashedPassword,
            ...(nickname && { nickname }), // Добавляем только если есть
            ...(email && { email })       // Добавляем только если есть
        };

        const user = await db.addUserToDB(userData);
        
        const { accessToken, refreshToken } = generateTokens(user);

        // Устанавливаем куки
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                role: user.role
            },
            message: 'Теперь вы зарегистрированы!'
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

        // Устанавливаем куки
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Для HTTP в разработке
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // "None" на "Lax" для локальной разработки
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
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
    const cookieOptions = getCookieOptions();
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ 
        success: true, 
        message: 'Вы вышли из аккаунта', 
        clearStorage: true 
    });
};


const getCurrentUser = async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) throw new Error('Пользователь не найден');

        let levelInfo = null;
        if (typeof user.level !== 'undefined' && user.level !== null) {
            levelInfo = await db.getLevelById(user.level);
        }
        
        const userData = {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
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