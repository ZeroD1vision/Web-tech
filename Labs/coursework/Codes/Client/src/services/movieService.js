import axiosInstance from '../api/axiosInstance' 

export const fetchMovies = async () => {
    try {
        const response = await axiosInstance.get('/movies');
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error;
    }
};


export const deleteMovie = async (movieId) => {
    const response = await axiosInstance.delete(`/movies/${movieId}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка удаления фильма');
    }
    return response.json();
};

export const getMovieById = async (id) => {
    const response = await axiosInstance.get(`/movies/${id}`);
    
    if(!response.ok) throw new Error('Фильм не найден');
    
    const data = await response.json();
    return data.movie;
};

export const createMovie = async (movieData) => {
    const response = await axiosInstance.post('/movies', movieData)

    if (response.status === 403) throw new Error('Доступ запрещен');
    if (!response.ok) throw new Error('Ошибка создания фильма');
    
    return response.json();
};

export const updateMovie = async (id, movieData) => {
    const response = await axiosInstance.put(`/movies/${id}`, movieData);

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

    const response = await axiosInstance.get('/movies/search', { 
        params: filters // axios сам делает querystring
    })
    
    if (!response.ok) {
        throw new Error(`Ошибка поиска: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
};