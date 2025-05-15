const API_URL = 'http://localhost:3000/api/movies';

export const fetchMovies = async () => {
    try {
        const response = await fetch(API_URL, {
            credentials: 'include' // Добавляем для передачи кук
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error;
    }
};


export const deleteMovie = async (movieId) => {
    const response = await fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Только куки
    });
    
    if (!response.ok) throw new Error('Ошибка удаления фильма');
    return response.json();
};

export const getMovieById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        credentials: 'include' // Добавляем куки
    });
    
    if(!response.ok) throw new Error('Фильм не найден');
    
    const data = await response.json();
    return data.movie;
};

export const createMovie = async (movieData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Только куки
        body: JSON.stringify(movieData) // Убрать selectedGenres
    });

    if (response.status === 403) throw new Error('Доступ запрещен');
    if (!response.ok) throw new Error('Ошибка создания фильма');
    
    return response.json();
};

export const updateMovie = async (id, movieData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Добавляем куки
        body: JSON.stringify(movieData)
    });

    if (response.status === 403) throw new Error('Доступ запрещен');
    if (!response.ok) throw new Error('Ошибка обновления фильма');
    
    return response.json();
};

export const searchMovies = async (filters) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
    if (filters.yearTo) params.append('yearTo', filters.yearTo);

    const response = await fetch(`${API_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
};