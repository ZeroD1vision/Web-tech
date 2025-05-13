import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Убираем перехватчик для добавления токена в заголовки

// instance.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

instance.interceptors.response.use(
  response => response,
  async error => {
    // Пропускаем обработку ошибок для страницы логина
    if (window.location.pathname === '/login') {
      return Promise.reject(error);
    }

    // Обработка просроченного access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Отправляем запрос на обновление токенов
        await instance.post(
          '/auth/refresh', 
          {}, 
          { withCredentials: true }
        );
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/api/auth/refresh', { refreshToken });
        
        // localStorage.setItem('accessToken', response.data.accessToken);
        // localStorage.setItem('refreshToken', response.data.refreshToken);

        // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        // Повторяем исходный запрос с новым токеном
        return instance(originalRequest);
      } catch (refreshError) {
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // Перенаправляем на логин при ошибке обновления
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=1';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;