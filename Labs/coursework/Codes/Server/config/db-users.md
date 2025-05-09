### SQL-запрос для обновления баланса ###
Вот пример SQL-запроса, который добавляет 911887.78 к текущему балансу пользователя (например, atnarziev):

```sql
UPDATE users 
SET credits = credits + 911887.78 
WHERE username = 'atnarziev';
```

### Присвоение уровней пользователям ###
Например, если вы хотите установить уровень "VIP" для пользователя atnarziev, вы можете сделать это с помощью следующего запроса:

```sql
SQL-запрос для обновления уровня пользователя:
UPDATE users 
SET level = (SELECT id FROM user_levels WHERE name = 'VIP') 
WHERE username = 'atnarziev';
```

### Открыть все колонки таблицы ###
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'movies';
```