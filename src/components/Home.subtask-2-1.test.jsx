// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';

// Subtask subtask-2-1: Home component (src/components/Home.jsx)

const authState = vi.hoisted(() => ({ user: null, loading: false }));
const navigateMock = vi.hoisted(() => vi.fn());
const swal = vi.hoisted(() => ({ fire: vi.fn() }));
const services = vi.hoisted(() => ({
  createTaskService: vi.fn(),
  updateTaskService: vi.fn(),
  deleteTaskService: vi.fn(),
  getUserPermissionService: vi.fn(),
  readTasksService: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('sweetalert2', () => ({ default: swal }));
vi.mock('../services/taskServices', () => services);

import Home from './Home';

const USER_EMAIL = 'user@test.com';

function makeTask(overrides = {}) {
  return {
    id_task: 'task-1',
    title: 'Tarea uno',
    content: 'Contenido uno',
    creator: USER_EMAIL,
    created_at: { seconds: 1704067200, nanoseconds: 0 },
    ...overrides,
  };
}

beforeAll(() => {
  // Antd responsive helpers read window.matchMedia, which jsdom does not provide.
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
  authState.user = { email: USER_EMAIL };
  authState.loading = false;
  swal.fire.mockResolvedValue(undefined);
  services.readTasksService.mockResolvedValue(undefined);
  services.getUserPermissionService.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe('subtask-2-1 | Home', () => {
  it('TC-2-1-09: renders the title, content, and creator of every task and no empty-state message', async () => {
    const taskA = makeTask({ id_task: 'a', title: 'Primera', content: 'Contenido A', creator: 'a@test.com' });
    const taskB = makeTask({ id_task: 'b', title: 'Segunda', content: 'Contenido B', creator: 'b@test.com' });
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([taskA, taskB]));

    render(<Home />);

    await waitFor(() => expect(screen.getByText('Primera')).toBeTruthy());
    expect(screen.getByText('Segunda')).toBeTruthy();
    expect(screen.getByText('Contenido A')).toBeTruthy();
    expect(screen.getByText('Contenido B')).toBeTruthy();
    expect(screen.getByText('a@test.com')).toBeTruthy();
    expect(screen.getByText('b@test.com')).toBeTruthy();
    expect(screen.queryByText('No hay tareas para mostrar')).toBeNull();
  });

  it('TC-2-1-10: renders the empty-state message and no task containers when the service returns an empty list', async () => {
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([]));

    const { container } = render(<Home />);

    await waitFor(() => expect(services.readTasksService).toHaveBeenCalled());
    expect(screen.getByText('No hay tareas para mostrar')).toBeTruthy();
    expect(container.querySelectorAll('.task-container').length).toBe(0);
  });

  it('TC-2-1-11: while the session is loading, shows the loading message and does not read tasks or permissions', () => {
    authState.loading = true;

    render(<Home />);

    expect(screen.getByText('Cargando sesión...')).toBeTruthy();
    expect(services.readTasksService).not.toHaveBeenCalled();
    expect(services.getUserPermissionService).not.toHaveBeenCalled();
  });

  it('TC-2-1-12: with no user and loading finished, redirects to /login and does not read tasks', () => {
    authState.user = null;
    authState.loading = false;

    render(<Home />);

    expect(navigateMock).toHaveBeenCalledWith('/login');
    expect(services.readTasksService).not.toHaveBeenCalled();
  });

  it('TC-2-1-13: shows edit only on tasks created by the user and delete on all tasks when permissions allow it', async () => {
    services.getUserPermissionService.mockImplementation(async (user, setUserPermission) =>
      setUserPermission({ Write: true, Delete: true })
    );
    const own = makeTask({ id_task: 'own', title: 'Propia', creator: USER_EMAIL });
    const other = makeTask({ id_task: 'other', title: 'Ajena', creator: 'otro@test.com' });
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([own, other]));

    const { container } = render(<Home />);

    await waitFor(() => expect(screen.getByText('Ajena')).toBeTruthy());
    expect(container.querySelectorAll('.task-container').length).toBe(2);
    expect(container.querySelectorAll('.btn-edit').length).toBe(1);
    expect(container.querySelectorAll('.btn-delete').length).toBe(2);
  });

  it('TC-2-1-14: after the user confirms deletion, delegates to deleteTaskService and shows the success alert', async () => {
    services.getUserPermissionService.mockImplementation(async (user, setUserPermission) =>
      setUserPermission({ Write: true, Delete: true })
    );
    const task = makeTask({ id_task: 'task-del' });
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([task]));
    swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText('Tarea uno')).toBeTruthy());

    fireEvent.click(container.querySelector('.btn-delete'));

    await waitFor(() =>
      expect(services.deleteTaskService).toHaveBeenCalledWith('task-del', expect.any(Function), services.readTasksService)
    );
    expect(swal.fire).toHaveBeenCalledWith('Tarea Eliminada', '', 'success');
  });

  it('TC-2-1-15: when the user cancels the deletion confirmation, does not call deleteTaskService', async () => {
    services.getUserPermissionService.mockImplementation(async (user, setUserPermission) =>
      setUserPermission({ Write: true, Delete: true })
    );
    const task = makeTask({ id_task: 'task-keep' });
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([task]));
    const confirmation = Promise.resolve({ isConfirmed: false });
    swal.fire.mockReturnValueOnce(confirmation);

    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText('Tarea uno')).toBeTruthy());

    fireEvent.click(container.querySelector('.btn-delete'));
    // Awaiting the same promise guarantees Home's .then callback has run first.
    await confirmation;

    expect(services.deleteTaskService).not.toHaveBeenCalled();
  });

  it('TC-2-1-16: the add button is disabled until both title and content are filled', async () => {
    services.getUserPermissionService.mockImplementation(async (user, setUserPermission) =>
      setUserPermission({ Write: true })
    );

    render(<Home />);

    const button = screen.getByRole('button', { name: 'Agregar' });
    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 'Nuevo título' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Agregar' }).disabled).toBe(true));

    fireEvent.change(screen.getByPlaceholderText('Descripción de la tarea...'), {
      target: { value: 'Nuevo contenido' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Agregar' }).disabled).toBe(false));
  });

  it('TC-2-1-17: editing a task prefills the form and delegates the update to updateTaskService', async () => {
    services.getUserPermissionService.mockImplementation(async (user, setUserPermission) =>
      setUserPermission({ Write: true, Delete: true })
    );
    const task = makeTask({ id_task: 'task-edit', title: 'Título original', content: 'Contenido original' });
    services.readTasksService.mockImplementationOnce(async (setTasks) => setTasks([task]));

    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText('Título original')).toBeTruthy());

    fireEvent.click(container.querySelector('.btn-edit'));

    expect(screen.getByPlaceholderText('Título').value).toBe('Título original');
    expect(screen.getByPlaceholderText('Descripción de la tarea...').value).toBe('Contenido original');

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() =>
      expect(services.updateTaskService).toHaveBeenCalledWith(
        task,
        'Título original',
        'Contenido original',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        services.readTasksService
      )
    );
  });
});
