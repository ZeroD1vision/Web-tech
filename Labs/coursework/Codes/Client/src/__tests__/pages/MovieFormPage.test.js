import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from 'react-final-form';
import MovieFormPage from './MovieFormPage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { AuthProvider } from '../../context/AuthContext';

// Мокируем зависимости
jest.mock('axios', () => ({
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn()
    }))
  }));
jest.mock('../../context/AuthContext');
jest.mock('../../context/NotificationContext');
jest.mock('../../services/movieService');

test('dummy test', () => {
    expect(true).toBe(true);
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: null })
  }));

describe('MovieFormPage Component', () => {
    const mockUser = { role: 'admin' };
    const mockShowNotification = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({ user: mockUser });
        useNotification.mockReturnValue({ showNotification: mockShowNotification });
    });

    test('renders form with all fields', async () => {
        render(
            <AuthProvider>
              <NotificationProvider>
                <MovieFormPage />
              </NotificationProvider>
            </AuthProvider>
          );
        
        expect(screen.getByLabelText('Название')).toBeInTheDocument();
        expect(screen.getByLabelText('Описание')).toBeInTheDocument();
        expect(screen.getByLabelText('Год выпуска')).toBeInTheDocument();
        expect(screen.getByLabelText('Идентификатор трейлера')).toBeInTheDocument();
        expect(screen.getByText('Жанры')).toBeInTheDocument();
    });

    test('shows validation errors', async () => {
        render(
            <AuthProvider>
              <NotificationProvider>
                <MovieFormPage />
              </NotificationProvider>
            </AuthProvider>
          );
        
        fireEvent.click(screen.getByText('Создать'));
        
        await waitFor(() => {
            expect(screen.getByText('Название обязательно')).toBeInTheDocument();
            expect(screen.getByText('Описание обязательно')).toBeInTheDocument();
            expect(screen.getByText('Идентификатор трейлера обязателен')).toBeInTheDocument();
            expect(screen.getByText('Выберите хотя бы один жанр')).toBeInTheDocument();
        });
    });

    test('submits valid form', async () => {
        const { getByLabelText } = render(
            <AuthProvider>
              <NotificationProvider>
                <MovieFormPage />
              </NotificationProvider>
            </AuthProvider>
          );
        
        // Заполняем форму
        fireEvent.change(getByLabelText('Название'), { target: { value: 'Test Movie' } });
        fireEvent.change(getByLabelText('Описание'), { target: { value: 'Test Description' } });
        fireEvent.change(getByLabelText('Год выпуска'), { target: { value: '2020' } });
        fireEvent.change(getByLabelText('Идентификатор трейлера'), { target: { value: '123' } });
        
        // Выбираем жанр
        const firstCheckbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(firstCheckbox);
    
        fireEvent.click(screen.getByText('Создать'));
    
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/movies');
        });
    });
});