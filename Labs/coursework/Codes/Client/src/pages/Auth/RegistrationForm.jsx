import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const RegistrationForm = () => {
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        username: '',
        nickname: '',
        password: '',
        email: ''
    });
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axiosInstance.post('/auth/register', formData);
        
        login(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
        
        showNotification('Регистрация успешна!', 'success');
        navigate('/profile');
      } catch (error) {
        showNotification(error.response?.data?.message || 'Ошибка регистрации', 'error');
      }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Логин"
                        required
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    />
                    <input
                        type="text"
                        placeholder="Никнейм"
                        //required
                        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        //required
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        required
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit">Зарегистрироваться</button>
                </form>
                <div className="auth-link">
                    Уже есть аккаунт? <Link to="/login">Войдите</Link>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;