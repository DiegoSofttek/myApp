// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react';

const { mockUseAuth, mockNavigate, mockSignInUser } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockNavigate: vi.fn(),
  mockSignInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../config/authCall', () => ({
  signInUser: mockSignInUser,
}));

import Login from './Login';

const EMAIL = 'ana@test.com';
const PASSWORD = 'secret';
const ERROR_TEXT = 'Error al iniciar sesión';

beforeAll(() => {
  // jsdom does not implement matchMedia, which antd's responsive Row/Col relies on.
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
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: null });
  mockSignInUser.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

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

describe('subtask-3-1: Login submission', () => {
  it('TC-3-1-11: Login submit calls signInUser with the typed email and password', async () => {
    const { container } = render(<Login />);

    fillForm(container, EMAIL, PASSWORD);

    await act(async () => {
      fireEvent.click(getSubmitButton(container));
    });

    expect(mockSignInUser).toHaveBeenCalledTimes(1);
    expect(mockSignInUser).toHaveBeenCalledWith(EMAIL, PASSWORD);
  });

  it('TC-3-1-12: Login submit button is disabled until both email and password are entered', () => {
    const { container } = render(<Login />);

    expect(getSubmitButton(container).disabled).toBe(true);

    fillForm(container, EMAIL, undefined);
    expect(getSubmitButton(container).disabled).toBe(true);

    fillForm(container, undefined, PASSWORD);
    expect(getSubmitButton(container).disabled).toBe(false);
  });

  it('TC-3-1-16: Login clears nothing on success path and does not show error when signInUser resolves', async () => {
    mockSignInUser.mockResolvedValue(undefined);
    const { container } = render(<Login />);

    fillForm(container, EMAIL, PASSWORD);

    await act(async () => {
      fireEvent.click(getSubmitButton(container));
    });

    expect(mockSignInUser).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(ERROR_TEXT)).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('subtask-3-1: Login error handling', () => {
  it('TC-3-1-13: Login shows the error message and does not navigate when signInUser rejects', async () => {
    mockSignInUser.mockRejectedValue({ code: 'auth/invalid-credential' });
    const { container } = render(<Login />);

    fillForm(container, EMAIL, 'wrong');

    await act(async () => {
      fireEvent.click(getSubmitButton(container));
    });

    await waitFor(() => expect(screen.getByText(ERROR_TEXT)).toBeTruthy());

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('TC-3-1-15: Login does not show an error or navigate before a submission attempt', () => {
    render(<Login />);

    expect(screen.queryByText(ERROR_TEXT)).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('subtask-3-1: Login auth state navigation', () => {
  it('TC-3-1-14: Login navigates to /home when useAuth reports an authenticated user', async () => {
    mockUseAuth.mockReturnValue({ user: { email: EMAIL } });

    render(<Login />);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'));
  });
});
