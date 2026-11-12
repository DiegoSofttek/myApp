// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { userListener, logoutFirebase } from '../config/authCall';

vi.mock('../config/authCall', () => ({
  userListener: vi.fn(),
  logoutFirebase: vi.fn(),
}));

const user = { uid: 'u1', email: 'ana@test.com' };

let latest;

function Consumer() {
  latest = useAuth();
  return (
    <div>
      <span data-testid="user">{latest.user ? latest.user.email : 'none'}</span>
      <span data-testid="loading">{String(latest.loading)}</span>
    </div>
  );
}

const renderProvider = async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
  });
};

const getCapturedListener = () => userListener.mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  latest = undefined;
});

afterEach(() => {
  cleanup();
});

describe('subtask-3-1: AuthProvider initial state and listener registration (AC-2)', () => {
  // TC-31-08
  it('TC-31-08: starts with user null and loading true, and registers the auth listener once after mount', async () => {
    await renderProvider();

    expect(latest.user).toBeNull();
    expect(latest.loading).toBe(true);
    expect(userListener).toHaveBeenCalledTimes(1);
  });
});

describe('subtask-3-1: AuthProvider syncs with Firebase auth state (AC-2)', () => {
  // TC-31-09
  it('TC-31-09: when the captured listener emits a user, context user equals that user and loading becomes false', async () => {
    await renderProvider();
    const listener = getCapturedListener();

    await act(async () => {
      listener(user);
    });

    await vi.waitFor(() => {
      expect(latest.loading).toBe(false);
    });
    expect(latest.user).toEqual(user);
    expect(screen.getByTestId('user').textContent).toBe(user.email);
  });

  // TC-31-10
  it('TC-31-10: when the captured listener emits null after a user was set, context user becomes null and loading is false', async () => {
    await renderProvider();
    const listener = getCapturedListener();

    await act(async () => {
      listener(user);
    });
    await vi.waitFor(() => {
      expect(latest.user).toEqual(user);
    });

    await act(async () => {
      listener(null);
    });

    await vi.waitFor(() => {
      expect(latest.user).toBeNull();
    });
    expect(latest.loading).toBe(false);
  });
});

describe('subtask-3-1: AuthProvider logout synchronizes state (AC-2)', () => {
  // TC-31-11
  it('TC-31-11: logout calls logoutFirebase once and sets context user to null', async () => {
    window.localStorage.setItem('user', JSON.stringify(user));
    await renderProvider();
    expect(latest.user).toEqual(user);

    act(() => {
      latest.logout();
    });

    expect(logoutFirebase).toHaveBeenCalledTimes(1);
    expect(latest.user).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});
