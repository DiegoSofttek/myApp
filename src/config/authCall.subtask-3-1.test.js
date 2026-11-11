import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { AUTH, DB, mockSignInWithEmailAndPassword, mockSignOut, mockOnAuthStateChanged } = vi.hoisted(() => ({
  AUTH: { name: 'auth-instance' },
  DB: { name: 'db-instance' },
  mockSignInWithEmailAndPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockOnAuthStateChanged: vi.fn(),
}));

vi.mock('./firebaseConfig', () => ({
  default: { name: 'firebase-app' },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => AUTH),
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: vi.fn(),
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => DB),
  addDoc: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
}));

import { signInUser, logoutFirebase, userListener } from './authCall';

const EMAIL = 'user@test.com';
const PASSWORD = 'secret123';
const USER = { uid: 'uid-1', email: EMAIL };

describe('subtask-3-1: authCall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-3-1-01: signInUser delegates to signInWithEmailAndPassword with the auth instance and credentials and resolves', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: USER });

    await expect(signInUser(EMAIL, PASSWORD)).resolves.not.toThrow();

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(AUTH, EMAIL, PASSWORD);
  });

  it('TC-3-1-02: signInUser rejects with the same error object when Firebase rejects', async () => {
    const firebaseError = Object.assign(new Error('Firebase: Error (auth/wrong-password).'), {
      code: 'auth/wrong-password',
    });
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(firebaseError);

    await expect(signInUser(EMAIL, 'wrong')).rejects.toBe(firebaseError);
  });

  it('TC-3-1-03: userListener forwards Firebase auth state (user object and null) to the supplied listener', () => {
    let firebaseCallback;
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      firebaseCallback = callback;
    });
    const listener = vi.fn();

    userListener(listener);

    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(AUTH, expect.any(Function));

    firebaseCallback(USER);
    expect(listener).toHaveBeenLastCalledWith(USER);

    firebaseCallback(null);
    expect(listener).toHaveBeenLastCalledWith(null);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('TC-3-1-04: logoutFirebase calls signOut once with the auth instance and catches a rejected signOut, logging it', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    expect(() => logoutFirebase()).not.toThrow();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith(AUTH);

    const signOutError = new Error('sign-out failed');
    mockSignOut.mockRejectedValueOnce(signOutError);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => logoutFirebase()).not.toThrow();

    await vi.waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(signOutError);
    });
  });
});
