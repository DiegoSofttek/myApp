// @vitest-environment jsdom
// Subtask subtask-3-1: auth state synchronization (src/hooks/useAuth.jsx)
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';

const authCallMocks = vi.hoisted(() => ({
  userListener: vi.fn(),
  logoutFirebase: vi.fn(),
}));

vi.mock('../config/authCall', () => authCallMocks);

import { AuthProvider, useAuth } from './useAuth';

function Consumer() {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('subtask-3-1 | useAuth', () => {
  it('TC-3-1-06: AuthProvider starts with loading true and no user before the Firebase listener fires', () => {
    renderWithProvider();

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('TC-3-1-07: AuthProvider sets the user and clears loading when the Firebase listener fires with a user', async () => {
    renderWithProvider();

    await waitFor(() => expect(authCallMocks.userListener).toHaveBeenCalledTimes(1));
    const listener = authCallMocks.userListener.mock.calls[0][0];

    act(() => {
      listener({ email: 'user@test.com' });
    });

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('user@test.com'));
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('TC-3-1-08: AuthProvider clears the user when the Firebase listener fires with null after a previous user', async () => {
    renderWithProvider();

    await waitFor(() => expect(authCallMocks.userListener).toHaveBeenCalledTimes(1));
    const listener = authCallMocks.userListener.mock.calls[0][0];

    act(() => {
      listener({ email: 'user@test.com' });
    });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('user@test.com'));

    act(() => {
      listener(null);
    });

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('none'));
    expect(JSON.parse(window.localStorage.getItem('user'))).toBeNull();
  });

  it('TC-3-1-09: logout from useAuth calls logoutFirebase and clears the user immediately', async () => {
    renderWithProvider();

    await waitFor(() => expect(authCallMocks.userListener).toHaveBeenCalledTimes(1));
    const listener = authCallMocks.userListener.mock.calls[0][0];
    act(() => {
      listener({ email: 'user@test.com' });
    });
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('user@test.com'));

    act(() => {
      screen.getByText('logout').click();
    });

    expect(authCallMocks.logoutFirebase).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});
