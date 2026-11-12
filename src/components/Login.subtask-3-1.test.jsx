// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import Login from './Login';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

// jsdom does not implement matchMedia, which antd's responsive observer requires.
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

const EMAIL = 'user@test.com';
const PASSWORD = 'secret123';

const getEmailInput = (container) => container.querySelector('#login-email');
const getPasswordInput = (container) => container.querySelector('#login-password');
const getSubmitButton = (container) => container.querySelector('#login-submit-btn');

const fillForm = (container, email = EMAIL, password = PASSWORD) => {
  fireEvent.change(getEmailInput(container), { target: { value: email } });
  fireEvent.change(getPasswordInput(container), { target: { value: password } });
};

describe('subtask-3-1: Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null, loading: false });
    signInUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('AUTH-08: Login submit delegates credentials to signInUser', async () => {
    const { container } = render(<Login />);

    expect(getSubmitButton(container).disabled).toBe(true);

    fillForm(container);
    expect(getSubmitButton(container).disabled).toBe(false);

    fireEvent.click(getSubmitButton(container));

    await waitFor(() => expect(signInUser).toHaveBeenCalledTimes(1));
    expect(signInUser).toHaveBeenCalledWith(EMAIL, PASSWORD);
  });

  it('AUTH-09: Login submit button is disabled until both fields have values', () => {
    const { container } = render(<Login />);

    fireEvent.change(getEmailInput(container), { target: { value: EMAIL } });
    expect(getSubmitButton(container).disabled).toBe(true);

    fireEvent.change(getPasswordInput(container), { target: { value: PASSWORD } });
    expect(getSubmitButton(container).disabled).toBe(false);
  });

  it('AUTH-10: Login shows an error and does not authenticate when signInUser rejects', async () => {
    signInUser.mockRejectedValue(new Error('auth/invalid-credential'));
    const { container } = render(<Login />);

    fillForm(container);
    fireEvent.click(getSubmitButton(container));

    expect(await screen.findByText('Error al iniciar sesión')).toBeTruthy();
    expect(navigateMock).not.toHaveBeenCalledWith('/home');
    // The mocked session stays unauthenticated throughout the failed attempt.
    expect(useAuth.mock.results.every((r) => r.value.user === null)).toBe(true);
  });

  it('AUTH-11: Login navigates to /home only when useAuth reports an authenticated user', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    const first = render(<Login />);
    await act(async () => {});
    expect(navigateMock).not.toHaveBeenCalled();
    first.unmount();

    useAuth.mockReturnValue({ user: { uid: 'u1' }, loading: false });
    render(<Login />);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/home'));
  });

  it('AUTH-12: Login does not render an error before a failed attempt', async () => {
    const { container } = render(<Login />);

    expect(container.querySelector('.error')).toBeNull();

    fillForm(container);
    fireEvent.click(getSubmitButton(container));

    await waitFor(() => expect(signInUser).toHaveBeenCalledTimes(1));
    await act(async () => {});

    expect(container.querySelector('.error')).toBeNull();
    expect(screen.queryByText('Error al iniciar sesión')).toBeNull();
  });
});
