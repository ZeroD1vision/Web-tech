import React, { useState, useEffect, useRef } from 'react';
import { Form, Field } from 'react-final-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { createMovie, updateMovie, getMovieById } from '../../services/movieService';
import './MovieFormPage.css';

const validate = (values, genresList) => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!values.title?.trim()) errors.title = 'Название обязательно';
    if (!values.description?.trim()) errors.description = 'Описание обязательно';
    if (!values.release_year || values.release_year < 1888 || values.release_year > currentYear + 5) {
        errors.release_year = `Год должен быть от 1888 до ${currentYear + 5}`;
    }
    // Исправить урл изображения !!!!!!!!!!!!!
    // if (!data.image.match(/([/|.|\w|\s|-])*\.(?:jpg|gif|png)/)) {
    //   errors.image = 'Некорректный URL изображения';
    // }
    if (!values.trailerid?.trim()) errors.trailerid = 'Идентификатор трейлера обязателен';
    if (!values.genres?.length) errors.genres = 'Выберите хотя бы один жанр';

    return errors;
};

const MovieFormPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [genresList, setGenresList] = useState([]);
    const [initialValues, setInitialValues] = useState(null);
    const formRef = useRef();

    const scrollToError = () => {
        const firstError = document.querySelector('.invalid');
        if (firstError) {
          const rect = firstError.getBoundingClientRect();
          const scrollTarget = rect.top + window.pageYOffset - (window.innerHeight / 2 - rect.height / 2);
          
          window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });

          // Фокус на первое ошибочное поле
          const input = firstError.querySelector('input, textarea, .genres-select');
          if (input) input.focus({ preventScroll: true });
        }
    };

    useEffect(() => {
      if (user?.role !== 'admin') {
        showNotification('Доступ запрещен', 'error');
        navigate('/movies');
      }
    }, [user]);
    
    useEffect(() => {
        // Загрузка данных
        const fetchData = async () => {
          try {
            const genresData = await axiosInstance.get('/genres');
            if (genresData.data.success) {
              setGenresList(genresData.data.genres);
              
              // Загрузка данных фильма только после получения жанров
              if (id) {
                const movie = await getMovieById(id);
                console.log('Movie genres:', movie.genre_ids);
                console.log('All genres:', genresData.data.genres);
                
                // Фильтруем жанры фильма по существующим в системе
                const validGenres = genresData.data.genres
                  .filter(g => movie.genre_ids?.includes(g.id))
                  .map(g => g.id);

                console.log('Valid genres:', validGenres);

                setInitialValues({
                  ...movie,
                  image: '', // Добавляем
                  position: 0, // Добавляем
                  genres: validGenres
                });
              }
            }
          } catch (error) {
            showNotification('Ошибка загрузки жанров', 'error');
            navigate('/movies');
          }
        };

        if (user?.role === 'admin') fetchData();
    }, [id, user]);

    const handleSubmit = async (formData) => {
        try {
          

          const payload = {
            ...formData,
            release_year: parseInt(formData.release_year),
            position: parseInt(formData.position) || 0
        };

        console.log('Submit payload:', payload);

          console.log('Current user:', user);

          if (id) {
            await updateMovie(id, payload);
            showNotification('Фильм успешно обновлен', 'success');
          } else {
            await createMovie(payload);
            showNotification('Фильм успешно создан', 'success');
          }
          navigate('/movies');

          // Возвращаем результат для цепочки промисов
          return true;
        } catch (error) {
          showNotification(error.message, 'error');
          
          // Пробрасываем ошибку для обработки в Final Form
          throw error;
        }
    };

    return (
        <div className="movie-form-container">
          <Form
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validate={(values) => validate(values, genresList)}
            render={({ handleSubmit, submitting, form, submitFailed, errors, values }) => {
              
              const formApiRef = useRef(form);
              formApiRef.current = form;

              // Используем хук для отслеживания изменений
              const [submitCount, setSubmitCount] = useState(0);

              useEffect(() => {
                if (submitFailed || submitCount > 0) {
                  scrollToError();
                }
              }, [submitFailed, errors, submitCount]);

              return (
                <form
                  onSubmit={async event => { 
                    setSubmitCount(prev => prev + 1);
                    handleSubmit(event);
                  }}
                  ref={formRef}
                >
                  <h2>{id ? 'Редактирование фильма' : 'Создание нового фильма'}</h2>
                
                  <Field name="title">
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label htmlFor="title">Название</label>
                        <input
                          {...input}
                          type="text"
                          placeholder="Название фильма"
                        />
                        {meta.error && meta.touched && (
                          <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>
                  
                  <Field name="description">
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label htmlFor="title">Описание</label>
                        <textarea
                          {...input}
                          placeholder="Описание фильма"
                        />
                        {meta.error && meta.touched && (
                          <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>
                  
                  <Field name="release_year" parse={Number}>
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label htmlFor="release_year">Год выпуска</label>
                        <input
                          {...input}
                          type="number"
                          min="1888"
                          max={new Date().getFullYear() + 5}
                          data-test="release-year"
                        />
                        {meta.error && meta.touched && (
                          <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>
                  
                  <Field name="trailerid">
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label htmlFor="movie_trailerid">Идентификатор трейлера</label>
                        <input
                          {...input}
                          id="movie_trailerid"
                          type="text"
                          placeholder="Идентификатор трейлера"
                          data-test="trailer-id"
                        />
                        {meta.error && meta.touched && (
                          <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>
                  
                  <Field name="genres">
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label htmlFor="title">Жанры</label>
                        <div className="genres-select">
                          {genresList.map(genre => (
                            <label
                              key={genre.id}
                              className={`genre-checkbox ${
                                input.value?.includes(genre.id) ? 'checked' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                {...input}
                                value={genre.id}
                                checked={input.value?.includes(genre.id)}
                                onChange={e => {
                                  const newValue = e.target.checked
                                    ? [...(input.value || []), genre.id]
                                    : (input.value || []).filter(id => id !== genre.id);
                                  input.onChange(newValue);
                                }}
                              />
                              <span>{genre.name}</span>
                            </label>
                          ))}
                        </div>
                        {meta.error && meta.touched && (
                          <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>

                  <Field name="image">
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label>URL изображения</label>
                        <input
                          {...input}
                          type="text"
                          placeholder="/image.jpg"
                        />
                        {meta.error && meta.touched && (
                      <div className="error-message">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>

                  <Field name="position" parse={Number}>
                    {({ input, meta }) => (
                      <div className={`form-group ${meta.error && meta.touched ? 'invalid' : ''}`}>
                        <label>Позиция в списке</label>
                        <input
                          {...input}
                          type="number"
                          min="0"
                        />
                        {meta.error && meta.touched && <div className="error-message">{meta.error}</div>}
                      </div>
                    )}
                  </Field>
                  
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={submitting}
                    >
                      {submitting ? 'Сохранение...' : (id ? 'Сохранить' : 'Создать')}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        formApiRef.current.reset();
                        navigate('/movies');
                    }}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              );
            }}
          />
        </div>
      );
    };
    

export default MovieFormPage;