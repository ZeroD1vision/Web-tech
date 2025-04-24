import React, { useState, useEffect } from 'react';
import './PremieresPage.css';
import MovieCard from '../../components/MovieCard';

const PremieresPage = () => {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState('all');

  // Пример загрузки данных
  useEffect(() => {
    // API-запрос для получения списка премьер
    const fetchData = async () => {
      const response = await fetch('/api/premieres');
      const data = await response.json();
      setMovies(data);
    };
    fetchData();
  }, []);

  const filteredMovies = movies.filter(movie => {
    if(filter === 'current') return movie.status === 'now_showing';
    if(filter === 'upcoming') return movie.status === 'coming_soon';
    return true;
  });

  return (
    <div className="premieres-container">
      <div className="premieres-header">
        <h1>Сейчас в кадре</h1>
        <div className="filters">
          <button onClick={() => setFilter('all')}>Все</button>
          <button onClick={() => setFilter('current')}>Сейчас в кино</button>
          <button onClick={() => setFilter('upcoming')}>Скоро</button>
        </div>
      </div>

      <div className="movies-grid">
        {filteredMovies.map(movie => (
          <MovieCard 
            key={movie.id}
            title={movie.title}
            poster={movie.poster}
            releaseDate={movie.releaseDate}
            genre={movie.genre}
            rating={movie.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default PremieresPage;