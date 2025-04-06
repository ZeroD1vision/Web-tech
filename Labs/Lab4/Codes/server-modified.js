// Импортируем необходимые модули
const http = require('http');// Модуль для создания HTTP сервера
const querystring = require('querystring');
const fs = require('fs');    // Модуль для работы с файловой системой
const path = require('path');// Модуль для работы с путями файловой системы
const ejs = require('ejs');
const os = require('os');
const morgan = require('morgan'); // Импортируем morgan
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Writable } = require('stream'); // Импортируем Writable для создания пользовательского потока
const { exec } = require('child_process');


const PORT = 2371; // Порт, на котором будет работать сервер
let users = []; // Хранилище пользователей
let sessions = {}; // Объект для хранения сессий


// Настройка Passport
passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(user => user.username === username);
    if(!user)
        return done(null, false, {message: 'Неверное имя пользователя.'});
    
    bcrypt.compare(password, user.password, (res, err) => {
        if(err) return done(err);
        if(res) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Неверный пароль.'});
        }
    });
}));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((username, done) => {
    const user = users.find(user => user.username === username);
    done (null, user);
});

// Функция для проверки аутентификации
function isAuthenticated(req) {
    return req.user !== undefined;
}

// Функция для парсинга cookies
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            cookies[name] = value;
        });
    }
    return cookies;
}

// Создаем поток для логирования
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// Натсройка морган для логирования в файл 
const morganMiddleware = morgan('combined', {stream: logStream});

// Функция для чтения и рендеринга шаблона
const renderTemplate = (templateName, data, response) => {
    const templatePath = path.join(__dirname, 'views', `${templateName}.ejs`);
    
    fs.readFile(templatePath, 'utf-8', (err, template) => {
        if (err) {
            console.error('Ошибка при чтении шаблона:', err);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Ошибка при загрузке шаблона');
            return;
        }

        const html = ejs.render(template, data);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    });
};


function getIp(callback){
    let command;
    const platform = os.platform();

    if(platform === 'darwin'){
        command = 'ipconfig getifaddr en0';
    }else if(platform === 'win32'){
        command = 'ipconfig | findstr /i "IPv4"';
    }else if(platform == 'linux'){
        command = 'hostname -I | awk \'{print \$1}\'';
    }else {
        console.error('Unknown platform: ' + platform);
        return;
    }

    exec(command, (error, stdout) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }

        // Используем регулярное выражение для извлечения IP-адреса
        let ipAddress;
        if (platform === 'win32') {
            // На Windows вывод может выглядеть примерно так: 
            // "IPv4 Address. . . . . : 172.17.5.61"
            const match = stdout.match(/(\d{1,3}\.){3}\d{1,3}/);
            ipAddress = match ? match[0] : null;
        } else {
            // Для других платформ просто берем вывод
            ipAddress = stdout.trim();
        }

        if (ipAddress) {
            console.log(`IP: ${ipAddress}`);
            callback(ipAddress);
        } else {
            console.error('Не удалось извлечь IP-адрес.');
        }
    });
}

