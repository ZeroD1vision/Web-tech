import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => (
  <nav className="navigation">
    <Link to="/" className="logo">
      <img 
        src="/logo.png" 
        alt="Celeston Theatre" 
      />
      Celeston
    </Link>
    
    <div className="menu-container">
      <Link to="/movies" className="nav-link">Фильмы</Link>
      <Link to="/premieres" className="nav-link">Сейчас в кадре</Link>
      <Link to="/profile" className="nav-link">Мой профиль</Link>
      <Link to="/about" className="nav-link">О нас</Link>
    </div>
  </nav>
);

export default Navigation;