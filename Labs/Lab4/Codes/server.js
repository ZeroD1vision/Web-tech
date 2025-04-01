// Импортируем необходимые модули
const http = require('http');// Модуль для создания HTTP сервера
const fs = require('fs');    // Модуль для работы с файловой системой
const path = require('path');// Модуль для работы с путями файловой системы

const PORT = 8080; // Порт, на котором будет работать сервер

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    let filePath = ''; // Путь к файлу

    // Определяем, какой файл нужно вернуть в зависимости от URL запроса
    switch (req.url) {
        // Главная страница
        case '/':
            filePath = path.join(__dirname, 'public', 'index.html');
            break;
        // Страница ввода
        case '/input':
            filePath = path.join(__dirname, 'public', 'input.html');
            break;
        // Страница таблицы
        case '/table':
            filePath = path.join(__dirname, 'public', 'table.html');
            break;
        // Страница с изображением
        case '/image':
            filePath = path.join(__dirname, 'public', 'image.html');
            break;
        case '/404-image.jpg':
            // Изображение для 404 ошибки
            filePath = path.join(__dirname, 'public', '404-image.jpg');
            break;
        default:
            // Если запрашиваемая страница не найдена, возвращаем 404 ошибку
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Страница не найдена</h1><a href="/">Вернуться на главную страницу</a>');
            return;
    }

    // Читаем файл по указанному пути
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // Если произошла ошибка при чтении файла, возвращаем 500 ошибку
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 - Ошибка сервера</h1>');
            return;
        }
        // Если файл успешно прочитан, возвращаем его содержимое с кодом 200
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content); // Отправляем содержимое файла
    });
});

// Обработчик ошибок
server.on('error', (err) => {
    console.error('Ошибка сервера:', err);
});

// Запуск сервера
server.listen(PORT, '172.17.254.41', () => {
    console.log(`Сервер запущен на http://172.17.254.41:${PORT}/`);
});