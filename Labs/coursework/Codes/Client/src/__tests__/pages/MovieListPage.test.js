import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import MovieListPage from '../../pages/MovieList/MovieListPage';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

// Мокируем сервисы
jest.mock('../../services/movieService', () => ({
  fetchMovies: jest.fn(() => Promise.resolve([
    {
      id: 1,
      title: 'Test Movie',
      description: 'Test Description',
      trailerid: 'abc123',
      release_year: 2020,
      genres: [{ id: 1, name: 'Action' }]
    }
  ])),
  deleteMovie: jest.fn(() => Promise.resolve())
}));

describe('MovieListPage', () => {
  beforeEach(() => {
    // Мокируем контекст аутентификации
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockReturnValue({
      user: { role: 'admin' }
    });
  });

  test('renders movie list', async () => {
    render(
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <MovieListPage />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });
  });

  test('handles delete movie', async () => {
    render(
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <MovieListPage />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    );

    window.confirm = jest.fn(() => true);

    await waitFor(() => {
      fireEvent.click(screen.getByTitle('Удалить'));
    });

    expect(window.confirm).toHaveBeenCalled();
  });
});