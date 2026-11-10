// Subtask subtask-3-1: authentication delegation (src/config/authCall.js)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const authInstance = vi.hoisted(() => ({ name: 'auth-instance' }));
const firebaseMocks = vi.hoisted(() => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('./firebaseConfig', () => ({ default: { name: 'app' } }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => authInstance),
  signInWithEmailAndPassword: firebaseMocks.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: vi.fn(),
  signOut: firebaseMocks.signOut,
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  addDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

import { signInUser, userListener, logoutFirebase } from './authCall';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subtask-3-1 | authCall', () => {
  it('TC-3-1-01: signInUser calls signInWithEmailAndPassword with the auth instance, email and password, and resolves to undefined', async () => {
    firebaseMocks.signInWithEmailAndPassword.mockResolvedValue({ user: {} });

    await expect(signInUser('user@test.com', 'secret')).resolves.toBeUndefined();

    expect(firebaseMocks.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(firebaseMocks.signInWithEmailAndPassword).toHaveBeenCalledWith(authInstance, 'user@test.com', 'secret');
  });

  it('TC-3-1-02: signInUser rethrows the Firebase error when signInWithEmailAndPassword rejects', async () => {
    const firebaseError = { code: 'auth/invalid-credential' };
    firebaseMocks.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(signInUser('user@test.com', 'wrong')).rejects.toBe(firebaseError);
  });

  it('TC-3-1-03: userListener registers onAuthStateChanged and forwards the user, including null, to the listener', () => {
    const listener = vi.fn();

    userListener(listener);

    expect(firebaseMocks.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(firebaseMocks.onAuthStateChanged.mock.calls[0][0]).toBe(authInstance);
    const authCallback = firebaseMocks.onAuthStateChanged.mock.calls[0][1];

    const user = { email: 'user@test.com' };
    authCallback(user);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(user);

    authCallback(null);
    expect(listener).toHaveBeenLastCalledWith(null);
  });

  it('TC-3-1-04: logoutFirebase calls signOut once with the auth instance and does not log on resolve', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const signOutPromise = Promise.resolve();
    firebaseMocks.signOut.mockReturnValueOnce(signOutPromise);

    expect(() => logoutFirebase()).not.toThrow();
    // The .then handler is registered before this await, so it has run once the await resumes.
    await signOutPromise;

    expect(firebaseMocks.signOut).toHaveBeenCalledTimes(1);
    expect(firebaseMocks.signOut).toHaveBeenCalledWith(authInstance);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('TC-3-1-05: logoutFirebase logs the error and does not throw when signOut rejects', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const signOutError = new Error('sign-out failed');
    firebaseMocks.signOut.mockReturnValueOnce(Promise.reject(signOutError));

    expect(() => logoutFirebase()).not.toThrow();

    // The .catch handler runs asynchronously; poll until the logged error appears.
    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledWith(signOutError));
  });
});
