import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const LoginForm = () => {
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axiosInstance.post('/auth/login', { username, password });
        
        login(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
        
        showNotification('Успешный вход!', 'success');
        navigate('/profile');
      } catch (error) {
        const serverMessage = error.response?.data?.message;
        const errorMessage = serverMessage || 'Ошибка подключения к серверу';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    };

    return (
        <div className="auth-container">
            <div className='auth-form'>
                <h2>Вход</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Войти</button>
                </form>
                {error && <div className="error-message">{error}</div>}
                <div className="auth-link">
                    Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;