import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const LoginForm = () => {
    const { showNotification } = useNotification();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const mit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Ошибка входа');

            showNotification('Успешный вход!', 'success');

            login(data.token, {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role,
                nickname: data.user.nickname
            });
            
            navigate('/profile');
        } catch (err) {
            showNotification(err.message || 'Ошибка подключения к серверу', 'error');
        }
    };

    return (
        <div className="auth-form">
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
        </div>
    );
};

export default LoginForm;