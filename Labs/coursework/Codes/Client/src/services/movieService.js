const API_URL = 'http://localhost:3000/api/movies';

export const fetchMovies = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return data.data; // Возвращаем только массив фильмов
        } else {
            throw new Error('Ошибка в структуре ответа сервера');
        }
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error; // Пробрасываем ошибку дальше
    }
};

export const deleteMovie = async (movieId) => {
    const response = await fetch(`http://localhost:3000/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Ошибка удаления фильма');
    }
    
    return response.json();
};

export const getMovieById = async (id) => {
    const response = await fetch(`http://localhost:3000/api/movies/${id}`);

    if(!response.ok) {
        throw new Error('Фильм не найден');
    }
    
    const data = await response.json();
    if (!data.success) throw new Error('Ошибка получения данных');
    return data.movie;
}

export const createMovie = async (movieData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Требуется авторизация');
    console.log('Используем токен:', token);

    try {
        const response = await fetch('http://localhost:3000/api/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(movieData)
        });

        console.log('Response status:', response.status);
        
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Доступ запрещен');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in createMovie:', error);
        throw error;
    }
}

export const updateMovie = async (id, movieData) => {
    const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(movieData)
    });

    if (response.status === 403) {
        throw new Error('Доступ запрещен. Требуются права администратора');
    }
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления фильма');
    }
    
    return response.json();
};