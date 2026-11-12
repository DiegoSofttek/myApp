// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import Swal from 'sweetalert2';
import Home from './Home';
import { useAuth } from '../hooks/useAuth';
import {
  createTaskService,
  deleteTaskService,
  getUserPermissionService,
  readTasksService,
  updateTaskService,
} from '../services/taskServices';
import { formatDate, convertTimestampToDate } from '../utilities/utils';

const { navigateMock, paginationSpy, EMPTY_TASKS } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  paginationSpy: vi.fn(),
  // Stable reference so the Home effect does not re-run in a loop.
  EMPTY_TASKS: [],
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('../services/taskServices', () => ({
  createTaskService: vi.fn(),
  deleteTaskService: vi.fn(),
  getUserPermissionService: vi.fn(),
  readTasksService: vi.fn(),
  updateTaskService: vi.fn(),
}));

// Wraps the real antd Pagination so the props it receives (total) can be observed.
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal();
  const ActualPagination = actual.Pagination;
  return {
    ...actual,
    Pagination: (props) => {
      paginationSpy(props);
      return React.createElement(ActualPagination, props);
    },
  };
});

// jsdom does not implement matchMedia, which antd's responsive observer requires.
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

const USER = { email: 'owner@test.com' };

const TASKS = [
  {
    id_task: 'task-1',
    title: 'Primera',
    content: 'Contenido uno',
    creator: 'owner@test.com',
    created_at: { seconds: 1700000000, nanoseconds: 0 },
  },
  {
    id_task: 'task-2',
    title: 'Segunda',
    content: 'Contenido dos',
    creator: 'other@test.com',
    created_at: { seconds: 1700003600, nanoseconds: 0 },
  },
];

describe('subtask-2-1: Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: USER, loading: false });
    getUserPermissionService.mockImplementation(async (_user, setUserPermission) => {
      setUserPermission({ Write: true, Delete: true });
    });
    readTasksService.mockImplementation(async (setTasks) => {
      setTasks(EMPTY_TASKS);
    });
    Swal.fire.mockResolvedValue({ isConfirmed: false });
  });

  afterEach(() => {
    cleanup();
  });

  it('UT-TASK-09: renders title, content, creator, date, and permission-based action buttons for each task', async () => {
    readTasksService.mockImplementation(async (setTasks) => {
      setTasks(TASKS);
    });

    const { container } = render(<Home />);

    await screen.findByText('Primera');

    expect(screen.getByText('Contenido uno')).toBeTruthy();
    expect(screen.getByText('Segunda')).toBeTruthy();
    expect(screen.getByText('Contenido dos')).toBeTruthy();
    expect(screen.getByText('owner@test.com')).toBeTruthy();
    expect(screen.getByText('other@test.com')).toBeTruthy();

    const firstDate = formatDate(convertTimestampToDate(TASKS[0].created_at));
    const secondDate = formatDate(convertTimestampToDate(TASKS[1].created_at));
    expect(screen.getByText(firstDate)).toBeTruthy();
    expect(screen.getByText(secondDate)).toBeTruthy();

    // Edit is shown only for the task whose creator is the authenticated user.
    const editButtons = container.querySelectorAll('.btn-edit');
    expect(editButtons.length).toBe(1);
    expect(editButtons[0].closest('.task-container').textContent).toContain('Primera');

    // Delete is shown for every task because the Delete permission is true.
    expect(container.querySelectorAll('.btn-delete').length).toBe(2);
  });

  it('UT-TASK-10: renders the empty-state message and a zero-total pagination when there are no tasks', async () => {
    readTasksService.mockImplementation(async (setTasks) => {
      setTasks(EMPTY_TASKS);
    });

    const { container } = render(<Home />);

    await screen.findByText('No hay tareas para mostrar');

    expect(container.querySelectorAll('.task-container').length).toBe(0);
    expect(paginationSpy.mock.lastCall[0].total).toBe(0);
  });

  it('UT-TASK-11: does not load data while the session is loading or when there is no user', async () => {
    // Loading state: shows the loader and does not load data.
    useAuth.mockReturnValue({ user: USER, loading: true });
    render(<Home />);

    expect(screen.getByText('Cargando sesión...')).toBeTruthy();
    expect(readTasksService).not.toHaveBeenCalled();
    expect(getUserPermissionService).not.toHaveBeenCalled();
    cleanup();

    // No user after loading: redirects to login and does not load data.
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: null, loading: false });
    render(<Home />);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
    expect(readTasksService).not.toHaveBeenCalled();
    expect(getUserPermissionService).not.toHaveBeenCalled();
  });

  it('UT-TASK-12: confirms and delegates task deletion through deleteTaskService, and skips it when cancelled', async () => {
    readTasksService.mockImplementation(async (setTasks) => {
      setTasks(TASKS);
    });

    const { container } = render(<Home />);
    await screen.findByText('Primera');

    // Confirmed deletion.
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    fireEvent.click(container.querySelectorAll('.btn-delete')[0]);

    await waitFor(() =>
      expect(deleteTaskService).toHaveBeenCalledWith('task-1', expect.any(Function), readTasksService)
    );
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenLastCalledWith('Tarea Eliminada', '', 'success')
    );

    // Cancelled deletion.
    cleanup();
    vi.clearAllMocks();
    readTasksService.mockImplementation(async (setTasks) => {
      setTasks(TASKS);
    });
    getUserPermissionService.mockImplementation(async (_user, setUserPermission) => {
      setUserPermission({ Write: true, Delete: true });
    });
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });

    const second = render(<Home />);
    await screen.findByText('Primera');
    fireEvent.click(second.container.querySelectorAll('.btn-delete')[0]);

    await act(async () => {
      await Promise.resolve();
    });

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(deleteTaskService).not.toHaveBeenCalled();
  });

  it('UT-TASK-13: enables the create button only when title and content are filled and passes the values to createTaskService', async () => {
    const { container } = render(<Home />);

    const addButton = screen.getByRole('button', { name: 'Agregar' });
    expect(addButton.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 'Nueva' } });
    expect(addButton.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea...'), {
      target: { value: 'Detalle' },
    });
    expect(addButton.disabled).toBe(false);

    fireEvent.click(addButton);

    await waitFor(() =>
      expect(createTaskService).toHaveBeenCalledWith(
        'Nueva',
        'Detalle',
        USER,
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        readTasksService
      )
    );
    expect(container).toBeTruthy();
  });
});
