import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
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
import MovieFormPage from './pages/MovieForm/MovieFormPage';
import MoviePage from './pages/MoviePage/MoviePage';

import './App.css';

const useScrollHandler = () => {
  useEffect(() => {
    const navbar = document.querySelector('.app-nav');
    let lastScroll = window.pageYOffset;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const isScrollingDown = currentScroll > lastScroll;

      navbar?.classList.toggle('app-nav--hidden', isScrollingDown && currentScroll > 60);
      navbar?.classList.toggle('app-nav--visible', !isScrollingDown);
      
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = 'Главная страница';
        break;
      case '/movies':
        document.title = 'Список фильмов';
        break;
      case '/premieres':
        document.title = 'Сейчас в кадре';
        break;
      case '/profile':
        document.title = 'Профиль';
        break;
      case '/about':
        document.title = 'О нас';
        break;
      case '/login':
        document.title = 'Вход';
        break;
      case '/register':
        document.title = 'Регистрация';
        break;
      default:
        document.title = 'Celeston Theatre';
    }
  }, [location]);

  return null; // Этот компонент ничего не рендерит
};


function App() {
  useScrollHandler();
  return (
    <div className="app-container">
      <div className="app-background"></div>

      <NotificationProvider>
        <AuthProvider>
          <Router>
          <PageTitle />
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
                <Link to="/profile" className="nav-link">Профиль</Link>
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
              <Route path="/movies/:id" element={<MoviePage />} />
              {/*Для админов*/}
              <Route path="/movies/new" element={<MovieFormPage />} />
              <Route path="/movies/:id/edit" element={<MovieFormPage />} />
              {/*Несуществующие пути*/}
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
    </div>
  );
}

export default App;