const client = require('../db');

async function setupDatabase() {
    try {
        // Создание таблицы movies
        await client.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image VARCHAR(255),
                trailerId VARCHAR(255),
                userId INT,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            );
        `);
        
        console.log('Таблица movies успешно создана или уже существует.');
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await client.end();
    }
}

setupDatabase();
