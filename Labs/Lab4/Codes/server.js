const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
    let filePath = ''; // Для хранения пути к файлу

    switch (req.url) {
        case '/':
            filePath = path.join(__dirname, 'public', 'index.html');
            break;
        case '/input':
            filePath = path.join(__dirname, 'public', 'input.html');
            break;
        case '/table':
            filePath = path.join(__dirname, 'public', 'table.html');
            break;
        case '/image':
            filePath = path.join(__dirname, 'public', 'image.html');
            break;
        case '/404-image.jpg':
            filePath = path.join(__dirname, 'public', '404-image.jpg');
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Страница не найдена</h1><a href="/">Вернуться на главную страницу</a>');
            return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 - Ошибка сервера</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
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