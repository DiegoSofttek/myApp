import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
  createUser: vi.fn(),
  createUserDocument: vi.fn(),
  logoutFirebase: vi.fn(),
  userListener: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const getEmailInput = () => screen.getByPlaceholderText('Email');
const getPasswordInput = () => screen.getByPlaceholderText('Password');
const getLoginButton = () => screen.getByRole('button', { name: /log in/i });

describe('Login component (subtask-1-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
  });

  // UT-subtask-1-1-US-1-AC-2 / LOGIN-01
  it('keeps the login button disabled until both email and password are filled', async () => {
    const user = userEvent.setup();
    render(<Login />);

    expect(getLoginButton()).toBeDisabled();

    await user.type(getEmailInput(), 'ana@example.com');
    expect(getLoginButton()).toBeDisabled();

    await user.type(getPasswordInput(), 'secret123');
    expect(getLoginButton()).toBeEnabled();
  });

  // UT-subtask-1-1-US-1-AC-2 / LOGIN-02
  it('calls signInUser with the typed email and password on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(signInUser).mockResolvedValue(undefined);
    render(<Login />);

    await user.type(getEmailInput(), 'ana@example.com');
    await user.type(getPasswordInput(), 'secret123');
    await user.click(getLoginButton());

    expect(signInUser).toHaveBeenCalledTimes(1);
    expect(signInUser).toHaveBeenCalledWith('ana@example.com', 'secret123');
  });

  // UT-subtask-1-1-US-1-AC-2 / LOGIN-03
  it('shows the Spanish error message and does not navigate when signInUser rejects', async () => {
    const user = userEvent.setup();
    vi.mocked(signInUser).mockRejectedValue(new Error('auth/invalid-credential'));
    render(<Login />);

    await user.type(getEmailInput(), 'ana@example.com');
    await user.type(getPasswordInput(), 'wrong');
    await user.click(getLoginButton());

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // UT-subtask-1-1-US-1-AC-2 / LOGIN-04
  it('redirects to /home once useAuth exposes an authenticated user', () => {
    const { rerender } = render(<Login />);
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'uid-1', email: 'ana@example.com' },
      logout: vi.fn(),
    });
    rerender(<Login />);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  // UT-subtask-1-1-US-1-AC-2 / LOGIN-05
  it('does not redirect on mount when there is no user', () => {
    render(<Login />);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText('Error al iniciar sesión')).not.toBeInTheDocument();
  });
});
