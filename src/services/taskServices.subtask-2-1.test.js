import { describe, it, expect, vi, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import {
  createTaksFirestore,
  deleteTaskFirestore,
  readDataTasksFirestore,
  readDataUserFirestore,
  updateTaskFirestore,
} from '../config/firestoreCalls';
import {
  createTaskService,
  deleteTaskService,
  getUserPermissionService,
  readTasksService,
  updateTaskService,
} from './taskServices';

vi.mock('../config/firestoreCalls', () => ({
  createTaksFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  readDataUserFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

const USER = { email: 'user@test.com' };

const makeSnapshot = (items) => ({
  empty: items.length === 0,
  docs: items.map((item) => ({ data: () => item })),
});

describe('subtask-2-1: taskServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTaksFirestore.mockResolvedValue(undefined);
    updateTaskFirestore.mockResolvedValue(undefined);
    deleteTaskFirestore.mockResolvedValue(undefined);
    readDataTasksFirestore.mockResolvedValue(makeSnapshot([]));
    readDataUserFirestore.mockResolvedValue(makeSnapshot([]));
    Swal.fire.mockReturnValue(undefined);
  });

  it('UT-TASK-01: createTaskService rejects empty or whitespace-only title or content with an error alert', async () => {
    const inputs = [
      { title: '   ', content: 'Contenido' },
      { title: '', content: 'Contenido' },
      { title: 'Titulo', content: '' },
      { title: '', content: '' },
    ];

    for (const { title, content } of inputs) {
      const setTitle = vi.fn();
      const setContent = vi.fn();
      const setTasks = vi.fn();
      const readTasks = vi.fn();

      await expect(
        createTaskService(title, content, USER, setTitle, setContent, setTasks, readTasks)
      ).resolves.toBeUndefined();

      expect(Swal.fire).toHaveBeenLastCalledWith(
        'Error',
        'El título y el contenido no pueden estar vacíos',
        'error'
      );
      expect(createTaksFirestore).not.toHaveBeenCalled();
      expect(readTasks).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it('UT-TASK-02: createTaskService stores a task with creator and date, clears the form, reloads and shows success', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasks = vi.fn().mockResolvedValue(undefined);

    await createTaskService('Mi tarea', 'Detalle', USER, setTitle, setContent, setTasks, readTasks);

    expect(createTaksFirestore).toHaveBeenCalledWith('tasks', {
      title: 'Mi tarea',
      content: 'Detalle',
      creator: 'user@test.com',
      created_at: expect.any(Date),
    });
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasks).toHaveBeenCalledWith(setTasks);
    expect(Swal.fire).toHaveBeenLastCalledWith('Tarea Agregada', '', 'success');
  });

  it('UT-TASK-03: updateTaskService updates the edited task and resets the edit state', async () => {
    const editTask = { id_task: 'task-1', title: 'Viejo', content: 'Viejo contenido', creator: 'user@test.com' };
    const setEditTask = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasks = vi.fn();

    await updateTaskService(editTask, 'Nuevo', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasks);

    expect(updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      ...editTask,
      title: 'Nuevo',
      content: 'Nuevo contenido',
    });
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasks).toHaveBeenCalledWith(setTasks);
    expect(Swal.fire).toHaveBeenLastCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('UT-TASK-04: updateTaskService does nothing when there is no task being edited', async () => {
    const setEditTask = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const readTasks = vi.fn();

    await updateTaskService(null, 'Nuevo', 'Contenido', setEditTask, setTitle, setContent, setTasks, readTasks);

    expect(updateTaskFirestore).not.toHaveBeenCalled();
    expect(setEditTask).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('UT-TASK-05: deleteTaskService deletes the task in Firestore and then reloads the task list', async () => {
    const setTasks = vi.fn();
    const readTasks = vi.fn();

    await deleteTaskService('task-1', setTasks, readTasks);

    expect(deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1');
    expect(readTasks).toHaveBeenCalledWith(setTasks);
    expect(deleteTaskFirestore.mock.invocationCallOrder[0]).toBeLessThan(
      readTasks.mock.invocationCallOrder[0]
    );
  });

  it('UT-TASK-06: readTasksService passes the data of every document in order to setTasks', async () => {
    const first = { id_task: 'a', title: 'A' };
    const second = { id_task: 'b', title: 'B' };
    readDataTasksFirestore.mockResolvedValueOnce(makeSnapshot([first, second]));
    const setTasks = vi.fn();

    await readTasksService(setTasks);

    expect(setTasks).toHaveBeenCalledTimes(1);
    expect(setTasks).toHaveBeenCalledWith([first, second]);
  });

  it('UT-TASK-07: readTasksService sets an empty list when the snapshot is empty', async () => {
    readDataTasksFirestore.mockResolvedValueOnce({ empty: true, docs: [] });
    const setTasks = vi.fn();

    await readTasksService(setTasks);

    expect(setTasks).toHaveBeenCalledWith([]);
  });

  it('UT-TASK-08: getUserPermissionService sets permissions only when the user document exists', async () => {
    const permissions = { Write: true, Delete: false };
    readDataUserFirestore.mockResolvedValueOnce(makeSnapshot([{ permissions }]));
    const setUserPermission = vi.fn();

    await getUserPermissionService(USER, setUserPermission);

    expect(setUserPermission).toHaveBeenCalledWith(permissions);

    // Missing user document: the setter must not be called.
    readDataUserFirestore.mockResolvedValueOnce({ empty: true, docs: [] });
    const emptySetter = vi.fn();

    await getUserPermissionService(USER, emptySetter);

    expect(emptySetter).not.toHaveBeenCalled();
  });
});
