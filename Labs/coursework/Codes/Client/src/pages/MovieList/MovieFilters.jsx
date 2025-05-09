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