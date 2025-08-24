const express = require('express');
const path = require('path');
const fs = require('fs');
const LocalStrategy = require('passport-local').Strategy;
const NodeCache = require('node-cache');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const { getIp } = require('./utils/network.js');
const movieRoutes = require('./routes/movieRoutes');
const db = require('./config/db');
const bodyParserMiddleware = require('./middleware/bodyParserMiddleware');
const cookieMiddleware = require('./middleware/cookieMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const passportMiddleware = require('./middleware/passportMiddleware');
const cacheMiddleware = require('./middleware/cacheMiddleware');

const app = express();
const PORT = 4000;

// Middleware для отключения кэширования для определенного маршрута
app.use('/movies', (req, res, next) => {
    res.set('Cache-Control', 'no-store'); // Отключить кэширование
    next();
});

app.use(cors());

// Подключаем middleware
app.use(bodyParserMiddleware);
app.use(cookieMiddleware);
app.use(loggerMiddleware);
app.use(sessionMiddleware);
app.use(passportMiddleware);
app.use(cacheMiddleware);

// Сериализация и десериализация пользователя
passport.serializeUser ((user, done) => {
    console.log('Полученный пользователь:', user); // Логируем полученного пользователя

    if (user && user.id) {
        console.log('Сериализация пользователя:', user);
    done(null, user.id); // Сохраняем идентификатор пользователя в сессии
    } else {
        done(new Error('Пользователь не имеет идентификатора'));
    }
});

passport.deserializeUser (async (id, done) => {
    console.log('Попытка десериализации пользователя:', id);
    try {
        const user = await db.findUserById(id);
        if (user) {
            console.log('Пользователь найден');
            done(null, user); // Если пользователь найден, передаем его
        } else {
            done(new Error('Пользователь не найден')); // Если не найден, передаем ошибку
        }
    } catch (error) {
        console.error('Ошибка при десериализации:', error);
        done(error); // Обрабатываем ошибку
    }
});

// Регистрация стратегии "local"
passport.use(new LocalStrategy(
    async (username, password, done) => {
        console.log('Вход пользователя (main): ', { username, password }); // Вывод имени пользователя и пароля
        try {
            // Получаем пользователя из базы данных
            const user = await db.findUserByUsernameInDB(username);
            console.log('Полученный пользователь:', user); // Логируем полученного пользователя
            if (!user) {
                console.log('Неверное имя пользователя: ', { username });
                return done(null, false, { message: 'Неверное имя пользователя.' });
            }

            // Сравнение паролей (проверка)
            console.log('Сравнение паролей:', { введённый: password, хэшированный: user.password });

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Результат сравнения паролей:', isMatch);

            if (!isMatch) {
                console.log('Неверный пароль');
                return done(null, false, { message: 'Неверный пароль.' });
            }

            console.log('Пароли совпадают!'); // Логируем успешное совпадение

            // Можно выполнить дополнительные действия здесь, если пароли совпадают

            return done(null, user); // Аутентификация успешна
        } catch (err) {
            console.error('Ошибка при аутентификации:', err);
            return done(err);
        }
    }
));
        /* Если храним пароли не хэшированными
        if (user.password !== password) { // Пароли хранятся в открытом виде
            console.log('Неверный пароль');
            return done(null, false, { message: 'Неверный пароль.' });
        }
        return done(null, user); // Успешная аутентификация
    }
));*/


// Подключаем маршруты
app.use('/', movieRoutes); // Для списка фильмов
app.use('/profile', authRoutes); // Для страницы профиля

// Главная страница
app.get('/', (req, res) => {
    const homeData = {
        title: 'Главная страница',
        description: 'Добро пожаловать на наш сайт, где вы найдете информацию о веб-технологиях и наши услуги.'
    };
    res.render('index', homeData);
});

// Страница "Для первокурсников"
app.get('/production1', (req, res) => {
    const production1Data = {
        title: 'Продукция для первокурсников',
        description: 'Мы предлагаем разнообразные товары для первокурсников.',
        products: [
            { name: 'Учебник по программированию', price: '500₽' },
            { name: 'Блокнот для записей', price: '150₽' },
            { name: 'Ручка', price: '50₽' }
        ]
    };
    res.render('production', production1Data);
});

// Страница "Для второкурсников"
app.get('/production2', (req, res) => {
    const production2Data = {
        title: 'Продукция для второкурсников',
        description: 'Мы предлагаем разнообразные товары для второкурсников.',
        products: [
            { name: 'Учебник по алгоритмам', price: '600₽' },
            { name: 'Курс по веб-разработке', price: '2000₽' },
            { name: 'Математика для программистов', price: '700₽' }
        ]
    };
    res.render('production', production2Data);
});

// Страница ввода
app.get('/input', (req, res) => {
    res.render('input');
});

// Страница таблицы
app.get('/table', (req, res) => {
    res.render('table');
});

// Страница с изображением
app.get('/image', (req, res) => {
    res.render('image');
});

// Страница входа
app.get('/profile/login', (req, res) => {
    res.render('auth/auth', {
        title: 'Вход',
        formType: 'login-form',
        action: '/profile/login',
        buttonText: 'Войти',
        successMessage: 'Вы успешно вошли в профиль!',
        linkRegLogText: 'Нет аккаунта?',
        linkHrefRegLog: '/profile/register',
        linkHrefRegLogLabel: 'Зарегистрироваться'
    });
});

// Страница регистрации
app.get('/profile/register', (req, res) => {
    res.render('auth/auth', {
        title: 'Регистрация',
        action: '/profile/register',
        formType: 'register-form',
        buttonText: 'Зарегистрироваться',
        successMessage: 'Вы успешно зарегистрировались!',
        linkRegLogText: 'Уже есть аккаунт?',
        linkHrefRegLog: '/profile/login',
        linkHrefRegLogLabel: 'Войти'
    });
});

app.get('/profile/edit', (req, res) => {
    res.render('auth/edit');
});
// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Шаблонизатор
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Запуск сервера
getIp((ip) => {
    app.listen(PORT, ip, () => {
        console.log(`Сервер запущен на http://${ip}:${PORT}/`);
    });
});
