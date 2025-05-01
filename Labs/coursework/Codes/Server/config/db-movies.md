# Документация по работе с таблицей movies

## Основные команды

1. **Добавление уникального индекса**

```sql
CREATE UNIQUE INDEX movies_position_unique 
ON movies (position) 
WHERE position > 0;
```


## Связи и отношения БД ##

**1. SQL-скрипт для создания таблиц:**

```sql
-- Создание таблицы фильмов
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_year INTEGER NOT NULL,
    description TEXT
);

-- Создание таблицы жанров
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Связующая таблица фильм-жанр
CREATE TABLE movie_genres (
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- Таблица рейтингов
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    rating DECIMAL(3,1) NOT NULL CHECK (rating BETWEEN 0 AND 10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Оптимизационные индексы
CREATE INDEX idx_movies_title ON movies (title text_pattern_ops);
CREATE INDEX idx_movies_year ON movies (release_year);
CREATE INDEX idx_movie_genres ON movie_genres (genre_id);
CREATE INDEX idx_ratings_movie ON ratings (movie_id);
```

**2. Пример заполнения тестовыми данными:**

```sql
-- Добавляем основные жанры
INSERT INTO genres (name) VALUES
('Драма'),
('Комедия'),
('Фантастика'),
('Боевик'),
('Триллер'),
('Мелодрама');

-- Добавляем фильмы
INSERT INTO movies (title, release_year, description) VALUES
('Крепкий орешек', 1988, 'Полицейский против террористов в небоскребе'),
('Интерстеллар', 2014, 'Космическая эпопея о путешествии сквозь червоточину'),
('Матрица', 1999, 'Боевик о войне человечества с машинами');

-- Связываем фильмы с жанрами
INSERT INTO movie_genres (movie_id, genre_id) VALUES
(1, 4), (1, 5),  -- Крепкий орешек: Боевик, Триллер
(2, 1), (2, 3),  -- Интерстеллар: Драма, Фантастика
(3, 3), (3, 4);  -- Матрица: Фантастика, Боевик

-- Добавляем рейтинги
INSERT INTO ratings (movie_id, rating) VALUES
(1, 8.5), (1, 9.0), (1, 8.7),
(2, 9.5), (2, 9.0), (2, 9.2),
(3, 8.8), (3, 8.5), (3, 9.1);
```

**3. Настройки PostgreSQL для оптимизации:**

```sql
-- Настройка рабочей памяти для сортировок
SET work_mem = '64MB';

-- Оптимизация для LIKE-запросов
SET pg_trgm.similarity_threshold = 0.3;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Оптимизация для полнотекстового поиска (дополнительно)
ALTER TABLE movies ADD COLUMN search_vector tsvector;
UPDATE movies SET search_vector = to_tsvector('english', title || ' ' || description);
CREATE INDEX idx_movies_search ON movies USING GIN(search_vector);
```

**4. Требования к окружению:**
- PostgreSQL 12+
- Работающее расширение pg_trgm
- Права на чтение/запись для пользователя БД
- Локаль БД: UTF-8

**5. Проверка работоспособности:**

Пример запроса для проверки поиска:
```sql
SELECT 
  m.title,
  m.release_year,
  AVG(r.rating) as avg_rating,
  STRING_AGG(g.name, ', ') AS genres
FROM movies m
LEFT JOIN ratings r ON m.id = r.movie_id
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
WHERE m.title ILIKE '%матриц%'
  AND g.name = 'Фантастика'
  AND m.release_year BETWEEN 1990 AND 2000
GROUP BY m.id
ORDER BY m.title;
```

Данная структура обеспечит:
- Быстрый поиск по названию фильма
- Эффективную фильтрацию по жанрам и годам
- Корректный расчет рейтингов
- Оптимальную работу автодополнения
- Масштабируемость на большие объемы данных