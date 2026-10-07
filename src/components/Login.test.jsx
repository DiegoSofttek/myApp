import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import * as authCall from '../config/authCall';

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

describe('TASK-1 / SUB-1 / UT-SUB-1-US-1-AC-1 Login invalid credentials', () => {
  let container;
  let root;

  const getEmailInput = () => container.querySelector('#login-email');
  const getPasswordInput = () => container.querySelector('#login-password input') ?? container.querySelector('#login-password');
  const getSubmitButton = () => container.querySelector('#login-submit-btn');

  const dispatchInput = async (element, value) => {
    await act(async () => {
      const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    mockNavigate.mockReset();
    vi.mocked(authCall.signInUser).mockReset();

    await act(async () => {
      root.render(<Login />);
    });
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('SUB-1-TC-01 does not show authentication error initially and keeps submit disabled until both fields are completed', async () => {
    expect(container.textContent).not.toContain('Error al iniciar sesión');
    expect(getSubmitButton().disabled).toBe(true);

    await dispatchInput(getEmailInput(), 'invalid@example.com');
    expect(getSubmitButton().disabled).toBe(true);

    await dispatchInput(getPasswordInput(), 'bad-password');
    expect(getSubmitButton().disabled).toBe(false);
  });

  it('SUB-1-TC-02 calls signInUser exactly once with the entered invalid credentials', async () => {
    vi.mocked(authCall.signInUser).mockRejectedValueOnce(new Error('invalid credentials'));

    await dispatchInput(getEmailInput(), 'invalid@example.com');
    await dispatchInput(getPasswordInput(), 'bad-password');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(authCall.signInUser).toHaveBeenCalledTimes(1);
    expect(authCall.signInUser).toHaveBeenCalledWith('invalid@example.com', 'bad-password');
  });

  it('SUB-1-TC-03 renders the visible authentication error message after a failed login', async () => {
    vi.mocked(authCall.signInUser).mockRejectedValueOnce(new Error('invalid credentials'));

    await dispatchInput(getEmailInput(), 'invalid@example.com');
    await dispatchInput(getPasswordInput(), 'bad-password');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(container.textContent).toContain('Error al iniciar sesión');
  });

  it('SUB-1-TC-04 does not navigate to /home when authentication fails', async () => {
    vi.mocked(authCall.signInUser).mockRejectedValueOnce(new Error('invalid credentials'));

    await dispatchInput(getEmailInput(), 'invalid@example.com');
    await dispatchInput(getPasswordInput(), 'bad-password');

    await act(async () => {
      getSubmitButton().click();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/home');
  });
});
