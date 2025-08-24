import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Auth.css';

const LoginForm = () => {
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //Валидация полей
    const validate = (values) => {
      const errors = {};
      if (!values.username) errors.username = 'Введите логин';
      if (!values.password) errors.password = 'Введите пароль';
      return errors;
  };

  const handleSubmit = async (values, form) => {
      try {
        const response = await axiosInstance.post('/auth/login', values, { 
            withCredentials: true 
        });
        console.log('Response cookies:', response.headers['set-cookie']);
        
        document.cookie = `accessToken=${response.data.accessToken}; path=/; domain=localhost`;
        document.cookie = `refreshToken=${response.data.refreshToken}; path=/; domain=localhost`;
        
        console.log('Current cookies:', document.cookie);
        
          await axiosInstance.post('/auth/login', values, { 
              withCredentials: true 
          });

          const userResponse = await axiosInstance.get('/users/me', {
              withCredentials: true
          });

          login(userResponse.data.user);
          showNotification('Успешный вход', 'success');
          setTimeout(() => {
            window.location.href = '/profile';
          }, 600);

      } catch (error) {
          const serverMessage = error.response?.data?.message;
          const errorMessage = serverMessage || 'Ошибка подключения к серверу';
          showNotification(errorMessage, 'error');
          return { error: errorMessage };
      }
  };

  return (
      <div className="auth-container">
          <div className='auth-form'>
              <h2>Вход</h2>
              <Form
                  onSubmit={handleSubmit}
                  validate={validate}
                  render={({ 
                      handleSubmit, 
                      submitting, 
                      submitError,
                      hasValidationErrors,
                      submitFailed
                  }) => (
                      <form onSubmit={handleSubmit}>
                          <Field name="username">
                              {({ input, meta }) => (
                                  <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                                      <input
                                          {...input}
                                          type="text"
                                          placeholder="Имя пользователя"
                                          className={
                                              (submitFailed && meta.error) ? 'invalid' : ''
                                          }
                                      />
                                      {submitFailed && meta.error && (
                                          <div className="error-message">{meta.error}</div>
                                      )}
                                  </div>
                              )}
                          </Field>

                          <Field name="password">
                              {({ input, meta }) => (
                                  <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                                      <input
                                          {...input}
                                          type="password"
                                          placeholder="Пароль"
                                          className={
                                              (submitFailed && meta.error) ? 'invalid' : ''
                                          }
                                      />
                                      {submitFailed && meta.error && (
                                          <div className="error-message">{meta.error}</div>
                                      )}
                                  </div>
                              )}
                          </Field>

                          {submitError && (
                              <div className="error-message submit-error">
                                  {submitError.error}
                              </div>
                          )}

                          <button 
                              type="submit" 
                              disabled={submitting}
                          >
                              {submitting ? 'Отправка...' : 'Войти'}
                          </button>

                          <div className="auth-link">
                              Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
                          </div>
                      </form>
                  )}
              />
          </div>
      </div>
  );
};

export default LoginForm;

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       try {
//         // 1. Отправляем запрос на вход
//         const response = await axiosInstance.post('/auth/login', { 
//           username, 
//           password 
//         }, { 
//             withCredentials: true
//         });

//         // 2. Искусственная задержка для синхронизации кук
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         // login(
//         //   response.data.accessToken,
//         //   response.data.refreshToken,
//         //   response.data.user
//         // );

//         // 3. Получаем данные пользователя с обновлёнными куками
//         const userResponse = await axiosInstance.get('/users/me', {
//           withCredentials: true
//         });

//         // 4. Обновляем состояние аутентификации
//         login(userResponse.data.user);
        
//         showNotification('Успешный вход!', 'success');
        
//         // 5. Навигация без использования истории
//         setTimeout(() => {
//           window.location.href = '/profile';
//         }, 600); // Даем чутчут на отображение уведомления
//       } catch (error) {
//         const serverMessage = error.response?.data?.message;
//         const errorMessage = serverMessage || 'Ошибка подключения к серверу';
//         setError(errorMessage);
//         showNotification(errorMessage, 'error');
//       }
//     };
    
//     return (
//         <div className="auth-container">
//             <div className='auth-form'>
//                 <h2>Вход</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input
//                         type="text"
//                         placeholder="Имя пользователя"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         required
//                     />
//                     <input
//                         type="password"
//                         placeholder="Пароль"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                     <button type="submit">Войти</button>
//                 </form>
//                 {error && <div className="error-message">{error}</div>}
//                 <div className="auth-link">
//                     Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginForm;