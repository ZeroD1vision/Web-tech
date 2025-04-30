import React, {useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getMovieById } from '../../services/movieService';
import './MoviePage.css';

const MoviePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [movie, setMovie] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const loadMovie = async () => {
            try {
                const data = await getMovieById(id);
                setMovie(data);
            } catch (error) {
                showNotification('Ошибка загрузки фильма', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadMovie();
    }, [id]);

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
                    ← К списку фильмов
                </Link>
            </div>

            {/* Основной контент */}
            <div className="movie-content">
                {/* Постер и базовая информация */}
                <div className="movie-poster-section">
                    <div className="movie-poster-wrapper">
                        <img 
                            src={movie.image} 
                            alt={movie.title} 
                            className="movie-poster"
                            onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                                e.target.onerror = null;
                            }}
                        />
                    </div>
                    
                    <div className="movie-quick-info">
                        <div className="info-block">
                            <span className="info-label">Год выхода</span>
                            <span className="info-value">2023</span>
                        </div>
                        <div className="info-block">
                            <span className="info-label">Рейтинг</span>
                            <span className="info-value rating">8.9/10</span>
                        </div>
                        <div className="info-block">
                            <span className="info-label">Жанр</span>
                            <span className="info-value">Фантастика</span>
                        </div>
                    </div>
                </div>

                {/* Описание и трейлер */}
                <div className="movie-details">
                    <div className="description-section">
                        <h2 className="section-title">Описание</h2>
                        <p className="movie-description">{movie.description}</p>
                    </div>

                    <div className="trailer-section">
                        <h2 className="section-title">Трейлер</h2>
                        <div className="trailer-embed">
                            <iframe
                                src={`https://rutube.ru/embed/${movie.trailerid}`}
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
                    </div>
                </div>

                {/* Админ-панель */}
                {user?.role === 'admin' && (
                    <div className="admin-panel">
                        <button 
                            className="edit-btn"
                            onClick={() => {/* Логика редактирования */}}
                        >
                            Редактировать
                        </button>
                        <button 
                            className="delete-btn"
                            onClick={() => {/* Логика удаления */}}
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