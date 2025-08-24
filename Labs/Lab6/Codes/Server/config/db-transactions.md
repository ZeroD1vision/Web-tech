# Документация по работе таблиц для транзакций
## Основные таблицы

### 1. Создание таблиц
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
); 
```

### 2. Работа с API
```javascript
// Получение сеансов для фильма
app.get('/api/movies/:id/screenings', async (req, res) => {
    try {
        const screenings = await db.getMovieScreenings(req.params.id);
        res.json({ success: true, data: screenings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Получение информации о зале и местах
app.get('/api/screenings/:id/seats', async (req, res) => {
    try {
        const { seats, hall } = await db.getScreeningSeats(req.params.id);
        res.json({ success: true, seats, hall });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Покупка билетов
app.post('/api/tickets/purchase', authMiddleware, async (req, res) => {
    try {
        const { screeningId, seats, total } = req.body;
        
        const result = await db.purchaseTickets({
            userId: req.user.id,
            screeningId,
            seats,
            total
        });
        
        res.json({ success: true, tickets: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
```