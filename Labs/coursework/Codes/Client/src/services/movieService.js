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