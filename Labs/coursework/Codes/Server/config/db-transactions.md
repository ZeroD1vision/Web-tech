# Документация по работе таблиц для транзакций
## Основные таблицы

### Создание таблиц
```sql
-- Кинотеатральные залы
CREATE TABLE halls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    seat_layout JSONB NOT NULL
);

-- Сеансы
CREATE TABLE screenings (
    id SERIAL PRIMARY KEY,
    movie_id INT REFERENCES movies(id),
    hall_id INT REFERENCES halls(id),
    start_time TIMESTAMP NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Места в зале
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    hall_id INT REFERENCES halls(id),
    row INT NOT NULL,
    number INT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('standard', 'vip', 'disabled'))
);

-- Билеты
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_id INT REFERENCES screenings(id),
    seat_id INT REFERENCES seats(id),
    user_id INT REFERENCES users(id),
    price DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT NOW()
);

-- Транзакции
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('purchase', 'refund')),
    created_at TIMESTAMP DEFAULT NOW()
); ```