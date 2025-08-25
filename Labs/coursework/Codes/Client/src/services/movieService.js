import axiosInstance from '../api/axiosInstance' 

export const fetchMovies = async () => {
    try {
        const response = await axiosInstance.get('/movies');
        
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data.data;
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        throw error;
    }
};


export const deleteMovie = async (movieId) => {
    try {
        const response = await axiosInstance.delete(`/movies/${movieId}`);
        
        if (response.status !== 200) {
            throw new Error(response.data.message || 'Ошибка удаления фильма');
        }
        
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении фильма:', error);
        throw error;
    }
};

export const getMovieById = async (id) => {
    const response = await axiosInstance.get(`/movies/${id}`);
    
    if(response.status !== 200) {
        throw new Error('Фильм не найден');
    }

    return response.data.movie;
};

export const createMovie = async (movieData) => {
    try {
        const response = await axiosInstance.post('/movies', movieData)

        if (response.status === 403) throw new Error('Доступ запрещен');
        if (response.status !== 201) throw new Error('Ошибка создания фильма');

        return response.data;
    }
    catch (error) {
        console.error('Ошибка при обновлении фильма:', error);
        throw error;
    }
};

export const updateMovie = async (id, movieData) => {
    try {
        const response = await axiosInstance.put(`/movies/${id}`, movieData);

        if (response.status === 403) throw new Error('Доступ запрещен');
        if (response.status !== 200) throw new Error('Ошибка обновления фильма');
        
        return response.data;
    }
    catch (error) {
        console.error('Ошибка при обновлении фильма:', error);
        throw error;
    }
};

export const searchMovies = async (filters) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
    if (filters.yearTo) params.append('yearTo', filters.yearTo);
    try {
        const response = await axiosInstance.get('/movies/search', { 
            params: filters // axios сам делает querystring
        })
        
        if (response.status !== 200) {
            throw new Error(`Ошибка поиска: ${response.status}`);
        }
        
        return response.data.data;
    }
    catch (error) {
        console.error('Ошибка при поиске фильмов:', error);
        throw error;
    }
};