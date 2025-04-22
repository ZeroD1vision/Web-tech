import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/movies">Фильмы</Link></li>
        <li><Link to="/series">Сериалы</Link></li>
        <li><Link to="/reviews">Рецензии</Link></li>
        <li><Link to="/contact">Контакты</Link></li>
        <li><Link to="/about">О нас</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;
