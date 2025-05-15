import React, { useEffect, useRef } from 'react';
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

const useScrollHandler = (navRef) => {
  useEffect(() => {
    const navbar = navRef.current;
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      if (!navbar) return;
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        navbar.classList.add('app-nav--hidden');
        navbar.classList.remove('app-nav--visible');
      } else {
        navbar.classList.remove('app-nav--hidden');
        navbar.classList.add('app-nav--visible');
      }
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navRef]);
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


const RequireAuth = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};


function App() {

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
  const { user } = useAuth();
  const navRef = useRef(null);

  useScrollHandler(navRef);

  return (
    <>
      <nav className="app-nav" ref={navRef}>
      <Link to="/" className="nav-logo">
        <img 
          src="/logo.png" 
          alt="Логотип"
          className="logo-image"
        />
        Celeston Theatre
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
        <Route 
          path="/movies/new" 
          element={
            <RequireAuth allowedRoles={['admin']}>
              <MovieFormPage />
            </RequireAuth>
          } 
        />
        <Route 
          path="/movies/:id/edit" 
          element={
            <RequireAuth allowedRoles={['admin']}>
              <MovieFormPage />
            </RequireAuth>
          } 
        />
        {/*Несуществующие пути*/}
        <Route 
          path="*" 
          element={
            <div className="error-page">
              <h2>404 - Страница не найдена</h2>
              <Link to="/" className="nav-link">Вернуться на главную</Link>
            </div>
          } 
        />
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