const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const { getIp } = require('./utils/network.js');


const app = express();
const PORT = 4000; // Порт, на котором будет работать сервер

console.log(typeof authController.loginUser ); // Должно вывести 'function'


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' }) }));

// Passport middleware
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Подключаем маршруты
app.use('/auth', authRoutes);

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
