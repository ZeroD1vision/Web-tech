import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../slices/AuthSlice';
import { useNotification } from '../../context/NotificationContext';
import '../../slices/AuthRedux.css';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validate = (values) => {
    const errors = {};
    if (!values.username) errors.username = 'Обязательное поле';
    if (!values.password) errors.password = 'Обязательное поле';
    return errors;
  };

  const onSubmit = async (values) => {
    const resultAction = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(resultAction)) {
      setTimeout(() => navigate('/profile'), 600);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Вход</h2>
        <Form
          onSubmit={onSubmit}
          validate={validate}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="username">
                {({ input, meta }) => (
                  <div className="form-group">
                    <input
                      {...input}
                      type="text"
                      placeholder="Имя пользователя"
                      className={meta.error && meta.touched ? 'invalid' : ''}
                    />
                    {meta.error && meta.touched && <span className="error-message">{meta.error}</span>}
                  </div>
                )}
              </Field>

              <Field name="password">
                {({ input, meta }) => (
                  <div className="form-group">
                    <input
                      {...input}
                      type="password"
                      placeholder="Пароль"
                      className={meta.error && meta.touched ? 'invalid' : ''}
                    />
                    {meta.error && meta.touched && <span className="error-message">{meta.error}</span>}
                  </div>
                )}
              </Field>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
            </form>
          )}
        />
        <div className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;