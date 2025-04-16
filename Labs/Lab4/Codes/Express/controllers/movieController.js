const { getAllMovies, getMovieById } = require('../config/db');
const { isAdmin } = require('../middleware/adminMiddleware');

const getMovies = async (req, res) => {
    try {
        const movies = await getAllMovies(); // Получаем все фильмы из базы данных
        const movieData = {
            isAdmin,
            title: 'Список фильмов',
            movies, // Передаем массив фильмов в шаблон
        };
        res.render('movies/movieList', movieData); // Отправляем данные в шаблон
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера'); // Обработка ошибок сервера
    }
};

const editList = async (req, res) => {
    try {
        const movies = await getAllMovies(); // Функция для получения всех фильмов из базы данных
        res.render('movies/editList', { movies }); // Отправляем список фильмов в шаблон
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера'); // Обработка ошибок сервера
    }
};

const editData = async (req, res) => {
    const movieId = req.params.id; // Получаем ID фильма из параметров URL
    try {
        const movie = await getMovieById(movieId); // Получаем фильм по ID
        if (!movie) {
            return res.status(404).send('Фильм не найден'); // Обработка случая, когда фильм не найден
        }
        res.render('movies/editData', { movie }); // Отправляем данные о фильме в шаблон редактирования
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера'); // Обработка ошибок сервера
    }
};
    
// Экспортируем все функции контроллера в одном объекте
module.exports = {
    getMovies,
    editList,
    editData,
};