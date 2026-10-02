import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  createTaksFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  readDataUserFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
}));

const swalMocks = vi.hoisted(() => ({
  fire: vi.fn(),
}));

vi.mock('../config/firestoreCalls', () => firestoreMocks);
vi.mock('sweetalert2', () => ({
  default: swalMocks,
}));

import {
  createTaskService,
  deleteTaskService,
  updateTaskService,
} from './taskServices';

describe('services/taskServices', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, TEST_API_KEY: 'test-mock-key' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('createTaskService rechaza la creación si el título está vacío', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasksServiceMock = vi.fn();

    await createTaskService('   ', 'contenido', { email: 'user@test.com' }, setTitle, setContent, setTasks, readTasksServiceMock);

    expect(firestoreMocks.createTaksFirestore).not.toHaveBeenCalled();
    expect(readTasksServiceMock).not.toHaveBeenCalled();
    expect(swalMocks.fire).toHaveBeenCalledWith('Error', 'El título y el contenido no pueden estar vacíos', 'error');
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
  });

  it('createTaskService rechaza la creación si el contenido está vacío', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasksServiceMock = vi.fn();

    await createTaskService('titulo', '   ', { email: 'user@test.com' }, setTitle, setContent, setTasks, readTasksServiceMock);

    expect(firestoreMocks.createTaksFirestore).not.toHaveBeenCalled();
    expect(readTasksServiceMock).not.toHaveBeenCalled();
    expect(swalMocks.fire).toHaveBeenCalledWith('Error', 'El título y el contenido no pueden estar vacíos', 'error');
  });

  it('updateTaskService llama a updateTaskFirestore y limpia el estado', async () => {
    const editTask = { id_task: 'task-1', title: 'anterior', content: 'viejo', extra: true };
    const setEditTask = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasksServiceMock = vi.fn();

    await updateTaskService(editTask, 'nuevo titulo', 'nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasksServiceMock);

    expect(firestoreMocks.updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      id_task: 'task-1',
      title: 'nuevo titulo',
      content: 'nuevo contenido',
      extra: true,
    });
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasksServiceMock).toHaveBeenCalledWith(setTasks);
    expect(swalMocks.fire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('deleteTaskService llama a deleteTaskFirestore y recarga tareas', async () => {
    const setTasks = vi.fn();
    const readTasksServiceMock = vi.fn();

    await deleteTaskService('task-2', setTasks, readTasksServiceMock);

    expect(firestoreMocks.deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-2');
    expect(readTasksServiceMock).toHaveBeenCalledWith(setTasks);
  });
});
