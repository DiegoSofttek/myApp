import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import Login from './Login';

const mockNavigate = vi.fn();
const mockSignInUser = vi.fn();

vi.mock('../config/authCall', () => ({
  signInUser: (...args) => mockSignInUser(...args),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

function renderLogin() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<Login />);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function getEmailInput(container) {
  return container.querySelector('#login-email');
}

function getPasswordInput(container) {
  return container.querySelector('#login-password');
}

function getSubmitButton(container) {
  return container.querySelector('#login-submit-btn');
}

describe('TASK-1 / SUB-1 Login incorrect credentials', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSignInUser.mockReset();
    document.body.innerHTML = '';
  });

  it('UT-SUB-1-US-1-AC-1 calls signInUser with entered credentials and displays authentication error after rejection', async () => {
    mockSignInUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { container, unmount } = renderLogin();
    const emailInput = getEmailInput(container);
    const passwordInput = getPasswordInput(container);
    const submitButton = getSubmitButton(container);

    await act(async () => {
      emailInput.value = 'user@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.value = 'wrong-password';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockSignInUser).toHaveBeenCalledWith('user@example.com', 'wrong-password');
    expect(container.textContent).toContain('Error al iniciar sesión');

    unmount();
  });

  it('UT-SUB-1-US-1-AC-1 does not navigate to home when signInUser rejects', async () => {
    mockSignInUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { container, unmount } = renderLogin();
    const emailInput = getEmailInput(container);
    const passwordInput = getPasswordInput(container);
    const submitButton = getSubmitButton(container);

    await act(async () => {
      emailInput.value = 'user@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.value = 'wrong-password';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    unmount();
  });

  it('UT-SUB-1-US-1-AC-1 preserves entered values and keeps the form visible after a failed login attempt', async () => {
    mockSignInUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { container, unmount } = renderLogin();
    const emailInput = getEmailInput(container);
    const passwordInput = getPasswordInput(container);
    const submitButton = getSubmitButton(container);

    await act(async () => {
      emailInput.value = 'user@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.value = 'wrong-password';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(getEmailInput(container)?.value).toBe('user@example.com');
    expect(getPasswordInput(container)?.value).toBe('wrong-password');
    expect(getSubmitButton(container)).not.toBeNull();
    expect(container.textContent).toContain('Log In');

    unmount();
  });
});
