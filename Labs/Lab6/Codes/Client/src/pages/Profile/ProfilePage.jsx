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
  const [editMode, setEditMode] = useState(false);
  const [editedUserData, setEditedUserData] = useState({
    nickname: '',
    email: ''
  });
  // Загрузка данных профиля
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
  
      try {
        const userResponse = await axiosInstance.get('/users/me');
        console.log('Данные пользователя:', userResponse.data.user);
        const newUserData = userResponse.data.user;

        // Сначала обновляем данные пользователя
        setUserData(newUserData);
        setEditedUserData({
          nickname: newUserData.nickname,
          email: newUserData.email
        });
  
        // Затем загружаем уровень
        if (typeof newUserData.level?.id !== 'undefined') {
          try {
            setLoadingLevel(true);
            const levelResponse = await axiosInstance.get(`/user-levels/${newUserData.level.id}`);
            setLevelInfo(levelResponse.data.level);
          } finally {
            setLoadingLevel(false);
          }
        }
      } catch (error) {
        showNotification('Ошибка загрузки профиля', 'error');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [user]);


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


  const handleEditProfile = async () => {
    try {
      if(!editedUserData.nickname.trim()) {
        showNotification('Никнейм не может быть пустым', 'error');
        return;
      }

      const response = await axiosInstance.put('/users/me', {
        nickname: editedUserData.nickname,
        email: editedUserData.email
      });
      setUserData({ ...editedUserData, ...response.data.user }); // Обьединяет и одинаковые берет из первого
      showNotification('Профиль успешно обновлен', 'success');
      setEditMode(false);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Ошибка обновления профиля', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!')) {
      try {
        await axiosInstance.delete('/users/me');
        logout();
        showNotification('Аккаунт успешно удален', 'success');
        navigate('/');
      } catch (error) {
        showNotification('Ошибка при удалении аккаунта', 'error');
      }
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
    </div>

    {editMode ? (
      <div className="edit-form">
        <div className="form-group">
          <label>Никнейм:</label>
          <input
            type="text"
            name="nickname"
            value={editedUserData.nickname}
            onChange={(e) => setEditedUserData({...editedUserData, nickname: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={editedUserData.email}
            onChange={(e) => setEditedUserData({...editedUserData, email: e.target.value})}
          />
        </div>
        <div className="form-actions">
          <button 
            className="save-btn"
            onClick={handleEditProfile}
          >
            Сохранить
          </button>
          <button 
            className="cancel-btn"
            onClick={() => setEditMode(false)}
          >
            Отмена
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="level-info">
          {loadingLevel ? (
            <div className="level-loading">Загрузка...</div>
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
            {userData?.subscriptions?.length > 0 ? (
              <div className="subscription-list">
                {/* Подписки, если есть */}
              </div>
            ) : (
              <p>У вас нет активных подписок</p>
            )}
          </section>
        </div>
      </>
    )}

    {!editMode && (
      <div className="profile-actions">
        <button 
          className="edit-profile-btn"
          onClick={() => setEditMode(true)}
        >
          Редактировать профиль
        </button>
        <button 
          className="delete-profile-btn"
          onClick={handleDeleteAccount}
        >
          Удалить аккаунт
        </button>
        <div>
          <button className="quit" onClick={handleLogout}>Выйти</button>
        </div>
      </div>
    )}
    
    
  </div>
)};

export default ProfilePage;