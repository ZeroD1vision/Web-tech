// Главный файл index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
import App from './App';
import './index.css';

// Очистка невалидных токенов перед запуском приложения
if (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken')) {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

root.render(<App />);