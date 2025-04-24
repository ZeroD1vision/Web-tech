import React from 'react';
import './AboutPage.css';
//import CinemaMap from '../../components/CinemaMap';

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
        <p>Основан в 1999 году как первый мультиплекс...</p>
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
        <CinemaMap />
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