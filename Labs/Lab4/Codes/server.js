// Импортируем необходимые модули
const http = require('http');// Модуль для создания HTTP сервера
const querystring = require('querystring');
const fs = require('fs');    // Модуль для работы с файловой системой
const path = require('path');// Модуль для работы с путями файловой системы
const os = require('os');

const { exec } = require('child_process');

const PORT = 2371; // Порт, на котором будет работать сервер


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
        
        // Обработка POST-запроса

        if(req.method === 'POST' && req.url === '/submit') {
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
            case '/images/404-image.jpg':
                // Изображение для 404 ошибки
                filePath = path.join(__dirname, 'public', '/images/404-image.jpg');
                break;
            case '/css/styles.css':
            case '/css/button.css':
            case '/css/styles.css':
            case '/css/links.css':
            case '/css/droplist.css':
                filePath = path.join(__dirname, 'public', 'css', req.url.split('/')[2]);
                break;
            default:
                // Если запрашиваемая страница не найдена, возвращаем 404 ошибку
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8'});
                res.end('<h1>404 - Страница не найдена</h1><a href="/   ">Вернуться на главную страницу</a>');
                return;
            }
        

        // Читаем файл по указанному пути
        fs.readFile(filePath, (err, content) => {
            if (err) {
                // Если произошла ошибка при чтении файла, возвращаем 500   ошибку
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
    });

    server.on('error', (err) => {
        console.error('Ошибка сервера:', err);
    });

    // Запуск сервера
    server.listen(PORT, ipAddress, () => {
        console.log(`Сервер запущен на http://${ipAddress}:${PORT}/`);
    });
});