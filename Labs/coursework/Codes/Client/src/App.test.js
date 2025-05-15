import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

test('renders learn react link', () => {
  render(
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  );
  const linkElement = screen.getByText(/Celeston Theatre/i);
  expect(linkElement).toBeInTheDocument();
});
