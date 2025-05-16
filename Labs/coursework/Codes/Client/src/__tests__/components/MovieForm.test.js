import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieFormPage from '../../pages/MovieForm/MovieFormPage';

// Мокируем зависимости
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } })
}));

jest.mock('../../context/NotificationContext', () => ({
  useNotification: () => ({ showNotification: jest.fn() })
}));

jest.mock('../../services/movieService', () => ({
  createMovie: jest.fn(() => Promise.resolve()),
  updateMovie: jest.fn(() => Promise.resolve()),
  getMovieById: jest.fn(() => Promise.resolve({
    title: 'Existing Movie',
    description: 'Existing Description',
    release_year: 2020,
    trailerid: 'test123',
    genre_ids: [1]
  }))
}));

// Мок для window.scrollTo
window.scrollTo = jest.fn();

describe('MovieForm Component', () => {
  beforeEach(() => {
    // Мокаем fetch для жанров
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }]
        })
      })
    );
  });

  test('renders create form with empty fields', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
    
    render(
      <MemoryRouter>
        <MovieFormPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Создание нового фильма')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Название фильма')).toHaveValue('');
    expect(screen.getByPlaceholderText('Описание фильма')).toHaveValue('');
  });

  test('renders edit form with existing data', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: '1' });
    
    render(
      <MemoryRouter>
        <MovieFormPage />
      </MemoryRouter>
    );
  
    // Ждем загрузки данных
    expect(await screen.findByText('Редактирование фильма')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Existing Movie')).toBeInTheDocument();
    expect(await screen.findByText('Action')).toBeInTheDocument();
  });

  test('shows validation errors', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
    
    render(
      <MemoryRouter>
        <MovieFormPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Создать'));

    expect(await screen.findByText('Название обязательно')).toBeInTheDocument();
    expect(screen.getByText('Описание обязательно')).toBeInTheDocument();
  });

  test('submits valid form', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
    
    render(
      <MemoryRouter>
        <MovieFormPage />
      </MemoryRouter>
    );
  
    // Ждем загрузки жанров
    await screen.findByText('Action');
  
    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText('Название фильма'), { 
      target: { value: 'New Movie' } 
    });
    
    fireEvent.change(screen.getByPlaceholderText('Описание фильма'), { 
      target: { value: 'New Description' } 
    });
    
    // Используем data-testid для поля года выпуска
    fireEvent.change(screen.getByTestId('release-year'), { 
      target: { value: '2023' } 
    });
    
    // Для поля трейлера используем поиск по name атрибуту
    fireEvent.change(screen.getByRole('textbox', { name: /идентификатор трейлера/i }), { 
      target: { value: 'new123' } 
    });
    
    fireEvent.click(screen.getByLabelText('Action'));
  
    fireEvent.click(screen.getByText('Создать'));
  
    // Проверяем вызов API
    await waitFor(() => {
      expect(require('../../services/movieService').createMovie).toHaveBeenCalledWith({
        title: 'New Movie',
        description: 'New Description',
        release_year: 2023,
        trailerid: 'new123',
        genres: [1]
      });
    });
  });
});