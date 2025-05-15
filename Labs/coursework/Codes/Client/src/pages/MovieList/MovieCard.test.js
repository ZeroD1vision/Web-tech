import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieListPage from './MovieListPage';
import { useAuth } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('../../context/AuthContext');
jest.mock('../../services/movieService');

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  description: 'Test Description',
  trailerid: 'abc123',
  image: 'test.jpg',
  release_year: 2020,
  genres: [{ id: 1, name: 'Action' }]
};

describe('MovieCard Component', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: 'admin' } });
  });

  test('renders movie information', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <MovieListPage />
        </NotificationProvider>
      </AuthProvider>, { 
      initialState: { movies: [mockMovie] } 
    });

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Трейлер')).toBeInTheDocument();
  });

  test('shows admin buttons for admin user', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <MovieListPage />
        </NotificationProvider>
      </AuthProvider>, { 
      initialState: { movies: [mockMovie] } 
    });

    expect(screen.getByTitle('Редактировать')).toBeInTheDocument();
    expect(screen.getByTitle('Удалить')).toBeInTheDocument();
  });

  test('handles delete action', async () => {
    const { getByTitle } = render(
      <AuthProvider>
        <NotificationProvider>
          <MovieListPage />
        </NotificationProvider>
      </AuthProvider>, { 
      initialState: { movies: [mockMovie] } 
    });

    window.confirm = jest.fn(() => true);
    fireEvent.click(getByTitle('Удалить'));
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });
  });
});