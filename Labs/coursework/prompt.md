import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Убираем перехватчик для добавления токена в заголовки

// instance.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

instance.interceptors.response.use(
  response => response,
  async error => {
    // Пропускаем обработку ошибок для страницы логина
    if (window.location.pathname === '/login') {
      return Promise.reject(error);
    }

    // Обработка просроченного access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Отправляем запрос на обновление токенов
        await instance.post(
          '/auth/refresh', 
          {}, 
          { withCredentials: true }
        );
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/api/auth/refresh', { refreshToken });
        
        // localStorage.setItem('accessToken', response.data.accessToken);
        // localStorage.setItem('refreshToken', response.data.refreshToken);

        // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        // Повторяем исходный запрос с новым токеном
        return instance(originalRequest);
      } catch (refreshError) {
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // Перенаправляем на логин при ошибке обновления
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=1';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
---
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MovieFilters from './MovieFilters';
import { useNotification } from '../../context/NotificationContext';
import { fetchMovies, deleteMovie, searchMovies } from '../../services/movieService';
import './MovieListPage.css';

const MovieListPage = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        search: '',
        genre: '',
        yearFrom: '',
        yearTo: ''
    });
    const [genres, setGenres] = useState([]);

    const isAdmin = user?.role === 'admin';

    // Загрузка жанров
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/genres');
                const data = await response.json();
                if (data.success) setGenres(data.genres);
            } catch (error) {
                showNotification('Ошибка загрузки жанров', 'error');
            }
        };
        loadGenres();
    }, []);

    // Обработчик изменения фильтров
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Сброс фильтров
    const resetFilters = () => {
        setFilters({
            search: '',
            genre: '',
            yearFrom: '',
            yearTo: ''
        });
    };

    // Загрузка фильмов с учетом фильтров
    const loadMovies = async () => {
        try {
            const moviesData = Object.values(filters).some(Boolean) 
                ? await searchMovies(filters)
                : await fetchMovies();
            
            const moviesWithImages = moviesData.map(movie => ({
                ...movie,
                image: movie.image 
                    ? `http://localhost:3000/${movie.image}`
                    : null
            }));
            
            setMovies(moviesWithImages);
        } catch (error) {
            showNotification(`Ошибка загрузки фильмов: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMovies();
    }, [filters]);

    const handleDelete = async (movieId) => {
        if(!window.confirm('Вы уверены, что хотите удалить этот фильм?')) return;

        try {
            await deleteMovie(movieId);
            await loadMovies(); // Перезагружаем список после удаления
            showNotification('Фильм успешно удалён', 'success');
        } catch (error) {
            showNotification('Ошибка при удалении фильма', 'error');
        }
    };

    const handleEdit = async (movieId) => {
        navigate(`/movies/${movieId}/edit`);
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="movie-list-container">
            <h1>Наши фильмы</h1>

            <MovieFilters
                genres={genres}
                filters={filters}
                onFilterChange={handleFilterChange}
                resetFilters={resetFilters}
            />

            {isAdmin && (
                <button 
                    className="add-movie-btn"
                    onClick={() => navigate('/movies/new')}
                >
                    Добавить новый фильм
                </button>
            )}
            
            <div className="movie-grid">
                {movies.map(movie => (
                    <div key={movie.id} className="movie-card">
                        <div 
                            className="movie-poster"
                            onClick={() => navigate(`/movies/${movie.id}`)}
                        >
                            {movie.image ? (
                                <img 
                                    src={`${movie.image}`} 
                                    alt={movie.title} 
                                    className="movie-poster"
                                    onError={(e) => {
                                        e.target.src = '/placeholder.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">Нет изображения</div>
                            )}
                        </div>
                        
                        <div className="movie-info">
                            <h3>{movie.title}</h3>
                            <p className="description">
                                {movie.description?.length > 150 
                                    ? `${movie.description.substring(0, 150)}...` 
                                    : movie.description}
                            </p>
                            
                            {movie.trailerid && (
                                <a 
                                    href={`https://rutube.ru/video/${movie.trailerid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="trailer-btn"
                                    onClick={e => e.stopPropagation()} // Кнопка внутри кнопки. Не должна нажиматься
                                >
                                    Трейлер
                                </a>
                            )}

                            {isAdmin && (
                                <div className='admin-actions-overlay'>
                                    <button 
                                        className='edit-btn'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(movie.id);
                                        }}
                                        title="Редактировать"
                                        disabled={!user}
                                    >
                                        <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M13.5 6.5L17.5 10.5M4 20H8L18.5 9.5C19.0304 8.96957 19.3284 8.25018 19.3284 7.5C19.3284 6.74982 19.0304 6.03043 18.5 5.5C17.9696 4.96957 17.2502 4.67157 16.5 4.67157C15.7498 4.67157 15.0304 4.96957 14.5 5.5L4 16V20Z"/>
                                        </svg>
                                    </button> 

                                    <button 
                                        className='delete-btn'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(movie.id);
                                        }}
                                        title="Удалить"
                                        disabled={!user}
                                    >
                                        <svg className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M3 6H5H21"/>
                                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                                        </svg>
                                    </button> 
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieListPage;
---
import React, { useEffect, useState } from 'react';
import { fetchMovies } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import './MovieList/MovieListPage.css';
const MamaPage = () => {
    const [ movies, setMovies ] = useState([]);
    const [ filteredMovies, setFilteredMovies ] = useState([]);

    useEffect(() => {
        const getMovies = async () => {
            try {
                const data = await fetchMovies();
                setMovies(data);
                setFilteredMovies(data);
            } catch (error) {
                console.error("Ошибка при загрузке фильмов:", error);
            }
        };
        getMovies();
    }, []);

    const handleSearch = (query) => {
        const filtered = movies.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredMovies(filtered);
    };


    return (
        <div className="mama-page">
            <h1>Добро пожаловать в Киноафишу Celeston Theatre!</h1>
            <SearchBar onSearch={handleSearch} />
            <div className="movies-container">
                {filteredMovies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};

export default MamaPage;
---
import React from 'react';
import './MovieFilters.css';

const MovieFilters = ({ 
    genres, 
    filters, 
    onFilterChange, 
    resetFilters 
}) => {
    return (
        <div className="movie-filters">
            <div className="filter-group">
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                />
            </div>

            <div className="filter-group">
                <select
                    value={filters.genre}
                    onChange={(e) => onFilterChange('genre', e.target.value)}
                >
                    <option value="">Все жанры</option>
                    {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group year-filter-from">
                <input
                    type="number"
                    placeholder="Год от"
                    value={filters.yearFrom}
                    onChange={(e) => onFilterChange('yearFrom', e.target.value)}
                    min="1888"
                    max={new Date().getFullYear() + 5}
                />
                <span>-</span>
                <input
                    type="number"
                    placeholder="Год до"
                    value={filters.yearTo}
                    onChange={(e) => onFilterChange('yearTo', e.target.value)}
                    min="1888"
                    max={new Date().getFullYear() + 5}
                />
            </div>

            <button 
                className="reset-filters-btn"
                onClick={resetFilters}
            >
                Сбросить
            </button>
        </div>
    );
};

export default MovieFilters;
---
const API_URL = 'http://localhost:3000/api/movies';

export const fetchMovies = async () => {
    try {
        const response = await fetch(API_URL, {
            credentials: 'include' // Добавляем для передачи кук
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error;
    }
};


export const deleteMovie = async (movieId) => {
    const response = await fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Только куки
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления фильма');
    }
    return response.json();
};

export const getMovieById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        credentials: 'include' // Добавляем куки
    });
    
    if(!response.ok) throw new Error('Фильм не найден');
    
    const data = await response.json();
    return data.movie;
};

export const createMovie = async (movieData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Только куки
        body: JSON.stringify(movieData) // Убрать selectedGenres
    });

    if (response.status === 403) throw new Error('Доступ запрещен');
    if (!response.ok) throw new Error('Ошибка создания фильма');
    
    return response.json();
};

