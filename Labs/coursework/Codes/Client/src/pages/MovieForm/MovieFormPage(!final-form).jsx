import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { createMovie, updateMovie, getMovieById } from '../../services/movieService';
import './MovieFormPage.css';

const validateForm = (values, genresList) => {
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
    const [initialValues, setInitialValues] = useState(null);

    const [ formData, setFormData ] = useState({
        title: '',
        description: '',
        image: '',
        trailerid: '',
        position: 0,
        release_year: ''
    });

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genresList, setGenresList] = useState([]);

    
    const [errors, setErrors] = useState({});
    const firstErrorRef = useRef(null);

    const scrollToError = () => {
        const firstErrorElement = document.querySelector('.invalid');
        if (firstErrorElement) {
          const rect = firstErrorElement.getBoundingClientRect();
          const scrollTarget = rect.top + window.pageYOffset - (window.innerHeight / 2 - rect.height / 2);
          
          window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
    };
    
    useEffect(() => {
        // Загрузка списка жанров
        const fetchGenres = async () => {
          try {
            const response = await fetch('http://localhost:3000/api/genres');
            const data = await response.json();
            if(data.success) {
              setGenresList(data.genres);
            }
          } catch (error) {
            showNotification('Ошибка загрузки жанров', 'error');
          }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        if(id) {
          const fetchMovie = async () => {
            try {
              const movie = await getMovieById(id);

              console.log('Received movie data:', movie);

              setFormData({
                title: movie.title || '',
                description: movie.description || '',
                image: movie.image || '',
                trailerid: movie.trailerid || '',
                position: movie.position || 0,
                release_year: movie.release_year || '' // Оставляем как число
              });
              
              // Установка выбранных жанров
              if(movie.genre_ids) {
                  setSelectedGenres(movie.genre_ids.filter(id => id !== null));
              }
            } catch (error) {
              showNotification('Ошибка загрузки фильма', 'error');
              navigate('/movies');
            }
          };
          fetchMovie();
        }
    }, [id]);
    
    // Проверка роли админа
    useEffect(() => {
        if (user?.role !== 'admin') {
          showNotification('Доступ запрещен', 'error');
          navigate('/movies');
        }
    }, [user, navigate, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          console.log('Current user:', user);

          if (!user?.role || user.role !== 'admin') {
            throw new Error('Недостаточно прав для выполнения операции');
          }

          const validationErrors = validateForm(formData, selectedGenres);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            await new Promise(resolve => setTimeout(resolve, 50)); // Даем время на рендер ошибок
            scrollToError();
            return;
          }

          const payload = {
            ...formData,
            genres: selectedGenres || [],
            release_year: formData.release_year 
            ? parseInt(formData.release_year) // Отправляем как число
            : null // Преобразуем год в дату
          };

          console.log('Submit Movie data:', payload);

          if (id) {
            await updateMovie(id, payload);
            showNotification('Фильм успешно обновлен', 'success');
          } else {
            await createMovie(payload);
            showNotification('Фильм успешно создан', 'success');
          }
          navigate('/movies');
          setErrors({});
        } catch (error) {
          if (error.response?.data?.errors) {
            const serverErrors = error.response.data.errors.reduce((acc, err) => {
              acc[err.path] = err.msg;
              return acc;
            }, {});
            setErrors(serverErrors);
            scrollToError();
          } else {
            showNotification(error.message, 'error');
          }
        }
    };

    // Обновленный рендеринг полей с обработкой ошибок
    const renderField = (name, label, type = 'text', extraProps = {}) => {
        const hasError = !!errors[name];
        return (
            <div 
              className={`form-group ${hasError ? 'invalid' : ''}`} 
            >
              <label>{label}:</label>
              <input
                type={type}
                value={formData[name]}
                onChange={(e) => {
                  setFormData({...formData, [name]: e.target.value});
                  setErrors(prev => ({...prev, [name]: ''}));
                }}
                {...extraProps}
              />
              {errors[name] && <span className="error-message">{errors[name]}</span>}
            </div>
        );
    };

    return (
        <div className="movie-form-container">
          <h2>{id ? 'Редактирование фильма' : 'Создание нового фильма'}</h2>
          <form onSubmit={handleSubmit}>
            {renderField('title', 'Название', 'text', { required: true })}
            {renderField('description', 'Описание', 'textarea')}
            {renderField('release_year', 'Год выпуска', 'number', {
              min: 1888,
              max: new Date().getFullYear() + 5
            })}
            {/* {renderField('image', 'Изображение')} */}
            {renderField('trailerid', 'Идентификатор трейлера')}
            {renderField('position', 'Позиция', 'number', { min: 0 })}
            
            {/* Секция выбора жанров */}
            <div className="form-group">
              <label>Жанры:</label>
              <div className="genres-select">
                {genresList.map(genre => (
                  <label key={genre.id} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={(e) => {
                        const newSelection = e.target.checked
                          ? [...selectedGenres, genre.id]
                          : selectedGenres.filter(id => id !== genre.id);
                        setSelectedGenres(newSelection);
                        setErrors(prev => ({...prev, genres: ''}));
                      }}
                    />
                    <span>{genre.name}</span>
                  </label>
                ))}
              </div>
              {errors.genres && <span className="error-message">{errors.genres}</span>}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-save">
                {id ? 'Сохранить изменения' : 'Создать фильм'}
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate('/movies')}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
    );
};

export default MovieFormPage;