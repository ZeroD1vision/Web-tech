import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { showNotification } = useNotification();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Выносим функцию checkAuth наружу и оборачиваем в useCallback
    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Сессия истекла');
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            showNotification(error.message, 'error');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]); // Добавляем checkAuth в зависимости

    const login = async (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
        await checkAuth(); // Теперь checkAuth доступна здесь
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);