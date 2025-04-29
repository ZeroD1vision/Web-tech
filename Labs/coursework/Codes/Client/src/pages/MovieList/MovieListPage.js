import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { fetchMovies } from '../../services/movieService';
import './MovieListPage.css';

const MovieListPage = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        loadMovies();
    }, []); // Пустой массив зависимостей, чтобы эффект выполнялся только при монтировании
        
    const loadMovies = async () => {
        try {
            const moviesData = await fetchMovies();
            
            // Обрабатываем изображения
            const moviesWithImages = moviesData.map(movie => ({
                ...movie,
                image: movie.image 
                    ? `http://localhost:3000/${movie.image}`
                    : null
            }));
        
            setMovies(moviesWithImages);
        } catch (err) {
            showNotification(`Ошибка загрузки фильмов: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

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
                                    src={movie.image} 
                                    alt={movie.title}
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