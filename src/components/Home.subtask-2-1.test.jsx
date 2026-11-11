// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Swal from 'sweetalert2';
import Home from './Home';
import { useAuth } from '../hooks/useAuth';
import {
  readDataTasksFirestore,
  readDataUserFirestore,
  deleteTaskFirestore,
} from '../config/firestoreCalls';
import { formatDate, convertTimestampToDate } from '../utilities/utils';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('../config/firestoreCalls', () => ({
  readDataUserFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  createTaksFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
}));

const USER = { email: 'owner@test.com' };

const TASK_OWN = {
  id_task: 't1',
  title: 'Tarea uno',
  content: 'Contenido uno',
  creator: 'owner@test.com',
  created_at: { seconds: 1705314600, nanoseconds: 0 },
};

const TASK_OTHER = {
  id_task: 't2',
  title: 'Tarea dos',
  content: 'Contenido dos',
  creator: 'other@test.com',
  created_at: { seconds: 1705318200, nanoseconds: 0 },
};

const snapshotOf = (tasks) => ({
  empty: tasks.length === 0,
  docs: tasks.map((task) => ({ data: () => task })),
});

const permissionSnapshot = (permissions) => ({
  empty: false,
  docs: [{ data: () => ({ permissions }) }],
});

describe('subtask-2-1: Home', () => {
  beforeAll(() => {
    if (!window.matchMedia) {
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });
    }
  });

  beforeEach(() => {
    vi.resetAllMocks();
    readDataUserFirestore.mockResolvedValue(permissionSnapshot({}));
    readDataTasksFirestore.mockResolvedValue(snapshotOf([]));
    deleteTaskFirestore.mockResolvedValue(undefined);
    Swal.fire.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('TC-2-1-09: renders task title, content, creator, formatted date, and gates edit/delete buttons by owner and permissions', async () => {
    useAuth.mockReturnValue({ user: USER, loading: false });
    readDataUserFirestore.mockResolvedValue(
      permissionSnapshot({ Write: true, Delete: true })
    );
    readDataTasksFirestore.mockResolvedValue(snapshotOf([TASK_OWN, TASK_OTHER]));

    const { container } = render(<Home />);

    expect(await screen.findByText('Tarea uno')).toBeTruthy();
    expect(screen.getByText('Tarea dos')).toBeTruthy();
    expect(screen.getByText('Contenido uno')).toBeTruthy();
    expect(screen.getByText('Contenido dos')).toBeTruthy();
    expect(screen.getByText('owner@test.com')).toBeTruthy();
    expect(screen.getByText('other@test.com')).toBeTruthy();
    expect(
      screen.getByText(formatDate(convertTimestampToDate(TASK_OWN.created_at)))
    ).toBeTruthy();
    expect(
      screen.getByText(formatDate(convertTimestampToDate(TASK_OTHER.created_at)))
    ).toBeTruthy();

    await waitFor(() => {
      expect(container.querySelectorAll('.btn-edit').length).toBe(1);
      expect(container.querySelectorAll('.btn-delete').length).toBe(2);
    });

    const editButton = container.querySelector('.btn-edit');
    expect(editButton.closest('.task-container').textContent).toContain('Tarea uno');
  });

  it('TC-2-1-10: renders the empty-state message and no task containers when there are no tasks', async () => {
    useAuth.mockReturnValue({ user: USER, loading: false });
    readDataTasksFirestore.mockResolvedValue(snapshotOf([]));

    const { container } = render(<Home />);

    expect(await screen.findByText('No hay tareas para mostrar')).toBeTruthy();
    expect(container.querySelectorAll('.task-container').length).toBe(0);
  });

  it('TC-2-1-11: confirming deletion calls deleteTaskFirestore for the task and then shows success', async () => {
    useAuth.mockReturnValue({ user: USER, loading: false });
    readDataUserFirestore.mockResolvedValue(
      permissionSnapshot({ Write: true, Delete: true })
    );
    readDataTasksFirestore.mockResolvedValue(snapshotOf([TASK_OWN]));
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const { container } = render(<Home />);

    await screen.findByText('Tarea uno');
    await waitFor(() => {
      expect(container.querySelectorAll('.btn-delete').length).toBe(1);
    });

    fireEvent.click(container.querySelector('.btn-delete'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledTimes(2);
    });

    expect(Swal.fire.mock.calls[0][0]).toMatchObject({
      title: '¿Quieres eliminar esta tarea?',
      icon: 'warning',
    });
    expect(deleteTaskFirestore).toHaveBeenCalledWith('tasks', 't1');
    expect(Swal.fire).toHaveBeenLastCalledWith('Tarea Eliminada', '', 'success');
  });

  it('TC-2-1-12: while loading shows the session indicator and does not redirect', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(<Home />);

    expect(screen.getByText('Cargando sesión...')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalledWith('/login');
  });

  it('TC-2-1-13: does not call permission or task services while loading or when user is null', () => {
    useAuth.mockReturnValue({ user: USER, loading: true });
    const loadingView = render(<Home />);
    expect(readDataUserFirestore).not.toHaveBeenCalled();
    expect(readDataTasksFirestore).not.toHaveBeenCalled();
    loadingView.unmount();

    useAuth.mockReturnValue({ user: null, loading: false });
    render(<Home />);
    expect(readDataUserFirestore).not.toHaveBeenCalled();
    expect(readDataTasksFirestore).not.toHaveBeenCalled();
  });
});
