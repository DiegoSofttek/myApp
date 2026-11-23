// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signInUser: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('../config/authCall', () => ({ signInUser: mocks.signInUser }));
vi.mock('../hooks/useAuth', () => ({ useAuth: mocks.useAuth }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('antd', () => {
  const Input = (props) => <input {...props} />;
  Input.Password = (props) => <input {...props} />;
  return {
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Col: ({ children }) => <div>{children}</div>,
    Input,
    Row: ({ children }) => <div>{children}</div>,
  };
});

import Login from './Login';

describe('Login authentication submission (subtask-3-1)', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ user: null });
  });

  function populateCredentials() {
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'correct-password' } });
  }

  it('subtask-3-1-TC06 Login submits controlled credentials through signInUser', async () => {
    mocks.signInUser.mockResolvedValue(undefined);
    render(<Login />);
    populateCredentials();

    const submitButton = screen.getByRole('button', { name: 'Log In' });
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mocks.signInUser).toHaveBeenCalledTimes(1);
      expect(mocks.signInUser).toHaveBeenCalledWith('student@example.com', 'correct-password');
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('subtask-3-1-TC07 Login handles a rejected authentication attempt without authenticated navigation', async () => {
    mocks.signInUser.mockRejectedValue(new Error('Invalid credentials'));
    render(<Login />);
    populateCredentials();
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => expect(screen.getByText('Error al iniciar sesión')).toBeTruthy());
    expect(mocks.navigate).not.toHaveBeenCalledWith('/home');
    expect(mocks.useAuth).toHaveLastReturnedWith({ user: null });
  });
});
