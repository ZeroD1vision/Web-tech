import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import fetchMovies from '../../services/movieService';
import './MovieListPage.css';

const MovieListPage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка фильмов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Произошла ошибка</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="movie-list-container">
            <h1>Наши фильмы</h1>
            
            <div className="movie-grid">
                {movies.map(movie => (
                    <div key={movie.id} className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)}>
                        <div className="movie-poster">
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
                                    onClick={e => e.stopPropagation()}
                                >
                                    Трейлер
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieListPage;