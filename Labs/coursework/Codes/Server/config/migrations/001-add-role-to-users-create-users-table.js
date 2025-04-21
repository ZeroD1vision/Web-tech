const client = require('../db');

async function setupDatabase() {
    try {
        // Создание таблицы users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'admin' или 'user'
                last_login TIMESTAMP,
                is_active BOOLEAN NOT NULL DEFAULT TRUE
            );
        `);
        console.log('Таблица users успешно создана или уже существует.');

        // Выполнение миграции
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user',
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
        `);
        console.log('Миграция выполнена: добавлены колонки role, last_login и is_active');
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await client.end();
    }
}

setupDatabase();
