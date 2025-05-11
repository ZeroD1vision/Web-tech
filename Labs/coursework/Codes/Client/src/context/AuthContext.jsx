import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // const login = (accessToken, refreshToken, userData) => {
  //   localStorage.setItem('accessToken', accessToken);
  //   localStorage.setItem('refreshToken', refreshToken);
  //   setUser(userData);
  // };

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
    } catch (e) {
        console.error('Logout error:', e);
    } finally {
        setUser(null);
        // Сброс заголовков axios
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
      const checkAuth = async () => {
        try {
          const { data } = await axiosInstance.get('/users/me',
            { withCredentials: true }
          );
          setUser(data.user);
        } catch (error) {
          try {
            const { data } = axiosInstance.post('/auth/refresh', 
              {}, 
              { withCredentials: true }
            );
            setUser(data.user);
          } catch (refreshError) {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, []);

  // const logout = () => {
  //   localStorage.removeItem('accessToken');
  //   localStorage.removeItem('refreshToken');
  //   setUser(null);
  // };

  // const updateTokens = (accessToken, refreshToken) => {
  //   localStorage.setItem('accessToken', accessToken);
  //   localStorage.setItem('refreshToken', refreshToken);
  // };

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const accessToken = localStorage.getItem('accessToken');
  //       const refreshToken = localStorage.getItem('refreshToken');

  //       if (!accessToken || !refreshToken) {
  //           setIsLoading(false);
  //           return;
  //         }
  
  //         // Проверяем валидность access token
  //         const { data } = await axiosInstance.get('/users/me');
  //         setUser(data.user);
  //     } catch (error) {
  //       // Если access token невалиден, пробуем обновить токены
  //       try {
  //           const { data } = await axiosInstance.post('/auth/refresh', { 
  //               refreshToken: localStorage.getItem('refreshToken') 
  //           });
            
  //           localStorage.setItem('accessToken', data.accessToken);
  //           localStorage.setItem('refreshToken', data.refreshToken);
            
  //           const userResponse = await axiosInstance.get('/users/me');
  //           setUser(userResponse.data.user);
  //       } catch (refreshError) {
  //           logout();
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
        {children}
    </AuthContext.Provider>
  );

  // return (
  //   <AuthContext.Provider value={{ user, isLoading, login, logout, updateTokens }}>
  //     {!isLoading && children}
  //   </AuthContext.Provider>
  // );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
  };