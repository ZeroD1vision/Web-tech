const express = require('express');
const path = require('path');
const fs = require('fs');
const LocalStrategy = require('passport-local').Strategy;
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const { getIp } = require('./utils/network.js');
const users = require('./models/userModel');

const app = express();
const PORT = 4000; // Порт, на котором будет работать сервер'

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' }) }));

// Passport middleware
app.use(session({ 
    secret: 'your_secret_key', 
    resave: false, 
    saveUninitialized: true 
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Сериализация и десериализация пользователя
passport.serializeUser ((user, done) => {
    done(null, user.username); // Сохраняем только имя пользователя в сессии
});

passport.deserializeUser ((username, done) => {
    console.log('Попытка десериализации пользователя:', username);
    const user = users.find(u => u.username === username);
    if (user) {
        console.log('Пользователь найден');
        done(null, user); // Если пользователь найден, передаем его
    } else {
        done(new Error('Пользователь не найден')); // Если не найден, передаем ошибку
    }
});

// Регистрация стратегии "local"
passport.use(new LocalStrategy(
    async (username, password, done) => {
        console.log('Вход пользователя (main): ', { username, password }); // Вывод имени пользователя и пароля
        // Проверка существования пользователя в массиве
        const user = users.find(u => u.username === username);
        if (!user) {
            console.log('Неверное имя пользователя: ', { username });
            return done(null, false, { message: 'Неверное имя пользователя.' });
        }
        // Сравнение паролей(проверка)
        // Сравнение паролей (проверка)
        console.log('Сравнение паролей:', { введённый: password, хэшированный: user.password });

        try {
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
            console.error('Ошибка при сравнении паролей:', err);
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
app.use('/', authRoutes);

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
app.get('/login', (req, res) => {
    res.render('auth/auth', {
        title: 'Вход',
        action: '/login',
        buttonText: 'Войти',
        linkRegLogText: 'Нет аккаунта?',
        linkHrefRegLog: '/register',
        linkHrefRegLogLabel: 'Зарегистрироваться'
    });
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.render('auth/auth', {
        title: 'Регистрация',
        action: '/register',
        buttonText: 'Зарегистрироваться',
        linkRegLogText: 'Уже есть аккаунт?',
        linkHrefRegLog: '/login',
        linkHrefRegLogLabel: 'Войти'
    });
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