// Создаем HTTP сервер
getIp((ipAddress) => {
    const server = http.createServer((req, res) => {
        console.log(req.url);

        morganMiddleware(req, res, () => {
            console.log(`Получен запрос: ${req.method} ${req.url}`);
            // Обработка сессий
            if (req.url === '/auth/login' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const { username, password } = querystring.parse(body);
                    passport.authenticate('local', (err, user, info) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            return res.end('Ошибка аутентификации');
                        }
                        if (!user) {
                            res.writeHead(401, { 'Content-Type': 'text/plain' });
                            return res.end('Неверное имя пользователя или пароль');
                        }
                        // Устанавливаем пользователя в сессии
                        req.logIn(user, (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                return res.end('Ошибка входа');
                            }
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            return res.end(`Добро пожаловать, ${req.user.username}!`);
                        });
                    })(req, res);
                });
                return;
            }

            // Обработка регистрации
            if (req.url === '/register' && req.method === 'POST') {
                console.log('Получен POST-запрос на регистрацию'); // Отладочное сообщение
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const { username, password } = querystring.parse(body);
                    // Проверка на существование пользователя
                    const existingUser  = users.find(u => u.username === username);
                    if (existingUser ) {
                        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                        return res.end('Пользователь с таким именем уже существует.');
                    }

                    // Хешируем пароль перед сохранением
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                            return res.end('Ошибка хеширования пароля');
                        }
                    
                        // Добавление нового пользователя
                        const newUser  = { username, password: hashedPassword };
                        users.push(newUser );

                        // Создание сессии
                        const sessionId = new Date().getTime(); // простой способ генерации ID сессии
                        sessions[sessionId] = newUser ;

                        // Установка cookie с идентификатором сессии
                        res.writeHead(302, {
                            Location: '/auth/profile',
                            'Set-Cookie': `sessionId=${sessionId}; HttpOnly`
                        });
                        res.end();
                    });
                });
                return;
            }
        
            // Защищенный маршрут для отображения профиля
            if (req.url === '/auth/profile') {
                const cookies = parseCookies(req.headers.cookie);
                const sessionId = cookies.sessionId;

                if (sessionId && sessions[sessionId]) {
                    const user = sessions[sessionId];
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`<h1>Добро пожаловать, ${user.username}!</h1>`);
                } else {
                    res.writeHead(302, { Location: '/register' });
                    res.end();
                }
                return;
            }
        
            // Обработка POST-запроса

            if (req.method === 'POST' && req.url === '/submit') {
                let data = '';

                req.on('data', chunk => {
                    data += chunk.toString();
                });

                req.on('end', () => {
                    try { 
                        // Парсим JSON из POST-данных
                        const querydata = querystring.parse(data);
                        const input = querydata.input; // Получаем значение поля input
                        console.log('Полученные данные: ', querydata);

                        // Записываем данные в файл
                        fs.appendFile('data.txt', `${input}\n`, (err) => { 
                            if (err) {
                                console.error('Ошибка при записи в файл:', err);
                                res.writeHead(500, {'Content-Type': 'text/plain'})
                                res.end('Ошибка сервера');
                                return;
                            } else {
                                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                                res.end('<h1>Данные успешно отправлены!</h1>');
                            }
                        });
                    } catch (error) {
                        console.error('Ошибка при парсинге JSON:', error);
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Некорректный JSON');
                    }
                });
                return;// Возвращаем, чтобы не продолжать обработку запроса
            }

            // Обработка GET-запросов для статических файлов

            let filePath = ''; // Путь к файлу
            // Определяем, какой файл нужно вернуть в зависимости от URL запроса
            switch (req.url) {
                // Главная страница
                case '/':
                    const homeData = {
                        title: 'Главная страница',
                        description: 'Добро пожаловать на наш сайт, где вы найдете информацию о веб-технологиях и наши услуги.'
                    };
                    renderTemplate('index', homeData, res); // Отображаем главную страницу
                    break;

                // Страница "Для первокурсников"
                case '/production1':
                    const production1Data = {
                        title: 'Продукция для первокурсников',
                        description: 'Мы предлагаем разнообразные товары для первокурсников.',
                        products: [
                            { name: 'Учебник по программированию', price: '500₽' },
                            { name: 'Блокнот для записей', price: '150₽' },
                            { name: 'Ручка', price: '50₽' }
                        ]
                    };
                    renderTemplate('production', production1Data, res); // Используем шаблон index.ejs с данными для страницы "О нас"
                    break;

                // Страница "Для второкурсников"
                case '/production2':
                    const production2Data = {
                        title: 'Продукция для второкурсников',
                        description: 'Мы предлагаем разнообразные товары для второкурсников.',
                        products: [
                            { name: 'Учебник по алгоритмам', price: '600₽' },
                            { name: 'Курс по веб-разработке', price: '2000₽' },
                            { name: 'Математика для программистов', price: '700₽' }
                        ]
                    };
                    renderTemplate('production', production2Data, res); // Используем шаблон index.ejs с данными для страницы "О нас"
                    break;

                // Страница ввода
                case '/input':
                    renderTemplate('input', {}, res); // Отображаем страницу ввода
                    break;

                // Страница таблицы
                case '/table':
                    renderTemplate('table', {}, res); // Отображаем страницу таблицы
                    break;

                // Страница с изображением
                case '/image':
                    renderTemplate('image', {}, res); // Отображаем страницу с изображением
                    break;
//
                case '/login':
                    renderTemplate('auth/auth', {
                        title: 'Вход',
                        action: '/login',
                        buttonText: 'Войти',
                        linkRegLogText: 'Нет аккаунта?',
                        linkHrefRegLog: '/register',
                        linkHrefRegLogLabel: 'Зарегистрироваться'
                    }, res); // Отображаем страницу входа с общим шаблоном
                    break;
                
                case '/register':
                    renderTemplate('auth/auth', {
                        title: 'Регистрация',
                        action: '/register',
                        buttonText: 'Зарегистрироваться',
                        linkRegLogText: 'Уже есть аккаунт?',
                        linkHrefRegLog: '/login',
                        linkHrefRegLogLabel: 'Войти'
                    }, res); // Отображаем страницу регистрации с общим шаблоном
                    break;

                case '/images/404-image.jpg':
                    // Изображение для 404 ошибки
                    filePath = path.join(__dirname, 'public', '/images/404-image.jpg');
                    break;
                case '/css/styles.css':
                case '/css/button.css':
                case '/css/droplist.css':
                case '/css/links.css':
                    filePath = path.join(__dirname, 'public', 'css', req.url.split('/')[2]);
                    break;

                default:
                    // Если запрашиваемая страница не найдена, возвращаем 404   ошибку
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8'});
                    res.end('<h1>404 - Страница не найдена</h1><a href="/   ">Вернуться на главную страницу</a>');
                    return;
                }
            

            // Читаем файл по указанному пути
            if (filePath != '') {
                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        // Если произошла ошибка при чтении файла, возвращаем 500   ошибку
                        console.error('Ошибка при чтении файла:', err);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('<h1>500 - Ошибка сервера</h1>');
                        return;
                    }
                
                    // Определяем тип содержимого в зависимости от расширения файла
                    const extname = path.extname(filePath);
                    let contentType = 'text/html'; // Значение по умолчанию
                
                    switch (extname) {
                        case '.css':
                            contentType = 'text/css';
                            break;
                        case '.jpg':
                        case '.jpeg':
                            contentType = 'image/jpg';
                            break;
                        case '.png':
                            contentType = 'image/png';
                            break;
                        case '.gif':
                            contentType = 'image/gif';
                            break;
                        default:
                            contentType = 'text/html';
                    }
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content); // Отправляем содержимое файла
                });
            }
        });
    });

    server.on('error', (err) => {
        console.error('Ошибка сервера:', err);
    });
    // Запуск сервера
    server.listen(PORT, ipAddress, () => {
        console.log(`Сервер запущен на http://${ipAddress}:${PORT}/`);
    });
});