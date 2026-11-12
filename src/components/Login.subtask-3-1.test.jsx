// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Login from './Login';
import { signInUser } from '../config/authCall';
import { useAuth } from '../hooks/useAuth';

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

if (!window.matchMedia) {
  // antd's responsive observer requires matchMedia, which jsdom does not provide.
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

const renderLogin = async () => {
  let view;
  await act(async () => {
    view = render(<Login />);
  });
  return view;
};

const typeInto = (container, selector, value) => {
  const input = container.querySelector(selector);
  fireEvent.change(input, { target: { value } });
};

const getSubmitButton = (container) => container.querySelector('#login-submit-btn');

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ user: null, loading: false });
  signInUser.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe('subtask-3-1: Login submission gating (AC-1)', () => {
  // TC-31-12
  it('TC-31-12: submit button stays disabled until both email and password have values, then becomes enabled', async () => {
    const view = await renderLogin();

    expect(getSubmitButton(view.container).disabled).toBe(true);

    typeInto(view.container, '#login-email', 'ana@test.com');
    expect(getSubmitButton(view.container).disabled).toBe(true);

    typeInto(view.container, '#login-password', 'secret123');
    expect(getSubmitButton(view.container).disabled).toBe(false);
  });
});

describe('subtask-3-1: Login credential delegation and error handling (AC-1, AC-3)', () => {
  // TC-31-13
  it('TC-31-13: clicking submit calls signInUser with the exact typed email and password and shows no error text', async () => {
    const view = await renderLogin();
    typeInto(view.container, '#login-email', 'ana@test.com');
    typeInto(view.container, '#login-password', 'secret123');

    await act(async () => {
      fireEvent.click(getSubmitButton(view.container));
    });

    expect(signInUser).toHaveBeenCalledTimes(1);
    expect(signInUser).toHaveBeenCalledWith('ana@test.com', 'secret123');
    expect(view.container.querySelector('.error')).toBeNull();
  });

  // TC-31-14
  it('TC-31-14: when signInUser rejects, shows the login error, does not navigate and leaves the context user null', async () => {
    signInUser.mockRejectedValue({ code: 'auth/invalid-credential' });
    const authContext = { user: null, loading: false };
    useAuth.mockReturnValue(authContext);
    const view = await renderLogin();
    typeInto(view.container, '#login-email', 'ana@test.com');
    typeInto(view.container, '#login-password', 'wrong');

    await act(async () => {
      fireEvent.click(getSubmitButton(view.container));
    });

    await vi.waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión')).toBeTruthy();
    });
    expect(navigateMock).not.toHaveBeenCalled();
    expect(useAuth().user).toBeNull();
  });
});

describe('subtask-3-1: Login reflects auth context state (AC-2)', () => {
  // TC-31-15
  it('TC-31-15: when the context provides a truthy user, navigates to /home', async () => {
    useAuth.mockReturnValue({ user: { email: 'ana@test.com' }, loading: false });

    await renderLogin();

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  // TC-31-16
  it('TC-31-16: with a null context user, does not navigate on mount', async () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    await renderLogin();

    expect(navigateMock).not.toHaveBeenCalled();
  });

  // TC-31-17
  it('TC-31-17: a successful signInUser submit does not navigate or show an error by itself while the context user stays null', async () => {
    const view = await renderLogin();
    typeInto(view.container, '#login-email', 'ana@test.com');
    typeInto(view.container, '#login-password', 'secret123');

    await act(async () => {
      fireEvent.click(getSubmitButton(view.container));
    });

    expect(signInUser).toHaveBeenCalledWith('ana@test.com', 'secret123');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(view.container.querySelector('.error')).toBeNull();
  });
});
