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
    const originalRequest = error.config;
    
    // Обрабатываем код 419 (просроченный токен)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Отправляем запрос на обновление токенов
        const response = await instance.post(
          '/api/auth/refresh', 
          {}, 
          { withCredentials: true }
        );
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('/api/auth/refresh', { refreshToken });
        
        // localStorage.setItem('accessToken', response.data.accessToken);
        // localStorage.setItem('refreshToken', response.data.refreshToken);

        // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // Перенаправляем на логин при ошибке обновления
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;