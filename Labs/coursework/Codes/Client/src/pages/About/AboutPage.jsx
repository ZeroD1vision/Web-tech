import React, {useRef, useEffect}from 'react';
import './AboutPage.css';
import CinemaMap from '../../components/CinemaMap';

const AboutPage = () => {
  const contacts = {
    addresses: [
      'ул. Кинотеатральная, 15',
      'пр. Кинопремьерный, 42'
    ],
    phone: '+7 (999) 123-45-67',
    email: 'info@celeston.ru'
  };

  return (
    <div className="about-container">
      <h1>О кинотеатре Celeston</h1>
      
      <section className="history-section">
        <h2>Наша история</h2>
          <p>
          Celeston открыл свои двери в 2024 году, совершив революцию в мире развлечений. 
          Мы стали первым в России культурным пространством, где гармонично объединены 
          современный кинокомплекс и камерный театр. Наши два филиала созданы для тех, 
          кто ценит не только искусство, но и исключительный комфорт.
        </p>
        <p>
          Особой гордостью стали наши уникальные лакшери-зоны с индивидуальными столиками, 
          где гости могут наслаждаться спектаклями и фильмами за ужином, как в лучших 
          европейских театрах. Эта концепция «ресторанного просмотра» создает особую 
          атмосферу королевского приема, где каждое событие становится изысканным событием.
        </p>
        <p>
          Celeston — это пространство, где переплетаются магия кино и энергия живого театра, 
          создавая новый формат культурного отдыха для самых взыскательных зрителей.
        </p>
      </section>

      <section className="contacts-section">
        <h2>Контакты</h2>
        <div className="contact-info">
          <div className="addresses">
            <h3>Адреса кинотеатров:</h3>
            {contacts.addresses.map((addr, index) => (
              <p key={index}>{addr}</p>
            ))}
          </div>
          <div className="communication">
            <p>Телефон: {contacts.phone}</p>
            <p>Email: {contacts.email}</p>
          </div>
        </div>
        {<CinemaMap />}
      </section>

      <section className="team-section">
        <h2>Наша команда</h2>
        <div className="team-grid">
          {/* Фото и описание сотрудников */}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;