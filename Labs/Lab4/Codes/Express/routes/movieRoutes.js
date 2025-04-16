const express = require('express');
const movieController = require('../controllers/movieController');
const { isAdmin } = require('../middleware/adminMiddleware');
const router = express.Router();

// Маршрут для страницы списка фильмов
router.get('/movies', isAdmin, movieController.getMovies);

// Страница информации о фильме
//router.get('/films/:id', movieController.getMovieById);

// Страница редактирования листа
router.get('/movies/edit', isAdmin, movieController.editList);

// Страница редактирования фильма
router.get('/movies/:id/edit', isAdmin, movieController.editData);

module.exports = router;