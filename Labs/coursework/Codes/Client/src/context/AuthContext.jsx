import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import React from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', 
        { username, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Ошибка входа' 
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
      
      // Очистка клиентского состояния
      setUser(null);
      
      // Принудительная очистка кук
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    // Не проверяем аутентификацию на странице логина
    if (window.location.pathname === '/login') {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get('/users/me',
          { withCredentials: true }
        );
        setUser(data.user);
      } catch (error) {
        console.log('Авторизация не удалась');
      } finally {
        setIsLoading(false);
      }
    };

    if (window.location.pathname !== '/login') {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      navigate('/profile');
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};