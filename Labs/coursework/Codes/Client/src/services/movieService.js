const API_URL = 'http://localhost:5000/api/movies'; // URL вашего сервера

const fetchMovies = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Ошибка сети при получении данных о фильмах');
        }

        const data = await response.json();
        return data; // Возвращаем массив фильмов
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
};

export default fetchMovies;