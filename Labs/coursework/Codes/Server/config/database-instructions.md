# Документация по работе с PostgreSQL

## Установка и подключение к PostgreSQL

1. Установите PostgreSQL на вашу систему.
2. Подключитесь к серверу PostgreSQL:
   ```bash
   psql -U <username> -d <database_name>
   ```

## Основные команды PostgreSQL

- **Для русских символов**
  ```sql
  chcp 1251
  ```

### Управление ролями

- **Вход как суперпользователь**:
  ```sql
  psql -U postgres
  ```


- **Просмотр ролей**:
  ```sql
  \du
  ```

- **Создание новой роли**:
  ```sql
  CREATE ROLE <role_name> WITH LOGIN PASSWORD '<password>';
  ```

- **Изменение роли, чтобы предоставить право на создание баз данных**:
  ```sql
  ALTER ROLE <role_name> WITH CREATEDB;
  ```

- **Проверка прав роли**:
  ```sql
  SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = '<role_name>';
  ```

### Управление базами данных

- **Создание базы данных**:
  ```sql
  CREATE DATABASE <database_name>;
  ```

- **Удаление базы данных**:
  ```sql
  DROP DATABASE <database_name>;
  ```

- **Подключение к базе данных**:
  ```sql
  \c <database_name>
  ```

- **Просмотр всех баз данных**:
  ```sql
  \l
  ```

### Основные команды SQL

- **Создание таблицы**:
  ```sql
  CREATE TABLE <table_name> (
      id SERIAL PRIMARY KEY,
      column_name DATA_TYPE
  );
  ```

- **Вставка данных**:
  ```sql
  INSERT INTO <table_name> (column_name) VALUES ('value');
  ```

- **Запрос данных**:
  ```sql
  SELECT * FROM <table_name>;
  ```
- **Запрос столбцов**:
  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'users';
    ```

## Таблицы
  `ALTER TABLE` и `CREATE TABLE` — это команды SQL, используемые для управления таблицами в реляционных базах данных. Давайте подробнее рассмотрим каждую из них.

### CREATE TABLE

Команда `CREATE TABLE` используется для создания новой таблицы в базе данных. При создании таблицы вы определяете ее имя и структуру, включая названия и типы данных для каждого столбца.

**Пример использования `CREATE TABLE`:**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

В этом примере создается таблица `users` с четырьмя столбцами:
- `id`: уникальный идентификатор пользователя, который автоматически увеличивается.
- `name`: имя пользователя, не может быть пустым.
- `email`: адрес электронной почты пользователя, который должен быть уникальным и не может быть пустым.
- `created_at`: время создания записи, по умолчанию устанавливается на текущее время.

### ALTER TABLE

Команда `ALTER TABLE` используется для изменения существующей таблицы. С ее помощью можно добавлять, изменять или удалять столбцы, а также изменять другие свойства таблицы.

**Примеры использования `ALTER TABLE`:**

1. **Добавление нового столбца:**

```sql
ALTER TABLE users
ADD COLUMN age INT;
```

Этот запрос добавляет новый столбец `age` для хранения возраста пользователей.

2. **Изменение типа данных столбца:**

```sql
ALTER TABLE users
MODIFY COLUMN age VARCHAR(3);
```

Этот запрос изменяет тип данных столбца `age` на строковый.

3. **Удаление столбца:**

```sql
ALTER TABLE users
DROP COLUMN age;
```

Этот запрос удаляет столбец `age` из таблицы `users`.

4. **Добавление ограничения:**

```sql
ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);
```

5. **Открыть все колонки таблицы**

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'movies';
```

6. **Колонки таблицы в каком-либо порядке**

```sql
SELECT id, title, position FROM movies ORDER BY position;
```

### UPDATE
 Чтобы изменить статус пользователя на администратор. Например, если у вас есть столбец is_admin, который принимает значения TRUE или FALSE, и вы хотите сделать пользователя с id = 1 администратором:
```sql
UPDATE users
SET is_admin = TRUE
WHERE id = 1;
```
Если вместо этого у вас есть столбец, который хранит роль в виде строки, например, role, вы можете сделать так:
```sql
UPDATE users
SET role = 'admin'
WHERE username = 'имя_пользователя';
```
Этот запрос добавляет ограничение уникальности для столбца `email`, если оно еще не было добавлено.

## Возможные проблемы и их решения

1. **Изменения прав не отображаются**:
   - Попробуйте отключиться и снова подключиться к PostgreSQL.
   - Используйте запрос для проверки прав:
     ```sql
     SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = '<role_name>';
     ```

2. **Ошибка при создании базы данных**:
   - Убедитесь, что у пользователя есть право `CREATEDB`.
   - Проверьте, не ограничены ли права пользователя другой ролью.

3. **Отсутствие доступа к определенным командам**:
   - Проверьте права роли с помощью команды `\du`.
   - Используйте `ALTER ROLE` для изменения прав.

4. **Ошибки подключения**:
   - Убедитесь, что PostgreSQL запущен.
   - Проверьте правильность имени пользователя и пароля.

## Заключение

Эта документация содержит основные команды и решения проблем, с которыми мы можем столкнуться при работе с PostgreSQL.
```