export const updateMovie = async (id, movieData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Добавляем куки
        body: JSON.stringify(movieData)
    });

    if (response.status === 403) throw new Error('Доступ запрещен');
    if (!response.ok) throw new Error('Ошибка обновления фильма');
    
    return response.json();
};

export const searchMovies = async (filters) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
    if (filters.yearTo) params.append('yearTo', filters.yearTo);

    const response = await fetch(`${API_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
};
---
REACT_APP_API_BASE=http://localhost/api
REACT_APP_STATIC_BASE=http://localhost:3000
---
Это была клиентская часть теперь сервер
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || '911onelove9111';
const SALT_ROUNDS = 10;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/'
  });

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
          id: user.id,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '60m' }
      );
    
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

const refreshToken = async (req, res) => {
    // const { refreshToken } = req.body;
    
    // try {
    //     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    //     const user = await db.findUserById(decoded.id);
        
    //     if (!user) throw new Error('Пользователь не найден');
        
    //     const newTokens = generateTokens(user);
        
    //     res.json({
    //         success: true,
    //         ...newTokens
    //     });

    try {
        const refreshToken = req.cookies.refreshToken;
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await db.findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false });
        }

        const { accessToken, refreshToken: newRefresh } = generateTokens(user);

        // Общие настройки для кук
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
        };

        // Обновляем куки
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', newRefresh, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });
        
        return res.json({ success: true });
    } catch (error) {
        // Очищаем куки при ошибке
        res.clearCookie('accessToken', getCookieOptions());
        res.clearCookie('refreshToken', getCookieOptions());
        return res.status(401).json({ success: false });
    }
};


const registerUser = async (req, res) => {
    try {
        // Деструктурируем с значениями по умолчанию
        const { 
            username, 
            nickname = null, 
            password, 
            email = null 
        } = req.body;

        // Валидация обязательных полей
        if (!username || !password) {
            throw new Error('Username и password обязательны');
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Передаём только существующие значения
        const userData = {
            username,
            password: hashedPassword,
            ...(nickname && { nickname }), // Добавляем только если есть
            ...(email && { email })       // Добавляем только если есть
        };

        const user = await db.addUserToDB(userData);
        
        const { accessToken, refreshToken } = generateTokens(user);

        // Устанавливаем куки
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                email: user.email,
                role: user.role
            },
            message: 'Теперь вы зарегистрированы!'
        });
        // const tokens = generateTokens(user);

        // res.status(201).json({
        //     success: true,
        //     ...tokens,
        //     user: {
        //         id: user.id,
        //         username: user.username,
        //         nickname: user.nickname,
        //         role: user.role // Добавляем роль в ответ
        //     },
        //     message: 'Теперь вы зарегестрированы!'
        // });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Ошибка регистрации: ' + error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.findUserByUsernameInDB(username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Неверные учетные данные');
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // const tokens = generateTokens(user);

        // res.json({
        //     success: true,
        //     ...tokens,
        //     user: {
        //         id: user.id,
        //         username: user.username,
        //         nickname: user.nickname,
        //         role: user.role // Добавляем роль в ответ
        //     },
        //     message: 'Вход выполнен успешно!'
        // });

        // Устанавливаем куки
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Для HTTP в разработке
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // "None" на "Lax" для локальной разработки
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
            maxAge: 60 * 60 * 1000 // 60 минут
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                role: user.role
            },
            message: 'Вход выполнен успешно!'
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Неверное имя пользователя или пароль'
        });
    }
};


const logoutUser = async (req, res) => {
    const cookieOptions = getCookieOptions();
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ 
        success: true, 
        message: 'Вы вышли из аккаунта', 
        clearStorage: true 
    });
};


const getCurrentUser = async (req, res) => {
    try {
        const user = await db.findUserById(req.user.id);
        if (!user) throw new Error('Пользователь не найден');

        let levelInfo = null;
        if (typeof user.level !== 'undefined' && user.level !== null) {
            levelInfo = await db.getLevelById(user.level);
        }
        
        const userData = {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            role: user.role,
            credits: Number(user.credits),
            tickets: Number(user.tickets),
            subscriptions: Number(user.subscriptions),
            level: levelInfo ? {
                id: levelInfo.id,
                name: levelInfo.name,
                description: levelInfo.description
            } : null
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Ошибка в getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshToken,
    generateTokens
};
---
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
---
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const movieController = require('./controllers/movieController');
const JWT_SECRET = process.env.JWT_SECRET || '911onelove9111';

const app = express();
const PORT = process.env.PORT || 3000;

// Валидация фильмов
const movieValidation = [
    body('title')
      .trim()
      .notEmpty().withMessage('Название обязательно')
      .isLength({ max: 100 }).withMessage('Максимум 100 символов'),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Описание обязательно'),
    
      body('release_year')
      .exists().withMessage('Год выпуска обязателен')
      .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
      .withMessage('Некорректный год выпуска')
      .toInt(),
    
    // body('image')
    //   .isURL().withMessage('Некорректный URL изображения')
    //   .matches(/\.(jpeg|jpg|gif|png)$/).withMessage('Неподдерживаемый формат изображения'),
    
    body('trailerid')
      .trim()
      .notEmpty().withMessage('Идентификатор трейлера обязателен'),
    
    body('genres')
      .isArray({ min: 1 }).withMessage('Выберите хотя бы один жанр'),
    
    body('position')
      .isInt({ min: 0 }).withMessage('Позиция должна быть положительным числом')
];


const userUpdateValidation = [
    body('nickname')
        .trim()
        .notEmpty().withMessage('Никнейм обязателен')
        .isLength({ max: 30 }).withMessage('Максимум 30 символов'),

    body('email')
        .optional()
        .isEmail().withMessage('Некорректный email')
];


const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
              path: err.param,
              msg: err.msg
            }))
        });
    }
    next();
};
// Middleware cookies 
app.use(cookieParser());

// Middleware для проверки JWT
const authMiddleware = (req, res, next) => {
    console.log("Cookies:", req.cookies);
    
    const token = req.cookies.accessToken;
    console.log('Полученный токен из кук:', token);
    // const token = req.headers.authorization?.split(' ')[1];
    // console.log('Полученный токен:', token);
    
    if (!token) {
        console.log('Токен отсутствует');
        return res.status(401).json({ message: 'Требуется авторизация' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Декодированный токен:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Ошибка верификации токена:', error.message);
        res.status(401).json({ message: 'Недействительный токен' });
    }
};

// Middleware для администарторов
const isAdmin = (req, res, next) => {
    if (!req.user?.role || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Доступ запрещен. Требуются права администратора' 
        });
    }
    next();
};
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Настройка CORS для безопасного взаимодействия с клиентом
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // exposedHeaders: ['Authorization'],
    exposedHeaders: ['set-cookie']
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Cookies:', req.cookies);
    next();
  });

app.use(cookieParser());

app.use(express.json());

// Аутентификация
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logoutUser);

app.get('/api/users/me', authMiddleware, authController.getCurrentUser);
app.put('/api/users/me', 
    authMiddleware,
    userUpdateValidation, 
    handleValidation,
    async (req, res) => {
    try { 
        const updatedUser = await db.updateUser(req.user.id, req.body);
        res.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


app.delete('/api/users/me', authMiddleware, async (req, res) => {
    try {
        await db.deleteUserById(req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Ошибка при удалении аккаунта'
        });
    }
});

app.get('/api/user-levels/:levelId', async (req, res) => {
    console.log(`Запрос уровня с ID: ${req.params.levelId}`);
    try {
        const level = await db.getLevelById(req.params.levelId);
        console.log('Результат запроса уровня:', level);
        res.json({
            success: true,
            level
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения информации об уровне'
        });
    }
});

// Получение всех жанров
app.get('/api/genres', async (req, res) => {
    try {
        const genres = await db.getAllGenres();
        res.json({ 
            success: true, 
            genres 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения жанров' });
    }
});


app.get('/api/movies', async (req, res) => {
    try {
        const movies = await db.getAllMovies();
        res.status(200).json({
            success: true,
            data: movies
        });
    } catch (error) {
        console.error('Database Error: ', error);
        res.status(500).json({
            success: false,
            data: 'Внутренняя ошибка сервера'
        });
    }
});

app.get('/api/movies/search', async (req, res) => {
    try {
        const { search, genre, yearFrom, yearTo } = req.query;

        let baseQuery = `
            SELECT 
                m.*,
                COALESCE(AVG(r.rating), 0) AS rating,
                COUNT(r.id) AS ratings_count,
                ARRAY_AGG(DISTINCT g.id) AS genre_ids,
                STRING_AGG(DISTINCT g.name, ', ') AS genres
            FROM movies m
            LEFT JOIN ratings r ON m.id = r.movie_id
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
        `;

        const conditions = [];
        const params = [];

        // Поиск по названию
        if (search) {
            conditions.push(`m.title ILIKE $${params.length + 1}`);
            params.push(`%${search}%`);
        }

        // Фильтр по жанру
        if (genre) {
            conditions.push(`EXISTS (
                SELECT 1 FROM movie_genres mg
                WHERE mg.movie_id = m.id AND mg.genre_id = $${params.length + 1}
            )`);
            params.push(genre);
        }

        // Фильтр по году
        const yearConditions = [];
        if (yearFrom) {
            yearConditions.push(`m.release_year >= $${params.length + 1}`);
            params.push(parseInt(yearFrom));
        }
        if (yearTo) {
            yearConditions.push(`m.release_year <= $${params.length + 1}`);
            params.push(parseInt(yearTo));
        }
        if (yearConditions.length) {
            conditions.push(`(${yearConditions.join(' AND ')})`);
        }

        // Собираем окончательный запрос
        if (conditions.length) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }

        baseQuery += ' GROUP BY m.id ORDER BY m.position';

        const result = await db.pool.query(baseQuery, params);
        res.json({ 
            success: true, 
            data: result.rows.map(movie => ({
                ...movie,
                release_year: parseInt(movie.release_year)
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка при выполнении поиска' 
        });
    }
});

// Получение фильма по ID
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await db.getMovieById(req.params.id);
        if(!movie) {
            return res.status(404).json({
                success: false,
                message: 'Фильм не найден'
            });
        }

        const movieWithDetails = {
            ...movie,
            release_year: movie.release_year,
            rating: movie.rating || 0,
            genre: movie.genre || 'Не указан',
            trailerid: movie.trailerid
        };

        res.json({
            success: true, 
            movie: movieWithDetails 
        });
    } catch (error) {
        console.error('Ошибка получения фильма:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// Создание фильма (только для админов)
app.post('/api/movies', authMiddleware, isAdmin, movieValidation, handleValidation, async (req, res) => {
    try {
        const { genres, ...movieData } = req.body;
        console.log(movieData);
        const newMovie = await db.createMovie(movieData);
        
        if(genres?.length) {
            await db.updateMovieGenres(newMovie.id, genres);
        }
        
        res.status(201).json({ success: true, movie: newMovie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Обновление фильма (только для админов)
app.put('/api/movies/:id', authMiddleware, isAdmin, movieValidation, handleValidation, async (req, res) => {
    console.log('User role:', req.user.role);
    try {
        const { genres, release_year, ...restData } = req.body;
        console.log('Received update data:', req.body);

        // Формируем полный объект данных для обновления
        const movieData = { 
            ...restData,
            release_year: parseInt(release_year) // Преобразуем в число
        };

        // Проверка наличия обязательного поля
        if (typeof movieData.release_year === 'undefined') {
            throw new Error('Поле release_year обязательно для заполнения');
        }

        const updatedMovie = await db.updateMovie(req.params.id, movieData);
        
        if(genres) {
            await db.updateMovieGenres(req.params.id, genres);
        }
        
        res.json({ success: true, movie: updatedMovie });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Удаление фильма (только для админов)
//Добавить модальное окно 
app.delete('/api/movies/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await db.deleteMovieById(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

//!!!!!!!!!!!!!!!!!!app.post('/api/auth/about', );

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

---
//const { Client } = require('pg');
const { Pool } = require('pg');
require('dotenv').config();

// Создаем пул соединений с базой данных
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Проверяем соединение с базой данных
pool.connect()
    .then(() => console.log('Подключение к PostgreSQL успешно!'))
    .catch(err => console.error('дключения к PostgreSQL', err.stack));


// Функция для получения всех фильмов
const getAllMovies = async () => {
    const res = await pool.query(`SELECT * 
        FROM movies 
        ORDER BY 
            CASE WHEN position = 0 THEN 1 ELSE 0 END,
            position ASC
    `);
    return res.rows;
};

// Функция для получения фильма по ID
const getMovieById = async (id) => {
    const res = await pool.query(`
        SELECT 
          m.*,
          COALESCE(AVG(r.rating), 0) AS rating,
          COUNT(r.id) AS ratings_count,
          ARRAY_AGG(DISTINCT g.id) FILTER (WHERE g.id IS NOT NULL) AS genre_ids,
          STRING_AGG(DISTINCT g.name, ', ') AS genres
        FROM movies m
        LEFT JOIN ratings r ON m.id = r.movie_id
        LEFT JOIN movie_genres mg ON m.id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.id
        WHERE m.id = $1
        GROUP BY m.id
      `, [id]);
      return {
        ...res.rows[0],
        release_year: parseInt(res.rows[0].release_year) || null
    };
};

const deleteMovieById = async (id) => {
    try {
        const result = await pool.query(
            'DELETE FROM movies WHERE id = $1 RETURNING *', 
            [id]
        );
        
        if (result.rowCount === 0) {
            throw new Error(`Фильм с ID ${id} не найден`);
        }
        
        return result.rows[0];
    } catch (error) {
        console.error(`Ошибка удаления фильма ID ${id}:`, error);
        throw error;
    }
};

// Получение всех жанров
const getAllGenres = async () => {
    const res = await pool.query('SELECT * FROM genres');
    return res.rows;
};

// Обновление жанров фильма
const updateMovieGenres = async (movieId, genreIds) => {
    // Удаляем старые жанры
    await pool.query('DELETE FROM movie_genres WHERE movie_id = $1', [movieId]);
    
    // Добавляем новые
    for (const genreId of genreIds) {
        await pool.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)',
            [movieId, genreId]
        );
    }
};

// Функция для добавления пользователя в базу данных
const addUserToDB = async (user) => {
    const { username, nickname, password, email } = user;

    // Проверяем, существует ли никнейм
    if (await nicknameExists(nickname)) {
        throw new Error('Никнейм уже существует. Пожалуйста, выберите другой.');
    }

    const query = `
        INSERT INTO users 
            (username, nickname, password, email, level) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `;
    const values = [username, nickname, password, email, 0]; // Уровень по умолчанию 0
    
    try {
        const result = await pool.query(query, values);

        // Логируем результат запроса
        console.log('Результат вставки:', result.rows[0]);
        
        console.log('Пользователь успешно добавлен в базу данных.');
        // Возвращаем созданного пользователя с его id
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка при добавлении пользователя в базу данных:', error);
        throw error; // Перебрасываем ошибку для дальнейшей обработки
    }
};

const findUserById = async (id) => {
    const result = await pool.query(`
    SELECT 
      users.*,
      user_levels.name as level_name,
      user_levels.description as level_description
    FROM users
    LEFT JOIN user_levels ON users.level = user_levels.id
    WHERE users.id = $1
  `, [id]);
    return result.rows[0]; // Возвращаем первого найденного пользователя или undefined
};

// Функция для проверки существования никнейма
const nicknameExists = async (nickname) => {
    const query = 'SELECT COUNT(*) FROM users WHERE nickname = \$1';
    const values = [nickname];

    try {
        const result = await pool.query(query, values);
        console.log('Результат проверки никнейма:', parseInt(result.rows[0].count));
        return parseInt(result.rows[0].count) > 0; // Если количество больше 0, никнейм существует
    } catch (error) {
        console.error('Ошибка при проверке никнейма:', error);
        throw error; // Обрабатываем ошибку
    }
};

// Функция для поиска пользователя по имени в базе данных
const findUserByUsernameInDB = async (username) => {
    const query = `
        SELECT 
            id, 
            username, 
            password, 
            nickname, 
            role, 
            level
        FROM users 
        WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
};

