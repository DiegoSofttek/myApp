// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, waitFor, cleanup } from '@testing-library/react';

const { mockUserListener, mockLogoutFirebase } = vi.hoisted(() => ({
  mockUserListener: vi.fn(),
  mockLogoutFirebase: vi.fn(),
}));

vi.mock('../config/authCall', () => ({
  userListener: mockUserListener,
  logoutFirebase: mockLogoutFirebase,
}));

import { AuthProvider, useAuth } from './useAuth';

// Holds the most recent context value observed by the probe component.
let latest;

const AuthProbe = () => {
  latest = useAuth();
  return null;
};

beforeEach(() => {
  mockUserListener.mockReset();
  mockLogoutFirebase.mockReset();
  window.localStorage.clear();
  latest = undefined;
});

afterEach(() => {
  cleanup();
});

describe('subtask-3-1: useAuth context access', () => {
  it('TC-3-1-06: useAuth returns undefined/default context outside AuthProvider (documented current behavior)', () => {
    render(<AuthProbe />);

    expect(latest).toBeUndefined();
  });
});

describe('subtask-3-1: AuthProvider initial state', () => {
  it('TC-3-1-07: AuthProvider starts with loading=true and user from localStorage default null', () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    expect(latest.user).toBeNull();
    expect(latest.loading).toBe(true);
  });
});

describe('subtask-3-1: AuthProvider Firebase state synchronization', () => {
  it('TC-3-1-08: AuthProvider registers the userListener after mount and sets user when Firebase emits a user', async () => {
    let firebaseListener;
    mockUserListener.mockImplementation((listener) => {
      firebaseListener = listener;
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(mockUserListener).toHaveBeenCalledTimes(1));
    expect(firebaseListener).toEqual(expect.any(Function));

    const firebaseUser = { email: 'ana@test.com' };
    act(() => {
      firebaseListener(firebaseUser);
    });

    expect(latest.user).toEqual(firebaseUser);
    expect(latest.loading).toBe(false);
  });

  it('TC-3-1-09: AuthProvider clears user and loading when Firebase emits null (sign-out or no session)', async () => {
    let firebaseListener;
    mockUserListener.mockImplementation((listener) => {
      firebaseListener = listener;
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(mockUserListener).toHaveBeenCalledTimes(1));

    act(() => {
      firebaseListener({ email: 'ana@test.com' });
    });
    expect(latest.user).toEqual({ email: 'ana@test.com' });

    act(() => {
      firebaseListener(null);
    });

    expect(latest.user).toBeNull();
    expect(latest.loading).toBe(false);
  });
});

describe('subtask-3-1: AuthProvider logout', () => {
  it('TC-3-1-10: AuthProvider logout calls logoutFirebase and sets user to null', async () => {
    let firebaseListener;
    mockUserListener.mockImplementation((listener) => {
      firebaseListener = listener;
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(mockUserListener).toHaveBeenCalledTimes(1));

    act(() => {
      firebaseListener({ email: 'ana@test.com' });
    });
    expect(latest.user).toEqual({ email: 'ana@test.com' });

    act(() => {
      latest.logout();
    });

    expect(mockLogoutFirebase).toHaveBeenCalledTimes(1);
    expect(latest.user).toBeNull();
  });
});
