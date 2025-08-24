import axiosInstance from '../api/axiosInstance';

const API_URL = `${process.env.REACT_APP_API_BASE}/movies`;

export const fetchMovies = async () => {
    try {
        const response = await axiosInstance.get('/movies');
        console.log('Movies response structure:', response);
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error;
    }
};

export const deleteMovie = async (movieId) => {
    const response = await axiosInstance.delete(`/movies/${movieId}`);
    return response.data;
};

export const getMovieById = async (id) => {
    const response = await axiosInstance.get(`/movies/${id}`);
    return response.data.movie;
};

export const createMovie = async (movieData) => {
    const response = await axiosInstance.post('/movies', movieData);
    return response.data;
};

export const updateMovie = async (id, movieData) => {
    const response = await axiosInstance.put(`/movies/${id}`, movieData);
    return response.data;
};

export const searchMovies = async (filters) => {
    const params = {
        search: filters.search,
        genre: filters.genre,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo
    };
    
    const response = await axiosInstance.get('/movies/search', { params });
    return response.data;
};
// export const fetchMovies = async () => {
//     try {
//         const response = await fetch(API_URL, {
//             credentials: 'include' // Добавляем для передачи кук
//         });
        
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const data = await response.json();
//         return data.data;
//     } catch (error) {
//         console.error('Ошибка при загрузке фильмов:', error);
//         throw error;
//     }
// };


// export const deleteMovie = async (movieId) => {
//     const response = await fetch(`${API_URL}/${movieId}`, {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: 'include' // Только куки
//     });
    
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Ошибка удаления фильма');
//     }
//     return response.json();
// };

// export const getMovieById = async (id) => {
//     const response = await fetch(`${API_URL}/${id}`, {
//         credentials: 'include' // Добавляем куки
//     });
    
//     if(!response.ok) throw new Error('Фильм не найден');
    
//     const data = await response.json();
//     return data.movie;
// };

// export const createMovie = async (movieData) => {
//     const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: 'include', // Только куки
//         body: JSON.stringify(movieData) // Убрать selectedGenres
//     });

//     if (response.status === 403) throw new Error('Доступ запрещен');
//     if (!response.ok) throw new Error('Ошибка создания фильма');
    
//     return response.json();
// };

// export const updateMovie = async (id, movieData) => {
//     const response = await fetch(`${API_URL}/${id}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: 'include', // Добавляем куки
//         body: JSON.stringify(movieData)
//     });

//     if (response.status === 403) throw new Error('Доступ запрещен');
//     if (!response.ok) throw new Error('Ошибка обновления фильма');
    
//     return response.json();
// };

// export const searchMovies = async (filters) => {
//     const params = new URLSearchParams();
    
//     if (filters.search) params.append('search', filters.search);
//     if (filters.genre) params.append('genre', filters.genre);
//     if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
//     if (filters.yearTo) params.append('yearTo', filters.yearTo);

//     const response = await fetch(`${API_URL}/search?${params.toString()}`);
    
//     if (!response.ok) {
//         throw new Error(`Ошибка поиска: ${response.status}`);
//     }
    
//     const data = await response.json();
//     return data.data;
// };