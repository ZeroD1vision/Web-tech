import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useNotification } from '../../context/NotificationContext';
import './ProfilePage.css';

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
          const numericLevelId = Number(levelId);
          const response = await axiosInstance.get(`/user-levels/${numericLevelId}`);
          
          if (response.data.success) {
            setLevelInfo(response.data.level);
          }
      } catch (error) {
        console.error('Ошибка загрузки уровня:', error);
        showNotification(error.response?.data?.message || 'Ошибка загрузки уровня', 'error');
      } finally {
          setLoadingLevel(false);
      }
    };


    const handleLogout = async () => {
      try {
        await axiosInstance.post('/auth/logout');
        logout();
        showNotification('Вы успешно вышли из системы', 'success');
        navigate('/login');
      } catch (error) {
        showNotification('Ошибка при выходе', 'error');
        logout(); // Все равно очищаем токены на клиенте
      }
    };

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get('/users/me');
          const userData = response.data.user;
      
          // Получаем ID уровня из объекта
          if (userData.level?.id) {
            const levelResponse = await axiosInstance.get(`/user-levels/${userData.level.id}`);
            setLevelInfo(levelResponse.data.level);
          }
      
          setUserData(userData);
        } catch (error) {
          showNotification('Ошибка загрузки профиля', 'error');
        } finally {
          setLoading(false); // Конец загрузки в любом случае
        }
      };
  
      if (user) fetchProfile();
    }, [user]);

  // Если пользователь не авторизован, просто ничего не рендерим
  if (!user) {
      return null; // Можно также вернуть загрузочный индикатор или сообщение
  }


  if (loading) {
    return <div className="loading">Загрузка профиля...</div>;
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
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
};

export default ProfilePage;