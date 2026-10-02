import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  createTaksFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  readDataUserFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
}));

const swalFireMock = vi.hoisted(() => vi.fn());

vi.mock('../config/firestoreCalls', () => firestoreMocks);
vi.mock('sweetalert2', () => ({
  default: {
    fire: swalFireMock,
  },
}));

import {
  createTaskService,
  deleteTaskService,
  readTasksService,
  updateTaskService,
} from './taskServices';

describe('taskServices', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, TEST_API_KEY: 'test-mock-key' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('readTasksService carga tareas desde Firestore cuando hay datos', async () => {
    const setTasks = vi.fn();
    firestoreMocks.readDataTasksFirestore.mockResolvedValue({
      empty: false,
      docs: [
        { data: () => ({ id_task: '1', title: 'A' }) },
        { data: () => ({ id_task: '2', title: 'B' }) },
      ],
    });

    await readTasksService(setTasks);

    expect(firestoreMocks.readDataTasksFirestore).toHaveBeenCalledWith('tasks', 'created_at');
    expect(setTasks).toHaveBeenCalledWith([
      { id_task: '1', title: 'A' },
      { id_task: '2', title: 'B' },
    ]);
  });

  it('readTasksService limpia tareas cuando Firestore no devuelve resultados', async () => {
    const setTasks = vi.fn();
    firestoreMocks.readDataTasksFirestore.mockResolvedValue({ empty: true, docs: [] });

    await readTasksService(setTasks);

    expect(setTasks).toHaveBeenCalledWith([]);
  });

  it('createTaskService rechaza campos vacíos y muestra error', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const reloadTasks = vi.fn();

    await createTaskService('   ', '', { email: 'user@test.com' }, setTitle, setContent, setTasks, reloadTasks);

    expect(swalFireMock).toHaveBeenCalledWith('Error', 'El título y el contenido no pueden estar vacíos', 'error');
    expect(firestoreMocks.createTaksFirestore).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
    expect(reloadTasks).not.toHaveBeenCalled();
  });

  it('createTaskService crea tarea, limpia formulario y recarga lista', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const reloadTasks = vi.fn().mockResolvedValue(undefined);
    const user = { email: 'user@test.com' };

    await createTaskService('Nueva tarea', 'Contenido', user, setTitle, setContent, setTasks, reloadTasks);

    expect(firestoreMocks.createTaksFirestore).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.createTaksFirestore).toHaveBeenCalledWith(
      'tasks',
      expect.objectContaining({
        title: 'Nueva tarea',
        content: 'Contenido',
        creator: 'user@test.com',
        created_at: expect.any(Date),
      }),
    );
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(reloadTasks).toHaveBeenCalledWith(setTasks);
    expect(swalFireMock).toHaveBeenCalledWith('Tarea Agregada', '', 'success');
  });

  it('updateTaskService actualiza tarea usando Firebase y reinicia estado', async () => {
    const setEditTask = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const reloadTasks = vi.fn();
    const editTask = {
      id_task: 'task-1',
      title: 'Anterior',
      content: 'Viejo',
      creator: 'user@test.com',
    };

    await updateTaskService(editTask, 'Actualizado', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, reloadTasks);

    expect(firestoreMocks.updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      id_task: 'task-1',
      title: 'Actualizado',
      content: 'Nuevo contenido',
      creator: 'user@test.com',
    });
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(reloadTasks).toHaveBeenCalledWith(setTasks);
    expect(swalFireMock).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('deleteTaskService elimina tarea usando Firebase y recarga lista', async () => {
    const setTasks = vi.fn();
    const reloadTasks = vi.fn();

    await deleteTaskService('task-9', setTasks, reloadTasks);

    expect(firestoreMocks.deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-9');
    expect(reloadTasks).toHaveBeenCalledWith(setTasks);
  });
});
