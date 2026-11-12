import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAuth, mockDb, signInMock, signOutMock, onAuthStateChangedMock } = vi.hoisted(() => ({
  mockAuth: { name: 'mock-auth' },
  mockDb: { name: 'mock-db' },
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  onAuthStateChangedMock: vi.fn(),
}));

vi.mock('./firebaseConfig', () => ({
  default: { name: 'mock-app' },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: signInMock,
  createUserWithEmailAndPassword: vi.fn(),
  signOut: signOutMock,
  onAuthStateChanged: onAuthStateChangedMock,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  addDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

import { signInUser, logoutFirebase, userListener } from './authCall';

describe('subtask-3-1: authCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  it('AUTH-01: authCall.signInUser delegates to Firebase with the auth instance and the given credentials', async () => {
    signInMock.mockResolvedValue({ user: { uid: 'u1' } });

    await expect(signInUser('user@test.com', 'secret')).resolves.toBeUndefined();

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith(mockAuth, 'user@test.com', 'secret');
  });

  it('AUTH-02: authCall.signInUser propagates Firebase errors', async () => {
    const firebaseError = Object.assign(new Error('auth/wrong-password'), { code: 'auth/wrong-password' });
    signInMock.mockRejectedValue(firebaseError);

    let caught;
    try {
      await signInUser('user@test.com', 'bad');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBe(firebaseError);
  });

  it('AUTH-03: authCall.userListener forwards Firebase auth state to the listener', () => {
    let capturedCallback;
    onAuthStateChangedMock.mockImplementation((_auth, cb) => {
      capturedCallback = cb;
    });
    const listener = vi.fn();

    userListener(listener);

    expect(onAuthStateChangedMock).toHaveBeenCalledWith(mockAuth, expect.any(Function));

    const user = { uid: 'u1', email: 'user@test.com' };
    capturedCallback(user);
    expect(listener).toHaveBeenLastCalledWith(user);

    capturedCallback(null);
    expect(listener).toHaveBeenLastCalledWith(null);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('AUTH-04: authCall.logoutFirebase calls Firebase signOut', async () => {
    const error = new Error('sign-out failed');
    signOutMock.mockRejectedValue(error);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => logoutFirebase()).not.toThrow();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledWith(mockAuth);

    // The catch handler runs asynchronously; wait for it before asserting the log.
    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledWith(error));
  });
});
