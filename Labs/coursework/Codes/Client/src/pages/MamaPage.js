import React, {useEffect, useState} from 'react';
import fetchMovies from '../services/movieService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const MamaPage = () => {
    const [ movies, setMovies ] = useState([]);
    const [ filteredMovies, setFilteredMovies ] = useState([]);

    useEffect(() => {
        const getMovies = async () => {
            const data = await fetchMovies();
            setMovies(data);
            setFilteredMovies(data);
        }
        getMovies();
    }, []);

    const handleSearch = (query) => {
        const filtered = movies.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredMovies(filtered);
    };


    return (
        <div>
            <h1>
                Добро пожаловать в Киноафишу Celeston Theatre!
            </h1>
            <SearchBar onSearch={handleSearch} />
            <div>
                {filteredMovies.map(movie => (
                    <movieCard key={movieId} movie={movie} />
                ))}
            </div>
        </div>

    );
};

export default MamaPage;