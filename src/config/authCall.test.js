import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuth, mockDb, mockDocRef } = vi.hoisted(() => ({
  mockAuth: { name: 'auth-instance' },
  mockDb: { name: 'db-instance' },
  mockDocRef: { name: 'doc-ref' },
}));

vi.mock('./firebaseConfig', () => ({ default: { name: 'app' } }));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  doc: vi.fn(() => mockDocRef),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
}));

import {
  createUser,
  createUserDocument,
  signInUser,
} from './authCall';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

describe('authCall (subtask-1-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // UT-subtask-1-1-US-1-AC-1 / AUTH-01
  describe('createUserDocument', () => {
    it('writes users/{email} with the form data and default permissions', async () => {
      vi.mocked(setDoc).mockResolvedValue(undefined);
      const user = { uid: 'uid-123' };

      await createUserDocument('users', user, 'Ana', 'Pérez', 'ana@example.com');

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'ana@example.com');
      expect(setDoc).toHaveBeenCalledTimes(1);
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        id_user: 'uid-123',
        name: 'Ana',
        lastname: 'Pérez',
        email: 'ana@example.com',
        permissions: {
          Read: true,
          Write: false,
          Delete: false,
        },
        created_at: expect.any(Date),
      });
    });

    it('propagates Firestore write errors', async () => {
      const firestoreError = new Error('permission-denied');
      vi.mocked(setDoc).mockRejectedValue(firestoreError);

      await expect(
        createUserDocument('users', { uid: 'uid-1' }, 'Ana', 'Pérez', 'ana@example.com')
      ).rejects.toBe(firestoreError);
    });
  });

  // UT-subtask-1-1-US-1-AC-1 / AUTH-02
  describe('createUser', () => {
    it('creates the Auth account and then writes the user document with the returned uid', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: { uid: 'uid-999' },
      });
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await createUser('users', 'ana@example.com', 'secret123', 'Ana', 'Pérez');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'ana@example.com',
        'secret123'
      );
      expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'ana@example.com');
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          id_user: 'uid-999',
          name: 'Ana',
          lastname: 'Pérez',
          email: 'ana@example.com',
          permissions: { Read: true, Write: false, Delete: false },
        })
      );
    });

    // UT-subtask-1-1-US-1-AC-1 / AUTH-03
    it('rethrows the Auth error and skips the Firestore write when Auth creation fails', async () => {
      const authError = new Error('auth/email-already-in-use');
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(authError);

      await expect(
        createUser('users', 'ana@example.com', 'secret123', 'Ana', 'Pérez')
      ).rejects.toBe(authError);

      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  // UT-subtask-1-1-US-1-AC-2 / AUTH-04
  describe('signInUser', () => {
    it('calls signInWithEmailAndPassword with the given credentials', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: { uid: 'u' } });

      await signInUser('ana@example.com', 'secret123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'ana@example.com',
        'secret123'
      );
    });

    it('rethrows the Firebase error when sign-in fails', async () => {
      const authError = new Error('auth/invalid-credential');
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(authError);

      await expect(signInUser('ana@example.com', 'wrong')).rejects.toBe(authError);
    });
  });
});