// Функция для получения всех пользователей (при необходимости)
const getAllUsersFromDB = async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
};


const updateUser = async (userId, userData) => {
    const { nickname, email } = userData;
    const query = `
    UPDATE users
    SET nickname = $1, email = $2
    WHERE id = $3
    RETURNING *
    `;
    const values = [nickname, email, userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка обновления профиля пользователя', error);
        throw new Error('Ошибка при обновлении профиля');
    }
};


const deleteUserById = async (userId) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    } catch {
        console.error('Ошибка обновления пользователя:', error);
        throw new Error('Ошибка при обновлении профиля');
    }
};


const createMovie = async (movieData) => {
    const { title, description, image, trailerid, position, release_year } = movieData;
    const query = `
        INSERT INTO movies 
            (title, 
            description, 
            image, 
            trailerid, 
            position,
            release_year)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [
        title, 
        description, 
        image || null, 
        trailerid, 
        position || 0,
        release_year ? parseInt(release_year) : null
    ];
    

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Ошибка создания фильма:', error);
        throw error;
    }
}

const updateMovie = async (id, movieData) => {
    const { title, description, image, trailerid, position, release_year } = movieData;
    const query = `
        UPDATE movies
        SET title = $1, 
            description = $2, 
            image = $3, 
            trailerid = $4, 
            position = $5,
            release_year = $6
        WHERE id = $7
        RETURNING *
    `;
    const values = [
        title, 
        description, 
        image, 
        trailerid, 
        position || 0, 
        release_year ? parseInt(release_year) : null,
        id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};


const updateMoviePosition = async (movieId, newPosition) => {
    await pool.query(`
        UPDATE movies
        SET position = position + 1
        WHERE position >= \$1 AND position < \$2
    `, [newPosition, currentPosition]);

    await pool.query(`
        UPDATE movies
        SET position = position - 1
        WHERE position > \$1 AND position <= \$2
    `, [currentPosition, newPosition]);

    await pool.query(`
        UPDATE movies
        SET position = \$1
        WHERE id = \$2
    `, [newPosition, movieId]);
}

const getLevelById = async (levelId) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM user_levels WHERE id = $1',
            [levelId]
        );
        return rows[0] || null;
    } catch (error) {
        throw new Error(`Ошибка получения уровня: ${error.message}`);
    }
};

module.exports = {
    addUserToDB,
    findUserById,
    findUserByUsernameInDB,
    updateUser,
    deleteUserById,
    getAllUsersFromDB,
    getAllMovies,
    getMovieById,
    deleteMovieById,
    getAllGenres,
    updateMovieGenres,
    nicknameExists,
    createMovie,
    updateMovie,
    updateMoviePosition,
    getLevelById,
    pool,
};
---
и вот дамп базы данных