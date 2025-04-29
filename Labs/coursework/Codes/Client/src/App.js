import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './pages/Navigation/Navigation';
import { NotificationProvider } from './context/NotificationContext';
import MamaPage from './pages/MamaPage';
import MovieListPage from './pages/MovieList/MovieListPage';
import PremieresPage from './pages/Premieres/PremieresPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AboutPage from './pages/About/AboutPage';
import LoginForm from './pages/Auth/LoginForm';
import RegistrationForm from './pages/Auth/RegistrationForm';

import './App.css';


function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          {/* Навигационное меню с CSS-классами */}
          <nav className="app-nav">
            <Link to="/" className="nav-logo">
              <img 
                src="/logo.png" 
                alt="Логотип"
                className="logo-image"
              />
              Celeston
            </Link>

            <div className="nav-links">
              <Link to="/movies" className="nav-link">Фильмы</Link>
              <Link to="/premieres" className="nav-link">Сейчас в кадре</Link>
              <Link to="/about" className="nav-link">О нас</Link>
              <Link to="/profile" className="nav-link">Мой профиль</Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<MamaPage />} />
            <Route path="/movies" element={<MovieListPage />} />
            <Route path="/premieres" element={<PremieresPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={
              <div className="error-page">
                <h2>404 - Страница не найдена</h2>
                <Link to="/" className="nav-link">Вернуться на главную</Link>
              </div>
            } />
          </Routes>

          <footer className="app-footer">
            <p>Celeston Theatre © {new Date().getFullYear()}</p>
            <div className="footer-links">
              <Link to="/about" className="footer-link">Контакты</Link> | 
              <Link to="/terms" className="footer-link">Условия использования</Link>
            </div>
          </footer>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;