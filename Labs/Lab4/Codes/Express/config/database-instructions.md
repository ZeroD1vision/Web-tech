```markdown
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