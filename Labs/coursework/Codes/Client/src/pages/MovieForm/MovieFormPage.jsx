import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { createMovie, updateMovie, getMovieById } from '../../services/movieService';

const MovieFormPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [ formData, setFormData ] = useState({
        title: '',
        description: '',
        image: '',
        trailerid: '',
        position: 0
    });

    useEffect(() => {
        if(id) {
            const fetchMovie = async () => {
                try {
                    const movie = await getMovieById(id);
                    setFormData({
                        title: movie.title || '',
                        description: movie.description || '',
                        image: movie.image || '',
                        trailerid: movie.trailerid || '',
                        position: movie.position || 0
                    });
                } catch (error) {
                    showNotification('Ошибка загрузки фильма', 'error');
                    navigate('/movies');
                }
            };
            fetchMovie();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Current user:', user);

            if (!user?.role || user.role !== 'admin') {
                throw new Error('Недостаточно прав для выполнения операции');
            }

            if (id) {
                await updateMovie(id, formData);
                showNotification('Фильм успешно обновлен', 'success');
            } else {
                await createMovie(formData);
                showNotification('Фильм успешно создан', 'success');
            }
            navigate('/movies');
        } catch (error) {
            console.error('Submission error:', error);
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="movie-form-container">
            <h2>{id ? 'Редактирование фильма' : 'Создание нового фильма'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Название:</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Описание:</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Изображение:</label>
                    <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Идентификатор трейлера:</label>
                    <input
                        type="text"
                        value={formData.trailerid}
                        onChange={(e) => setFormData({ ...formData, trailerid: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Позиция:</label>
                        <input
                            type="number"
                            value={formData.position ?? 0} // Добавить fallback значение
                            onChange={(e) => setFormData({
                                ...formData,
                                position: Number(e.target.value) || 0
                            })}
                            min="0"
                        />
                </div>
                
                <button type="submit">Сохранить</button>
                <button type="button" onClick={() => navigate('/movies')}>Отмена</button>
            </form>
        </div>
    );
};

export default MovieFormPage;