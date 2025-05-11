Вот полная спецификация REST API для нашего киносервиса:

```javascript
// controllers/movieController.js
const Movie = require('../models/Movie');
const { validationResult } = require('express-validator');

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().select('-__v');
        res.json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).select('-__v');
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                error: 'Movie not found' 
            });
        }
        res.json({ success: true, data: movie });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createMovie = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const movie = new Movie(req.body);
        await movie.save();
        res.status(201).json({ 
            success: true, 
            data: movie 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                error: 'Movie not found' 
            });
        }

        res.json({ success: true, data: movie });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        
        if (!movie) {
            return res.status(404).json({ 
                success: false, 
                error: 'Movie not found' 
            });
        }

        res.status(204).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
```

```javascript
// routes/movies.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { check } = require('express-validator');

// Валидация
const movieValidation = [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description must be at least 50 characters')
        .isLength({ min: 50 }),
    check('trailerId', 'Valid trailer ID required').optional().isString()
];

// @route   GET /api/movies
// @desc    Get all movies
// @access  Public
router.get('/', movieController.getAllMovies);

// @route   GET /api/movies/:id
// @desc    Get movie by ID
// @access  Public
router.get('/:id', movieController.getMovieById);

// @route   POST /api/movies
// @desc    Create new movie
// @access  Private/Admin
router.post(
    '/',
    [authMiddleware, isAdmin, movieValidation],
    movieController.createMovie
);

// @route   PUT /api/movies/:id
// @desc    Update movie
// @access  Private/Admin
router.put(
    '/:id',
    [authMiddleware, isAdmin, movieValidation],
    movieController.updateMovie
);

// @route   DELETE /api/movies/:id
// @desc    Delete movie
// @access  Private/Admin
router.delete(
    '/:id',
    [authMiddleware, isAdmin],
    movieController.deleteMovie
);

module.exports = router;
```

### Спецификация API:

#### Movies
| Метод | Путь           | Описание                | Доступ    | Тело запроса (пример)                          |
|-------|----------------|-------------------------|-----------|------------------------------------------------|
| GET   | /api/movies    | Получить все фильмы     | Public    | -                                              |
| GET   | /api/movies/:id| Получить фильм по ID    | Public    | -                                              |
| POST  | /api/movies    | Создать новый фильм     | Admin     | { "title": "...", "description": "...", ... } |
| PUT   | /api/movies/:id| Обновить фильм          | Admin     | { "title": "New title", ... }                 |
| DELETE| /api/movies/:id| Удалить фильм           | Admin     | -                                              |

#### Users & Auth
| Метод | Путь               | Описание                    | Доступ    | Тело запроса (пример)                          |
|-------|--------------------|-----------------------------|-----------|------------------------------------------------|
| POST  | /api/auth/register | Регистрация пользователя    | Public    | { "username": "...", "password": "...", ... } |
| POST  | /api/auth/login    | Авторизация                 | Public    | { "username": "...", "password": "..." }      |
| GET   | /api/users/me      | Получить текущего пользователя | Private | -                                              |

### Примеры запросов:

1. **Создание фильма (Admin)**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новый фильм",
    "description": "Описание нового фильма...",
    "trailerId": "abc123",
    "genre": "драма"
  }' \
  http://localhost:3000/api/movies
```

2. **Обновление фильма (Admin)**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Обновлённое название"}' \
  http://localhost:3000/api/movies/5f8d0d55b54764421b7156da
```

3. **Получение текущего пользователя**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/users/me
```

### Особенности реализации:
1. **Валидация**:
- Для фильмов: проверка обязательных полей и длины описания
- Для пользователей: проверка уникальности username/email

2. **Безопасность**:
- JWT аутентификация через заголовок Authorization
- Ролевая модель доступа (пользователь/админ)
- Хеширование паролей (bcrypt)

3. **Обработка ошибок**:
- 400 - Неверный запрос
- 401 - Не авторизован
- 403 - Доступ запрещён
- 404 - Ресурс не найден
- 500 - Ошибка сервера

4. **Пагинация** (опционально):
```javascript
// В контроллер getAllMovies
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const movies = await Movie.find()
  .skip(skip)
  .limit(limit);
```

Для полной интеграции добавим пару маршрутов в сервер:
```bash
npm install express-validator mongoose
```