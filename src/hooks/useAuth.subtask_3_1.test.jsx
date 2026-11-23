// @vitest-environment jsdom
import React, { useContext } from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userListener: vi.fn(),
  logoutFirebase: vi.fn(),
}));

vi.mock('../config/authCall', () => ({
  logoutFirebase: mocks.logoutFirebase,
  userListener: mocks.userListener,
}));

import { AuthContext, AuthProvider } from './useAuth';

function AuthProbe() {
  const { loading, user } = useContext(AuthContext);
  return <output data-testid="auth-state">{JSON.stringify({ user, loading })}</output>;
}

describe('AuthProvider Firebase state synchronization (subtask-3-1)', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('subtask-3-1-TC04 AuthProvider synchronizes authenticated Firebase state and loading state', async () => {
    let authStateListener;
    mocks.userListener.mockImplementation((listener) => {
      authStateListener = listener;
    });
    const user = { uid: 'user-1', email: 'student@example.com' };

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => expect(mocks.userListener).toHaveBeenCalledTimes(1));
    await act(async () => {
      authStateListener(user);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe(JSON.stringify({ user, loading: false }));
    });
    expect(window.localStorage.getItem('user')).toBe(JSON.stringify(user));
  });

  it('subtask-3-1-TC05 AuthProvider synchronizes signed-out Firebase state', async () => {
    let authStateListener;
    mocks.userListener.mockImplementation((listener) => {
      authStateListener = listener;
    });

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => expect(mocks.userListener).toHaveBeenCalledTimes(1));
    await act(async () => {
      authStateListener(null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe(JSON.stringify({ user: null, loading: false }));
    });
  });
});
