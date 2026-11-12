import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockAuth, mockDb, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setDoc, doc, getFirestore } = vi.hoisted(() => {
  const mockAuth = { name: 'auth-instance' };
  const mockDb = { name: 'db-instance' };
  return {
    mockAuth,
    mockDb,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(() => ({ path: 'doc-ref' })),
    getFirestore: vi.fn(() => mockDb),
  };
});

vi.mock('./firebaseConfig', () => ({
  default: { name: 'firebase-app' },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore,
  doc,
  setDoc,
  addDoc: vi.fn(),
}));

import {
  signInUser,
  createUser,
  logoutFirebase,
  userListener,
} from './authCall';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('subtask-3-1: authCall sign-in delegation (AC-1, AC-3)', () => {
  // TC-31-01
  it('TC-31-01: signInUser calls signInWithEmailAndPassword once with the auth instance, email and password and resolves without throwing', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });

    await expect(signInUser('ana@test.com', 'secret123')).resolves.toBeUndefined();

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'ana@test.com', 'secret123');
  });

  // TC-31-02
  it('TC-31-02: signInUser rethrows the original Firebase error unchanged when the sign-in is rejected', async () => {
    const firebaseError = { code: 'auth/invalid-credential' };
    signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    let caught;
    try {
      await signInUser('ana@test.com', 'wrong');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBe(firebaseError);
  });
});

describe('subtask-3-1: authCall auth-state listener (AC-2)', () => {
  // TC-31-03
  it('TC-31-03: userListener calls onAuthStateChanged with the auth instance and forwards the emitted user object to the listener', () => {
    const emittedUser = { uid: 'u1', email: 'ana@test.com' };
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(emittedUser);
    });
    const listener = vi.fn();

    userListener(listener);

    expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, expect.any(Function));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(emittedUser);
  });

  // TC-31-04
  it('TC-31-04: userListener forwards null to the listener when Firebase reports a signed-out state', () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
    });
    const listener = vi.fn();

    userListener(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(null);
  });
});

describe('subtask-3-1: authCall sign-out (AC-2, AC-3)', () => {
  // TC-31-05
  it('TC-31-05: logoutFirebase calls signOut with the auth instance and does not throw when signOut resolves', () => {
    signOut.mockResolvedValue(undefined);

    expect(() => logoutFirebase()).not.toThrow();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  // TC-31-06
  it('TC-31-06: logoutFirebase logs the error via console.log and does not rethrow when signOut rejects', async () => {
    const signOutError = new Error('sign-out failed');
    signOut.mockRejectedValue(signOutError);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => logoutFirebase()).not.toThrow();

    await vi.waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(signOutError);
    });
  });
});

describe('subtask-3-1: authCall registration does not leave partial state (AC-3)', () => {
  // TC-31-07
  it('TC-31-07: createUser rethrows when createUserWithEmailAndPassword rejects and does not write the user document', async () => {
    const registrationError = { code: 'auth/email-already-in-use' };
    createUserWithEmailAndPassword.mockRejectedValue(registrationError);

    await expect(
      createUser('users', 'ana@test.com', 'secret123', 'Ana', 'Pérez')
    ).rejects.toBe(registrationError);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'ana@test.com', 'secret123');
    expect(setDoc).not.toHaveBeenCalled();
  });
});
