import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import Login from './Login';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('TASK-1 / SUB-1 Login error', () => {
  let container;
  let root;
  let navigateMock;

  const renderLogin = async () => {
    await act(async () => {
      root.render(<Login />);
    });
  };

  const getEmailInput = () => container.querySelector('#login-email');
  const getPasswordInput = () => container.querySelector('#login-password');
  const getSubmitButton = () => container.querySelector('#login-submit-btn');

  const changeInputValue = async (input, value) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
    root = createRoot(container);
    navigateMock = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      logout: vi.fn(),
    });
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(signInUser).mockReset();
  });

  it('SUB-1-TC-01 renders with submit disabled when email and password are empty', async () => {
    await renderLogin();

    expect(getSubmitButton().disabled).toBe(true);
  });

  it('SUB-1-TC-02 entering email and password enables submit', async () => {
    await renderLogin();

    await changeInputValue(getEmailInput(), 'user@example.com');
    await changeInputValue(getPasswordInput(), 'invalid-password');

    expect(getEmailInput().value).toBe('user@example.com');
    expect(getPasswordInput().value).toBe('invalid-password');
    expect(getSubmitButton().disabled).toBe(false);
  });

  it('SUB-1-TC-03 shows the expected error message when invalid credentials are rejected', async () => {
    vi.mocked(signInUser).mockRejectedValueOnce(new Error('invalid credentials'));
    await renderLogin();

    await changeInputValue(getEmailInput(), 'user@example.com');
    await changeInputValue(getPasswordInput(), 'wrong-pass');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(container.textContent).toContain('Error al iniciar sesión');
  });

  it('SUB-1-TC-04 sends invalid credentials through the auth contract once', async () => {
    vi.mocked(signInUser).mockRejectedValueOnce(new Error('invalid credentials'));
    await renderLogin();

    await changeInputValue(getEmailInput(), 'user@example.com');
    await changeInputValue(getPasswordInput(), 'wrong-pass');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(signInUser).toHaveBeenCalledTimes(1);
    expect(signInUser).toHaveBeenCalledWith('user@example.com', 'wrong-pass');
  });

  it('SUB-1-TC-05 does not redirect to /home when login fails', async () => {
    vi.mocked(signInUser).mockRejectedValueOnce(new Error('invalid credentials'));
    await renderLogin();

    await changeInputValue(getEmailInput(), 'user@example.com');
    await changeInputValue(getPasswordInput(), 'wrong-pass');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(navigateMock).not.toHaveBeenCalledWith('/home');
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
