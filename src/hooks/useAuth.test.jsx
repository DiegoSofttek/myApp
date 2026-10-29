import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor, renderHook } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './useAuth';
import { logoutFirebase, userListener } from '../config/authCall';

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
  createUser: vi.fn(),
  createUserDocument: vi.fn(),
  logoutFirebase: vi.fn(),
  userListener: vi.fn(),
}));

function Consumer() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'no-user'}</span>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthProvider / useAuth (subtask-1-1, AC-3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  // UT-subtask-1-1-US-1-AC-3 / CTX-01
  it('subscribes to the Firebase listener and stores the user it reports', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');

    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));
    const listener = vi.mocked(userListener).mock.calls[0][0];

    act(() => {
      listener({ uid: 'uid-1', email: 'ana@example.com' });
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('ana@example.com');
  });

  // UT-subtask-1-1-US-1-AC-3 / CTX-01 (logout branch)
  it('logout calls logoutFirebase and clears the stored user', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));
    const listener = vi.mocked(userListener).mock.calls[0][0];
    act(() => {
      listener({ uid: 'uid-1', email: 'ana@example.com' });
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('ana@example.com');

    await user.click(screen.getByRole('button', { name: 'logout' }));

    expect(logoutFirebase).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });
});

describe('AuthProvider auth state (subtask-1-2, US-1 AC-3 / US-2)', () => {
  const fireAuthChange = (value) => {
    const listener = vi.mocked(userListener).mock.calls[0][0];
    act(() => {
      listener(value);
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  // UT-subtask-1-2-US-1-AC-3-02
  it('subscribes to onAuthStateChanged exactly once and does not re-subscribe on re-render', async () => {
    const { rerender } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));
    expect(vi.mocked(userListener).mock.calls[0][0]).toEqual(expect.any(Function));

    rerender(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    fireAuthChange({ uid: 'uid-1', email: 'ana@example.com' });

    expect(userListener).toHaveBeenCalledTimes(1);
  });

  // UT-subtask-1-2-US-1-AC-3-03
  it('stores the signed-in user reported by Firebase and exposes it as authenticated', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));

    const firebaseUser = { uid: 'uid-1', email: 'ana@example.com' };
    fireAuthChange(firebaseUser);

    expect(screen.getByTestId('user-email')).toHaveTextContent('ana@example.com');
    expect(JSON.parse(window.localStorage.getItem('user'))).toEqual(firebaseUser);
  });

  // UT-subtask-1-2-US-1-AC-3-04
  it('exposes an unauthenticated state when Firebase reports null', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));

    fireAuthChange(null);

    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(JSON.parse(window.localStorage.getItem('user'))).toBeNull();
  });

  // UT-subtask-1-2-US-1-AC-3-05
  it('updates the context on each auth change: user -> null -> user', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));

    fireAuthChange({ uid: 'uid-1', email: 'ana@example.com' });
    expect(screen.getByTestId('user-email')).toHaveTextContent('ana@example.com');

    fireAuthChange(null);
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');

    fireAuthChange({ uid: 'uid-2', email: 'bob@example.com' });
    expect(screen.getByTestId('user-email')).toHaveTextContent('bob@example.com');
    expect(screen.getByTestId('user-email')).not.toHaveTextContent('ana@example.com');
  });

  // UT-subtask-1-2-US-1-AC-3-06 (current behavior: persisted user is hydrated; cleared once Firebase reports null)
  it('hydrates a persisted user from localStorage and clears it once Firebase reports signed-out', async () => {
    window.localStorage.setItem('user', JSON.stringify({ uid: 'stale', email: 'stale@example.com' }));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-email')).toHaveTextContent('stale@example.com');

    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));
    fireAuthChange(null);

    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(JSON.parse(window.localStorage.getItem('user'))).toBeNull();
  });

  // UT-subtask-1-2-US-1-AC-3-07
  it('logout calls logoutFirebase once and keeps the unauthenticated state', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));
    fireAuthChange({ uid: 'uid-1', email: 'ana@example.com' });

    await user.click(screen.getByRole('button', { name: 'logout' }));

    expect(logoutFirebase).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(JSON.parse(window.localStorage.getItem('user'))).toBeNull();
  });

  // UT-subtask-1-2-US-1-AC-3-08
  it('useAuth outside AuthProvider returns the default context value (undefined)', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeUndefined();
  });

  // UT-subtask-1-2-US-1-AC-3-09
  it('keeps the same context value across re-renders and changes it only when user changes', async () => {
    const { result, rerender } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));

    const initial = result.current;
    rerender();
    expect(result.current).toBe(initial);

    fireAuthChange({ uid: 'uid-1', email: 'ana@example.com' });
    expect(result.current).not.toBe(initial);
    expect(result.current.user.email).toBe('ana@example.com');
  });

  // UT-subtask-1-2-US-1-AC-3-10
  it('unmounts without errors and does not re-subscribe the listener', async () => {
    const { unmount } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    await waitFor(() => expect(userListener).toHaveBeenCalledTimes(1));

    expect(() => unmount()).not.toThrow();
    expect(userListener).toHaveBeenCalledTimes(1);
  });

  // Loading state (UT-subtask-1-2-US-1-AC-3-01 and loading gate): the provider does not expose
  // a `loading` value yet. These cases are pending until the Fixer phase implements it.
  it.todo('UT-subtask-1-2-US-1-AC-3-01: exposes loading=true with user=null before the first Firebase callback');
  it.todo('UT-subtask-1-2-US-1-AC-3-03b: exposes loading=false once Firebase reports a user');
  it.todo('UT-subtask-1-2-US-1-AC-3-04b: exposes loading=false once Firebase reports null');
  it.todo('UT-subtask-1-2-US-1-AC-3-06b: gates a persisted localStorage user behind loading=true until the first callback');
});
