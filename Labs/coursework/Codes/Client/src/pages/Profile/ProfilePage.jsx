import React, { useEffect, useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: 'guest1001',
    email: 'anatolypozd739@gmail.com',
    level: 'VIP',
    credits: 1500,
    tickets: [],
    subscriptions: []
  });

  // Пример загрузки данных (можно заменить на реальный API-запрос)
  useEffect(() => {
    // Загрузка данных пользователя
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Профиль {userData.name}</h1>
        <div className="level-badge">{userData.level}</div>
      </div>

      <div className="profile-content">
        <section className="user-info">
          <h2>Основная информация</h2>
          <p>Email: {userData.email}</p>
          <p>Баланс: {userData.credits} кинокредитов</p>
        </section>

        <section className="active-tickets">
          <h2>Активные билеты</h2>
          {userData.tickets.length > 0 ? (
            <div className="tickets-grid">
              {/* Карточки билетов */}
            </div>
          ) : (
            <p>У вас нет активных билетов</p>
          )}
        </section>

        <section className="subscriptions">
          <h2>Подписки</h2>
          <div className="subscription-list">
            {/* Список подписок */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;