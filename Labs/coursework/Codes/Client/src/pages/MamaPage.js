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