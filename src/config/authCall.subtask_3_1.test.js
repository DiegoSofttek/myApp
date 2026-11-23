import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const authInstance = { name: 'firebase-auth' };
  return {
    firebaseApp: { name: 'academia-app' },
    authInstance,
    getAuth: vi.fn(() => authInstance),
    getFirestore: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    onAuthStateChanged: vi.fn(),
  };
});

vi.mock('./firebaseConfig', () => ({ default: mocks.firebaseApp }));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: mocks.getAuth,
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: mocks.getFirestore,
  setDoc: vi.fn(),
}));

import { signInUser, userListener } from './authCall';

describe('Firebase authentication calls (subtask-3-1)', () => {
  beforeEach(() => {
    mocks.signInWithEmailAndPassword.mockReset();
    mocks.onAuthStateChanged.mockReset();
  });

  it('subtask-3-1-TC01 signInUser delegates valid credentials to Firebase authentication', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'user-1' } });

    await expect(signInUser('student@example.com', 'correct-password')).resolves.toBeUndefined();

    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.authInstance,
      'student@example.com',
      'correct-password',
    );
  });

  it('subtask-3-1-TC02 signInUser preserves Firebase authentication failure', async () => {
    const firebaseError = Object.assign(new Error('Invalid credentials'), { code: 'auth/invalid-credential' });
    mocks.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(signInUser('student@example.com', 'wrong-password')).rejects.toBe(firebaseError);
  });

  it('subtask-3-1-TC03 userListener forwards Firebase auth state notifications', () => {
    let firebaseListener;
    mocks.onAuthStateChanged.mockImplementation((_auth, listener) => {
      firebaseListener = listener;
    });
    const listener = vi.fn();

    userListener(listener);

    const authenticatedUser = { uid: 'user-1', email: 'student@example.com' };
    expect(mocks.onAuthStateChanged).toHaveBeenCalledWith(mocks.authInstance, expect.any(Function));
    firebaseListener(authenticatedUser);
    firebaseListener(null);

    expect(listener).toHaveBeenNthCalledWith(1, authenticatedUser);
    expect(listener).toHaveBeenNthCalledWith(2, null);
  });
});
