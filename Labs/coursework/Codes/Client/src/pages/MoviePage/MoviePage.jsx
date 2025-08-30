import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getMovieById, deleteMovie } from '../../services/movieService';
import './MoviePage.css';

const MoviePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadMovie = async () => {
            try {
                const data = await getMovieById(id);
                // Преобразование данных из БД
                const transformedData = {
                    ...data,
                    // Разделяем жанры из строки в массив
                    genres: data.genres ? data.genres.split(', ') : [],
                    // Преобразуем рейтинг в число
                    rating: parseFloat(data.rating) || 0
                };
                
                setMovie(transformedData);
            } catch (error) {
                showNotification('Ошибка загрузки фильма', 'error');
                navigate('/movies');
            } finally {
                setLoading(false);
            }
        };
        loadMovie();
    }, [id]);

    const handleDelete = async (id) => {
        if(!window.confirm('Вы уверены, что хотите удалить этот фильм?')) return;

        try {
            await deleteMovie(id);
            showNotification('Фильм успешно удалён', 'success');
            navigate('/movies');
        } catch (error) {
            showNotification('Ошибка при удалении фильма', 'error');
        }
    };
    
    const handleEdit = async (id) => {
        navigate(`/movies/${id}/edit`);
    }

    if(loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="movie-page-container">
            {/* Заголовок */}
            <div className="movie-header">
                <h1 className="gradient-title">{movie.title}</h1>
                <Link to="/movies" className="back-button">
                    К списку фильмов
                </Link>
            </div>

            {/* Основной контент */}
            <div className="movie-content">
                {/* Постер и базовая информация */}
                <div className="movie-poster-section">
                    <div className="movie-poster-wrapper">
                        {movie.image ? ( <img 
                            src={`/${movie.image}`} 
                            alt={movie.title} 
                            className="movie-poster"
                            onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                                e.target.onerror = null;
                            }}
                        /> ) : (
                            <div className="image-placeholder">Нет изображения</div>
                        )}
                    </div>
                    
                    <div className="movie-quick-info">
                        <div className="info-block">
                            <span className="info-label">Год выхода</span>
                            <span className="info-value">{movie.release_year}</span>
                        </div>
                        <div className="info-block">
                            <span className="info-label">Рейтинг</span>
                            <span className="info-value rating">
                                {movie.rating?.toFixed(1) || 'Нет оценок'}/10
                                <small>({movie.ratings_count} оценок)</small>
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="info-label">Жанр</span>
                            <div className="genres-list">
                                {movie.genres
                                    .filter((genre, index, self) => self.indexOf(genre) === index) // Убираем дубли
                                    .map((genre) => (
                                        <span key={genre} className="genre-tag"> {/* Используем имя как ключ */}
                                          {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Описание и трейлер */}
                <div className="movie-details">
                    <div className="description-section">
                        <h2 className="section-title">Описание</h2>
                        <p className="movie-description">{movie.description}</p>
                    </div>
                    {/* Секция с трейлером */}
                    <div className="trailer-section">
                        <h2 className="section-title">Трейлер</h2>
                        {movie.trailerid ? (
                            <>
                                <div className="trailer-embed">
                                    <iframe
                                        src={`https://rutube.ru/embed/${movie.trailerid}?noAds=true`}
                                        title="Трейлер"
                                        allowFullScreen
                                    />
                                </div>
                                <a
                                    href={`https://rutube.ru/video/${movie.trailerid}`}
                                    className="trailer-btn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Смотреть на Rutube
                                </a>
                            </>
                        ) : (
                            <div className="no-trailer">
                                Трейлер недоступен
                            </div>
                        )}
                    </div>
                </div>

                {/* Админ-панель */}
                {user?.role === 'admin' && (
                    <div className="admin-panel">
                        <button 
                            className="edit-form-btn"
                            onClick={() => handleEdit(id)}
                        >
                            Редактировать
                        </button>
                        <button 
                            className="delete-form-btn"
                            onClick={() => handleDelete(id)}
                            disabled={!user}
                        >
                            Удалить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoviePage;