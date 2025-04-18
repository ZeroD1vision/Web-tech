const { getAllMovies, getMovieById, updateMovie, deleteMovieById } = require('../config/db');
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

const getMovieInfo = async (req, res) => {
    const movieId = req.params.id; // Получаем ID фильма из параметров URL
    try {
        const movie = await getMovieById(movieId); // Получаем фильм по ID
        if (!movie) {
            return res.status(404).send('Фильм не найден'); // Обработка случая, когда фильм не найден
        }
        res.render('movies/movieData', { movie }); // Отправляем данные о фильме в шаблон
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
    // Преобразуем ID из параметров URL в целое число
    const movieId = parseInt(req.params.id, 10);
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

const updateData = async (req, res) => {
    const movieId = parseInt(req.params.id, 10); // Преобразование id в число
    if (isNaN(movieId)) {
        return res.status(400).send('Неверный идентификатор фильма');
    }
    const updatedData = {
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
    };

    try {
        const updatedMovie = await updateMovie(movieId, updatedData);
        if (updatedMovie) {
            res.redirect(`/movies/${movieId}`); // Перенаправление на страницу фильма после успешного обновления
        } else {
            res.status(404).send('Фильм не найден');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка обновления фильма');
    }
}

const deleteData = async (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    console.log(movieId);
    try {
        const deletedMovie = deleteMovieById(movieId);
        console.log('1');
        if (deletedMovie) {
            res.status(200).send({m: 'Удаление успешно'});
        }
        res.status(404).send();
    }
    catch (error) {
        res.status(500).send();
        console.log('Ошибка удаления');
    }
}

    
// Экспортируем все функции контроллера в одном объекте
module.exports = {
    getMovies,
    editList,
    editData,
    updateData,
    getMovieInfo,
    deleteData,
};