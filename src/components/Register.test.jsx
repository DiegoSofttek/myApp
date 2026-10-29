import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from './Register';
import { createUser } from '../config/authCall';
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

const getNameInput = () => screen.getByPlaceholderText('Nombre');
const getLastnameInput = () => screen.getByPlaceholderText('Apellido');
const getEmailInput = () => screen.getByPlaceholderText('Email');
const getPasswordInput = () => screen.getByPlaceholderText('Password');
const getRegisterButton = () => screen.getByRole('button', { name: /regístrate/i });

describe('Register component (subtask-1-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
  });

  // UT-subtask-1-1-US-1-AC-1 / REG-01
  it('keeps the register button disabled until name, lastname, email and password are filled', async () => {
    const user = userEvent.setup();
    render(<Register />);

    expect(getRegisterButton()).toBeDisabled();

    await user.type(getNameInput(), 'Ana');
    expect(getRegisterButton()).toBeDisabled();

    await user.type(getLastnameInput(), 'Pérez');
    expect(getRegisterButton()).toBeDisabled();

    await user.type(getEmailInput(), 'ana@example.com');
    expect(getRegisterButton()).toBeDisabled();

    await user.type(getPasswordInput(), 'secret123');
    expect(getRegisterButton()).toBeEnabled();
  });

  // UT-subtask-1-1-US-1-AC-1 / REG-02
  it("calls createUser with ('users', email, password, name, lastname) in that order", async () => {
    const user = userEvent.setup();
    vi.mocked(createUser).mockResolvedValue(undefined);
    render(<Register />);

    await user.type(getNameInput(), 'Ana');
    await user.type(getLastnameInput(), 'Pérez');
    await user.type(getEmailInput(), 'ana@example.com');
    await user.type(getPasswordInput(), 'secret123');
    await user.click(getRegisterButton());

    expect(createUser).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledWith(
      'users',
      'ana@example.com',
      'secret123',
      'Ana',
      'Pérez'
    );
  });

  // UT-subtask-1-1-US-1-AC-1 / REG-03
  it('shows the Spanish error message and does not navigate when createUser rejects', async () => {
    const user = userEvent.setup();
    vi.mocked(createUser).mockRejectedValue(new Error('auth/email-already-in-use'));
    render(<Register />);

    await user.type(getNameInput(), 'Ana');
    await user.type(getLastnameInput(), 'Pérez');
    await user.type(getEmailInput(), 'ana@example.com');
    await user.type(getPasswordInput(), 'secret123');
    await user.click(getRegisterButton());

    expect(await screen.findByText('Error al registrate')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // UT-subtask-1-1-US-1-AC-1 / REG-04 (redirect after registration)
  it('redirects to /home once useAuth exposes an authenticated user', () => {
    const { rerender } = render(<Register />);
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'uid-1', email: 'ana@example.com' },
      logout: vi.fn(),
    });
    rerender(<Register />);

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});
