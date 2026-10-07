import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Login from './Login';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';

const mockNavigate = vi.fn();

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TASK-1 / SUB-1 Login incorrect credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null, loading: false, logout: vi.fn() });
  });

  it('UT-SUB-1-US-1-AC-1 should forward typed credentials, show auth error, and avoid navigation on failed login', async () => {
    signInUser.mockRejectedValue(new Error('Invalid credentials'));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'bad-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledWith('wrong@example.com', 'bad-password');
      expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('UT-SUB-1-US-1-AC-1 should keep submit disabled until both fields have values and show the error after rejected auth', async () => {
    signInUser.mockRejectedValue(new Error('Invalid credentials'));

    render(<Login />);

    const submitButton = screen.getByRole('button', { name: 'Log In' });
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(submitButton).toBeDisabled();

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(passwordInput, { target: { value: 'bad-password' } });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
    expect(signInUser).toHaveBeenCalledTimes(1);
  });

  it('UT-SUB-1-US-1-AC-1 should remain on login state without redirect when authentication fails', async () => {
    signInUser.mockRejectedValue(new Error('Invalid credentials'));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'bad-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith('/home');
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });
});
