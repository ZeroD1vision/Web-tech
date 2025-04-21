const { Client } = require('pg');
require('dotenv').config();

// Подключаемся к серверу PostgreSQL
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

client.connect()
    .then(() => console.log('Подключение к серверу PostgreSQL успешно!'))
    .then(() => {
        // Создание новой базы данных
        return client.query('CREATE DATABASE CelestonDB');
    })
    .then(() => {
        console.log('База данных успешно создана!');
    })
    .catch(err => {
        console.error('Ошибка:', err.stack);
    })
    .finally(() => {
        client.end(); // Закрытие подключения
    });
