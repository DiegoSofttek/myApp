// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { userListener, logoutFirebase } from '../config/authCall';

vi.mock('../config/authCall', () => ({
  userListener: vi.fn(),
  logoutFirebase: vi.fn(),
}));

const USER = { uid: 'uid-1', email: 'owner@test.com' };

function Consumer() {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={logout}>logout</button>
    </div>
  );
}

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

describe('subtask-3-1: useAuth / AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('TC-3-1-05: AuthProvider subscribes to auth state and reflects the authenticated user', () => {
    let authCallback;
    userListener.mockImplementation((callback) => {
      authCallback = callback;
    });

    renderWithProvider();

    expect(userListener).toHaveBeenCalledTimes(1);
    expect(authCallback).toBeTypeOf('function');

    act(() => {
      authCallback(USER);
    });

    expect(screen.getByTestId('user').textContent).toBe(USER.email);
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('TC-3-1-06: AuthProvider reflects an auth state change to signed-out', () => {
    let authCallback;
    userListener.mockImplementation((callback) => {
      authCallback = callback;
    });

    renderWithProvider();

    act(() => {
      authCallback(USER);
    });
    expect(screen.getByTestId('user').textContent).toBe(USER.email);

    act(() => {
      authCallback(null);
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('TC-3-1-07: initial state before Firebase responds is loading with the user stored in localStorage (or null when none)', () => {
    userListener.mockImplementation(() => {});

    window.localStorage.setItem('user', JSON.stringify(USER));
    const first = renderWithProvider();

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe(USER.email);
    first.unmount();

    window.localStorage.clear();
    renderWithProvider();

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('TC-3-1-08: logout from useAuth calls logoutFirebase once and sets user to null', () => {
    let authCallback;
    userListener.mockImplementation((callback) => {
      authCallback = callback;
    });

    renderWithProvider();
    act(() => {
      authCallback(USER);
    });
    expect(screen.getByTestId('user').textContent).toBe(USER.email);

    act(() => {
      screen.getByText('logout').click();
    });

    expect(logoutFirebase).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('TC-3-1-09: AuthProvider subscribes to the auth listener only once after mount', () => {
    userListener.mockImplementation(() => {});

    renderWithProvider();

    expect(userListener).toHaveBeenCalledTimes(1);
  });
});
