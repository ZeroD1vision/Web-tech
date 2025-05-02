import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
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


const RequireAuth = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
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
            <AppContent />
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </div>
  );
}
function AppContent() {
  const { user } = useAuth(); // Теперь хук используется внутри AuthProvider

  return (
    <>
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
        <Link to="/profile" className="nav-link">
          {user ? 'Профиль' : 'Войти'}
        </Link>
      </div>
      </nav>

      <Routes>
      <Route path="/" element={<MamaPage />} />
      <Route path="/movies" element={<MovieListPage />} />
      <Route path="/premieres" element={<PremieresPage />} />
      <Route 
        path="/profile" 
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
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
    </>
  );
}

export default App;