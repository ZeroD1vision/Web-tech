import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { useNotification } from '../../context/NotificationContext';

const ProfilePage = () => {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [levelInfo, setLevelInfo] = useState(null);
    const [loadingLevel, setLoadingLevel] = useState(false);

    // Функция для загрузки информации об уровне
    const fetchLevelInfo = async (levelId) => {
      try {
          setLoadingLevel(true);
          const response = await fetch(`http://localhost:3000/api/user-levels/${levelId}`);
          
          if (!response.ok) {
              throw new Error('Ошибка загрузки информации об уровне');
          }
          
          const data = await response.json();
          if (data.success) {
              setLevelInfo(data.level);
          }
      } catch (error) {
          showNotification(error.message, 'error');
      } finally {
          setLoadingLevel(false);
      }
    };

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const response = await fetch('http://localhost:3000/api/users/me', {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
              }
          });

          console.log('Response status:', response.status);
          
          if (!response.ok) {
              throw new Error('Ошибка авторизации');
          }
          const data = await response.json();
          console.log('Received data:', data); // Логируем полученные данные
                
          if (data.success) {
            const formattedUser = {
                ...data.user,
                credits: Number(data.user.credits) || 0
            };
            setUserData(formattedUser);
            
            if (formattedUser.level) {
                await fetchLevelInfo(formattedUser.level);
            }
          }
        } catch (error) {
          console.error('Profile fetch error:', error); // Логируем ошибку
          setError(error.message);
          showNotification(error.message, 'error');
          logout();
        } finally {
          setLoading(false);
        }
      };
  
      if (user) {
        fetchProfile();
      } else {
        navigate('/login');
      }
    }, [user, navigate, logout, showNotification]);

    // Если пользователь не авторизован, просто ничего не рендерим
    if (!user) {
        return null; // Можно также вернуть загрузочный индикатор или сообщение
    }


  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Профиль {userData?.nickname || 'Гость'}</h1>
        <div className="level-info">
          {loadingLevel ? (
            <div className="level-loading">Загрузка информации об уровне...</div>
          ) : (
            levelInfo && (
              <>
                <div className="level-badge">
                    Уровень: {levelInfo.name}
                </div>
                <div className="level-description">
                    {levelInfo.description}
                </div>
              </>
            )
          )}
        </div>
      </div>

      <div className="profile-content">
        <section className="user-info">
          <h2>Основная информация</h2>
          <p>Email: {userData?.email || 'Не указано'}</p>
          <p>Селестоний: {userData?.credits || 0} единиц</p>
        </section>

        <section className="active-tickets">
          <h2>Активные билеты</h2>
          {userData?.tickets?.length > 0 ? (
            <div className="tickets-grid">
              {/* Карточки билетов */}
            </div>
          ) : (
            <p>У вас нет активных билетов</p>
          )}
        </section>

        <section className="subscriptions">
          <h2>Подписки</h2>
          {userData?.tickets?.length > 0 ? (
            <div className="subscription-list">
              {/* Подписки, если есть */}
            </div>
          ) : (
            <p>У вас нет активных подписок</p>
          )}
        </section>
      </div>
      <button onClick={logout}>Выйти</button>
    </div>
  );
};

export default ProfilePage;