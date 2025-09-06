Мы будем использовать колонку `level` в таблице `users`, чтобы хранить идентификатор уровня пользователя.

### 1. Создание таблицы уровней

Создание таблицы:

```sql
CREATE TABLE user_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);
```

### 2. Вставка уровней

Создать уровни пользователей с их описаниями:

```sql
INSERT INTO user_levels (level_name, description) VALUES
('VIP', 'Для самых преданных зрителей! 🌟'),
('Киномагнат', 'Для тех, кто инвестирует в свои увлечения! 💰'),
('Кинознаток', 'За активное участие и множество покупок! 🎟️'),
('Киноэнтузиаст', 'Для тех, кто любит посещать показы и концерты! 🎉'),
('Кинолюбитель', 'За первую покупку билета или подписки! 🍿');
```

### 3. Добавление колонки `level` в таблицу пользователей

Если уже есть таблица `users`, добавим колонку `level`:

```sql
ALTER TABLE users ADD COLUMN level INT;
```

### 4. Функции для взаимодействия с уровнями

Теперь создадим несколько функций для взаимодействия с уровнями пользователей.

#### 4.1. Получение уровня пользователя

Эта функция возвращает уровень пользователя по его ID:

```sql
CREATE FUNCTION get_user_level(user_id INT)
RETURNS VARCHAR(255)
BEGIN
    DECLARE userLevel VARCHAR(255);
    SELECT CONCAT(level_name, ': ', description) INTO userLevel
    FROM user_levels
    WHERE id = (SELECT level FROM users WHERE id = user_id);
    RETURN userLevel;
END;
```

#### 4.2. Установка уровня пользователя

Эта функция устанавливает уровень для конкретного пользователя:

```sql
CREATE PROCEDURE set_user_level(user_id INT, level_name VARCHAR(50))
BEGIN
    DECLARE levelId INT;
    
    SELECT id INTO levelId
    FROM user_levels
    WHERE level_name = level_name;
    
    IF levelId IS NOT NULL THEN
        UPDATE users SET level = levelId WHERE id = user_id;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Уровень не найден';
    END IF;
END;
```

#### 4.3. Получение всех пользователей с их уровнями

Эта функция возвращает всех пользователей с их уровнями:

```sql
CREATE OR REPLACE FUNCTION get_all_users_with_levels()
RETURNS TABLE (user_id INT, username VARCHAR(255), level_name VARCHAR(50), description TEXT) AS $$
BEGIN
    RETURN QUERY (
        SELECT u.id, u.username, ul.level_name, ul.description
        FROM users u
        LEFT JOIN user_levels ul ON u.level = ul.id
    );
END;
$$ LANGUAGE plpgsql;


SELECT * FROM get_all_users_with_levels();
```

### 5. Примеры использования функций

Теперь мы можем использовать эти функции для управления уровнями пользователей.

- **Получить уровень пользователя с ID 1**:

```sql
SELECT get_user_level(1);
```

- **Установить уровень "Киномагнат" для пользователя с ID 2**:

```sql
CALL set_user_level(2, 'Киномагнат');
```

- **Получить всех пользователей с их уровнями**:

```sql
SELECT * FROM get_all_users_with_levels();
```