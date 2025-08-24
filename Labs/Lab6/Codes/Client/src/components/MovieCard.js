import React from 'react';

const MovieCard = ({ movie }) => {
    return (
        <div className="movie-card">
            <h2>{movie.title}</h2>
            <p>{movie.description}</p>
            {movie.poster && <img src={movie.poster} alt={movie.title} />}
        </div>
    );
};

export default MovieCard;