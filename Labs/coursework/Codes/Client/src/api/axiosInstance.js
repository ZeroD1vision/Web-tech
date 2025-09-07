import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8080/api'
  : 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

instance.interceptors.response.use(
  (response) => response,
  async error => {
    // Пропускаем обработку ошибок для страницы логина
    if (window.location.pathname === '/login') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Обработка просроченного access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Отправляем запрос на обновление токенов
        await instance.post('/auth/refresh', {}, { withCredentials: true });
        
        // Повторяем исходный запрос с новым токеном
        return instance(originalRequest);
      } catch (refreshError) {
        console.log('Refresh failed, logging out');
        // Перенаправляем на логин при ошибке обновления
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=1';
        }
        // Если ошибка не 401 или уже была попытка обновления — просто отклоняем промис с ошибкой
        return Promise.reject(refreshError);
      }
    }
    
    // Обработка других ошибок
    if (error.response) {
      // Сервер ответил с статусом ошибки
      console.error('Server Error:', error.response.data);
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.error('Network Error:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;