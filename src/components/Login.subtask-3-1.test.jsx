// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import Login from './Login';
import { useAuth } from '../hooks/useAuth';
import { signInUser } from '../config/authCall';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const USER = { uid: 'uid-1', email: 'owner@test.com' };
const EMAIL = 'owner@test.com';
const PASSWORD = 'secret123';
const ERROR_TEXT = 'Error al iniciar sesión';

const getEmailInput = (container) => container.querySelector('#login-email');
const getPasswordInput = (container) => container.querySelector('#login-password');
const getSubmitButton = (container) => container.querySelector('#login-submit-btn');

const fillForm = (container, email, password) => {
  if (email !== undefined) {
    fireEvent.change(getEmailInput(container), { target: { value: email } });
  }
  if (password !== undefined) {
    fireEvent.change(getPasswordInput(container), { target: { value: password } });
  }
};

describe('subtask-3-1: Login', () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });
    }
  });

  beforeEach(() => {
    vi.resetAllMocks();
    useAuth.mockReturnValue({ user: null, loading: false });
    signInUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('TC-3-1-10: submitting the form calls signInUser with the typed email and password', async () => {
    const { container } = render(<Login />);

    fillForm(container, EMAIL, PASSWORD);
    fireEvent.click(getSubmitButton(container));

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledTimes(1);
    });
    expect(signInUser).toHaveBeenCalledWith(EMAIL, PASSWORD);
  });

  it('TC-3-1-11: submit button is disabled until both email and password are filled', () => {
    const { container } = render(<Login />);

    expect(getSubmitButton(container).disabled).toBe(true);

    fillForm(container, EMAIL, undefined);
    expect(getEmailInput(container).value).toBe(EMAIL);
    expect(getSubmitButton(container).disabled).toBe(true);

    fillForm(container, undefined, PASSWORD);
    expect(getSubmitButton(container).disabled).toBe(false);
  });

  it('TC-3-1-12: shows the login error inside .error and does not navigate to /home when signInUser rejects', async () => {
    signInUser.mockRejectedValueOnce(new Error('auth/wrong-password'));
    const { container } = render(<Login />);

    fillForm(container, EMAIL, 'wrong');
    fireEvent.click(getSubmitButton(container));

    expect(await screen.findByText(ERROR_TEXT)).toBeTruthy();
    expect(container.querySelector('.error').textContent).toBe(ERROR_TEXT);
    expect(mockNavigate).not.toHaveBeenCalledWith('/home');
  });

  it('TC-3-1-13: a failed login does not represent the user as authenticated and the error text is the only feedback', async () => {
    signInUser.mockRejectedValueOnce(new Error('auth/wrong-password'));
    const { container } = render(<Login />);

    fillForm(container, EMAIL, 'wrong');
    fireEvent.click(getSubmitButton(container));

    await screen.findByText(ERROR_TEXT);

    expect(useAuth.mock.results.at(-1).value.user).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(container.querySelectorAll('.error').length).toBe(1);
  });

  it('TC-3-1-14: redirects to /home when the auth context reports a user', async () => {
    useAuth.mockReturnValue({ user: USER, loading: false });

    render(<Login />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('TC-3-1-15: does not navigate when no user is present in the auth context', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(<Login />);

    await act(async () => {});

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
