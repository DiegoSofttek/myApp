// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react';

const {
  mockUseAuth,
  mockNavigate,
  mockFire,
  mockDeleteTaskService,
  mockGetUserPermissionService,
  mockReadTasksService,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockNavigate: vi.fn(),
  mockFire: vi.fn(),
  mockDeleteTaskService: vi.fn(),
  mockGetUserPermissionService: vi.fn(),
  mockReadTasksService: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sweetalert2', () => ({
  default: { fire: mockFire },
}));

vi.mock('../services/taskServices', () => ({
  createTaskService: vi.fn(),
  updateTaskService: vi.fn(),
  deleteTaskService: mockDeleteTaskService,
  getUserPermissionService: mockGetUserPermissionService,
  readTasksService: mockReadTasksService,
}));

import Home from './Home';
import { formatDate, convertTimestampToDate } from '../utilities/utils';

const USER_EMAIL = 'ana@test.com';
const OTHER_EMAIL = 'luis@test.com';

const TIMESTAMP_A = { seconds: 1700000000, nanoseconds: 0 };
const TIMESTAMP_B = { seconds: 1700086400, nanoseconds: 0 };

const TASK_A = {
  id_task: 'task-a',
  title: 'Tarea Alfa',
  content: 'Contenido alfa',
  creator: USER_EMAIL,
  created_at: TIMESTAMP_A,
};

const TASK_B = {
  id_task: 'task-b',
  title: 'Tarea Beta',
  content: 'Contenido beta',
  creator: OTHER_EMAIL,
  created_at: TIMESTAMP_B,
};

beforeAll(() => {
  // jsdom does not implement matchMedia, which antd's Pagination relies on.
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
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { email: USER_EMAIL }, loading: false });
  mockFire.mockResolvedValue({ isConfirmed: false });
  mockGetUserPermissionService.mockImplementation(async (_user, setUserPermission) => {
    setUserPermission({ Write: true, Delete: true });
  });
  mockReadTasksService.mockImplementation(async (setTasks) => {
    setTasks([TASK_A, TASK_B]);
  });
});

afterEach(() => {
  cleanup();
});

describe('subtask-2-1: Home task rendering', () => {
  it('TC-2-1-09: renders the title, content, creator and formatted date of every provided task', async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText('Tarea Alfa')).toBeTruthy());

    expect(screen.getByText('Tarea Beta')).toBeTruthy();
    expect(screen.getByText('Contenido alfa')).toBeTruthy();
    expect(screen.getByText('Contenido beta')).toBeTruthy();
    expect(screen.getAllByText(USER_EMAIL).length).toBeGreaterThan(0);
    expect(screen.getByText(OTHER_EMAIL)).toBeTruthy();
    expect(
      screen.getByText(formatDate(convertTimestampToDate(TIMESTAMP_A)))
    ).toBeTruthy();
    expect(
      screen.getByText(formatDate(convertTimestampToDate(TIMESTAMP_B)))
    ).toBeTruthy();
  });

  it('TC-2-1-10: shows the empty-state message and no task cards when the list is empty', async () => {
    // Only the first load returns an empty array; later loads are no-ops so the
    // effect (which depends on the tasks identity) settles instead of looping.
    mockReadTasksService.mockReset();
    mockReadTasksService.mockImplementationOnce(async (setTasks) => {
      setTasks([]);
    });
    mockReadTasksService.mockImplementation(async () => {});

    const { container } = render(<Home />);

    await waitFor(() =>
      expect(screen.getByText('No hay tareas para mostrar')).toBeTruthy()
    );

    expect(container.querySelectorAll('.task-container').length).toBe(0);
    expect(mockReadTasksService.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(mockReadTasksService.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it('TC-2-1-11: shows the edit button only for tasks created by the current user and the delete button for all tasks when permitted', async () => {
    const { container } = render(<Home />);

    await waitFor(() => expect(screen.getByText('Tarea Alfa')).toBeTruthy());

    expect(container.querySelectorAll('.btn-edit').length).toBe(1);
    expect(container.querySelectorAll('.btn-delete').length).toBe(2);
    expect(mockGetUserPermissionService).toHaveBeenCalledWith(
      { email: USER_EMAIL },
      expect.any(Function)
    );
  });
});

describe('subtask-2-1: Home delete confirmation', () => {
  it('TC-2-1-12: delegates deletion to deleteTaskService only when the confirmation is accepted', async () => {
    // Accepted confirmation
    mockFire.mockResolvedValueOnce({ isConfirmed: true });
    const { container, unmount } = render(<Home />);

    await waitFor(() => expect(screen.getByText('Tarea Alfa')).toBeTruthy());

    fireEvent.click(container.querySelectorAll('.btn-delete')[0]);

    expect(mockFire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '¿Quieres eliminar esta tarea?',
        showCancelButton: true,
      })
    );

    await waitFor(() =>
      expect(mockDeleteTaskService).toHaveBeenCalledWith(
        'task-a',
        expect.any(Function),
        mockReadTasksService
      )
    );
    unmount();

    // Cancelled confirmation
    vi.clearAllMocks();
    mockFire.mockResolvedValueOnce({ isConfirmed: false });
    mockReadTasksService.mockImplementation(async (setTasks) => {
      setTasks([TASK_A, TASK_B]);
    });
    mockGetUserPermissionService.mockImplementation(async (_user, setUserPermission) => {
      setUserPermission({ Write: true, Delete: true });
    });
    const second = render(<Home />);

    await waitFor(() => expect(screen.getByText('Tarea Alfa')).toBeTruthy());

    await act(async () => {
      fireEvent.click(second.container.querySelectorAll('.btn-delete')[0]);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFire).toHaveBeenCalledTimes(1);
    expect(mockDeleteTaskService).not.toHaveBeenCalled();
  });
});

describe('subtask-2-1: Home auth state handling', () => {
  it('TC-2-1-13: shows the loading message without loading tasks while the session is loading, and redirects to /login when loading has finished without a user', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const loading = render(<Home />);

    expect(screen.getByText('Cargando sesión...')).toBeTruthy();
    expect(mockReadTasksService).not.toHaveBeenCalled();
    loading.unmount();

    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Home />);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    expect(mockReadTasksService).not.toHaveBeenCalled();
  });
});
