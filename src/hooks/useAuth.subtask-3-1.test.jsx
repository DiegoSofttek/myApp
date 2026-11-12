// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { userListener, logoutFirebase } from '../config/authCall';

vi.mock('../config/authCall', () => ({
  userListener: vi.fn(),
  logoutFirebase: vi.fn(),
}));

const USER = { uid: 'u1', email: 'owner@test.com' };

let latest;
function Consumer() {
  latest = useAuth();
  return null;
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );

describe('subtask-3-1: useAuth', () => {
  let listenerRef;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    latest = undefined;
    listenerRef = undefined;
    userListener.mockImplementation((listener) => {
      listenerRef = listener;
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('AUTH-05: useAuth AuthProvider syncs the user from the Firebase listener', () => {
    renderProvider();

    expect(userListener).toHaveBeenCalledTimes(1);
    expect(latest.loading).toBe(true);
    expect(latest.user).toBeNull();

    act(() => {
      listenerRef(USER);
    });

    expect(latest.user).toEqual(USER);
    expect(latest.loading).toBe(false);
  });

  it('AUTH-06: useAuth reflects sign-out from the Firebase listener', () => {
    renderProvider();

    act(() => {
      listenerRef(USER);
    });
    expect(latest.user).toEqual(USER);

    act(() => {
      listenerRef(null);
    });

    expect(latest.user).toBeNull();
    expect(latest.loading).toBe(false);
  });

  it('AUTH-07: useAuth logout delegates to logoutFirebase and clears user', () => {
    renderProvider();

    act(() => {
      listenerRef(USER);
    });
    expect(latest.user).toEqual(USER);

    act(() => {
      latest.logout();
    });

    expect(logoutFirebase).toHaveBeenCalledTimes(1);
    expect(latest.user).toBeNull();
  });
});
