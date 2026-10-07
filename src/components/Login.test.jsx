// @ts-nocheck
import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { signInUser } from '../config/authCall';

const mockNavigate = vi.fn();

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
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
  });

  it('UT-SUB-1-US-1-AC-1 does not show an authentication error before submission', () => {
    render(<Login />);

    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeDisabled();
    expect(screen.queryByText('Error al iniciar sesión')).not.toBeInTheDocument();
  });

  it('UT-SUB-1-US-1-AC-1 shows an authentication error when credentials are invalid', async () => {
    signInUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledWith('invalid@example.com', 'wrong-password');
    });

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
  });

  it('UT-SUB-1-US-1-AC-1 does not redirect to /home after an authentication failure', async () => {
    signInUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await screen.findByText('Error al iniciar sesión');

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
