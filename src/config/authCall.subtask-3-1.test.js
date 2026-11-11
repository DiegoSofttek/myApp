import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
  mockAuth,
  mockSignInWithEmailAndPassword,
  mockOnAuthStateChanged,
  mockGetAuth,
} = vi.hoisted(() => {
  const mockAuth = { name: 'auth-instance' };
  return {
    mockAuth,
    mockSignInWithEmailAndPassword: vi.fn(),
    mockOnAuthStateChanged: vi.fn(),
    mockGetAuth: vi.fn(() => mockAuth),
  };
});

vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  setDoc: vi.fn(),
}));

vi.mock('./firebaseConfig', () => ({
  default: { name: 'firebase-app' },
}));

import { signInUser, userListener } from './authCall';

beforeEach(() => {
  mockSignInWithEmailAndPassword.mockReset();
  mockOnAuthStateChanged.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('subtask-3-1: authCall sign-in delegation', () => {
  it('TC-3-1-01: authCall.signInUser delegates to Firebase signInWithEmailAndPassword with the auth instance, email, and password', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { email: 'ana@test.com' } });

    const result = await signInUser('ana@test.com', 'secret');

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'ana@test.com', 'secret');
    expect(result).toBeUndefined();
  });

  it('TC-3-1-02: authCall.signInUser rethrows the Firebase error when sign-in fails', async () => {
    const firebaseError = { code: 'auth/invalid-credential' };
    mockSignInWithEmailAndPassword.mockRejectedValue(firebaseError);

    let caught;
    try {
      await signInUser('ana@test.com', 'wrong');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(firebaseError);
  });
});

describe('subtask-3-1: authCall auth state listener', () => {
  it('TC-3-1-03: authCall.userListener forwards Firebase onAuthStateChanged user to the listener', () => {
    const listener = vi.fn();
    mockOnAuthStateChanged.mockImplementation(() => {});

    userListener(listener);

    const firebaseCallback = mockOnAuthStateChanged.mock.calls[0][1];
    const user = { email: 'ana@test.com', uid: 'uid-1' };

    firebaseCallback(user);
    firebaseCallback(null);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0]).toBe(user);
    expect(listener.mock.calls[1][0]).toBeNull();
  });

  it('TC-3-1-04: authCall.userListener registers exactly one onAuthStateChanged subscription on the auth instance', () => {
    userListener(vi.fn());

    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
  });
});
