const express = require('express');
const movieController = require('../controllers/movieController');
const { isAdmin } = require('../middleware/adminMiddleware');
const router = express.Router();

// Маршрут для страницы списка фильмов
router.get('/movies', isAdmin, movieController.getMovies);

// Страница редактирования листа
router.get('/movies/edit', isAdmin, movieController.editList);

// Страница информации о фильме
router.get('/movies/:id',  isAdmin, movieController.getMovieInfo);

// Страница редактирования фильма
router.get('/movies/:id/edit', isAdmin, movieController.editData);

// Обработчик для сохранения изменений фильма
router.post('/movies/:id/edit', movieController.updateData);

// Обработчик для удаления фильма
router.delete('/movies/:id', movieController.deleteData);

module.exports = router;