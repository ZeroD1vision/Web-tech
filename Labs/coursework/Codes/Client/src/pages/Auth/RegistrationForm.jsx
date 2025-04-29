import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const RegistrationForm = () => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = ({
        username: '',
        nickname: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'text/html',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if(data.success) {
                showNotification('Регистрация прошла успешно!', 'success');
                navigate('/login');
            } else {
                showNotification(data.message || 'Ощибка регистрации', 'error');
            };
        } catch {
            showNotification('Ошибка подключения к серверу', 'error');
        }
    };

    return (
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
        </div>
    );
};

export default RegistrationForm;