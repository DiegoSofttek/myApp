// @vitest-environment jsdom
// Subtask subtask-3-1: login submission and error handling (src/components/Login.jsx)
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';

const authState = vi.hoisted(() => ({ user: null, loading: false }));
const navigateMock = vi.hoisted(() => vi.fn());
const authCallMocks = vi.hoisted(() => ({ signInUser: vi.fn() }));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('../config/authCall', () => authCallMocks);

import Login from './Login';

beforeAll(() => {
  // Antd responsive helpers read window.matchMedia, which jsdom does not provide.
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
  authState.user = null;
  authState.loading = false;
  authCallMocks.signInUser.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

function fillCredentials(email, password) {
  if (email !== undefined) {
    fireEvent.change(document.querySelector('#login-email'), { target: { value: email } });
  }
  if (password !== undefined) {
    fireEvent.change(document.querySelector('#login-password'), { target: { value: password } });
  }
}

describe('subtask-3-1 | Login', () => {
  it('TC-3-1-10: submitting filled credentials calls signInUser with the entered email and password', async () => {
    render(<Login />);

    fillCredentials('user@test.com', 'secret');
    fireEvent.click(document.querySelector('#login-submit-btn'));

    await waitFor(() => expect(authCallMocks.signInUser).toHaveBeenCalledWith('user@test.com', 'secret'));
    expect(authCallMocks.signInUser).toHaveBeenCalledTimes(1);
  });

  it('TC-3-1-11: the submit button stays disabled until both email and password have values', async () => {
    render(<Login />);

    const button = document.querySelector('#login-submit-btn');
    expect(button.disabled).toBe(true);

    fillCredentials('user@test.com', undefined);
    await waitFor(() => expect(document.querySelector('#login-submit-btn').disabled).toBe(true));
    expect(authCallMocks.signInUser).not.toHaveBeenCalled();

    fillCredentials(undefined, 'secret');
    await waitFor(() => expect(document.querySelector('#login-submit-btn').disabled).toBe(false));
  });

  it('TC-3-1-12: shows the error message and does not navigate when signInUser rejects', async () => {
    authCallMocks.signInUser.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    render(<Login />);

    fillCredentials('user@test.com', 'wrong');
    fireEvent.click(document.querySelector('#login-submit-btn'));

    expect(await screen.findByText('Error al iniciar sesión')).toBeTruthy();
    expect(document.querySelector('.error').textContent).toBe('Error al iniciar sesión');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(authState.user).toBeNull();
  });

  it('TC-3-1-13: on failure the login form never navigates to /home and the user is not authenticated', async () => {
    authCallMocks.signInUser.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    const { rerender } = render(<Login />);

    fillCredentials('user@test.com', 'wrong');
    fireEvent.click(document.querySelector('#login-submit-btn'));

    await screen.findByText('Error al iniciar sesión');
    rerender(<Login />);

    expect(authState.user).toBeNull();
    expect(navigateMock).not.toHaveBeenCalledWith('/home');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('TC-3-1-14: navigates to /home when the auth user becomes truthy', async () => {
    authState.user = { email: 'user@test.com' };

    render(<Login />);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/home'));
  });

  it('TC-3-1-15: a successful login shows no error and does not navigate before the auth state changes', async () => {
    authCallMocks.signInUser.mockResolvedValueOnce(undefined);
    render(<Login />);

    fillCredentials('user@test.com', 'secret');
    fireEvent.click(document.querySelector('#login-submit-btn'));

    await waitFor(() => expect(authCallMocks.signInUser).toHaveBeenCalledWith('user@test.com', 'secret'));
    expect(document.querySelector('.error')).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
