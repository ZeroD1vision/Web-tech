import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [ query, setQuery ] = useState('');

    const handleChange = (event) => {
        setQuery(event.target.value);
        onSearch(event.target.value); // Передаем значение обратно в родительский компонент
    };
    
    return (
        <div>
            <input
                type="text"
                placeholder="Поиск фильмов..."
                value={query}
                onChange={handleChange}
            />
        </div>
    );
};

export default SearchBar;