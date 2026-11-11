import { describe, it, expect, vi, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import {
  createTaksFirestore,
  deleteTaskFirestore,
  readDataTasksFirestore,
  updateTaskFirestore,
} from '../config/firestoreCalls';
import {
  createTaskService,
  deleteTaskService,
  readTasksService,
  updateTaskService,
} from './taskServices';

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

const EMPTY_TITLE_MESSAGE = 'El título y el contenido no pueden estar vacíos';

describe('subtask-2-1: taskServices', () => {
  let setTitle;
  let setContent;
  let setTasks;
  let setEditTask;
  let readTasksMock;
  const user = { email: 'owner@test.com' };

  beforeEach(() => {
    vi.resetAllMocks();
    setTitle = vi.fn();
    setContent = vi.fn();
    setTasks = vi.fn();
    setEditTask = vi.fn();
    readTasksMock = vi.fn().mockResolvedValue(undefined);
    createTaksFirestore.mockResolvedValue(undefined);
    updateTaskFirestore.mockResolvedValue(undefined);
    deleteTaskFirestore.mockResolvedValue(undefined);
    Swal.fire.mockResolvedValue(undefined);
  });

  it('TC-2-1-01: rejects creation with an empty or whitespace-only title', async () => {
    for (const title of ['', '   ']) {
      vi.clearAllMocks();

      const result = await createTaskService(
        title,
        'Contenido válido',
        user,
        setTitle,
        setContent,
        setTasks,
        readTasksMock
      );

      expect(Swal.fire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MESSAGE, 'error');
      expect(createTaksFirestore).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    }
  });

  it('TC-2-1-02: rejects creation with an empty or whitespace-only content', async () => {
    for (const content of ['', '   ']) {
      vi.clearAllMocks();

      const result = await createTaskService(
        'Título válido',
        content,
        user,
        setTitle,
        setContent,
        setTasks,
        readTasksMock
      );

      expect(Swal.fire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MESSAGE, 'error');
      expect(createTaksFirestore).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    }
  });

  it('TC-2-1-03: creates a task with valid title and content, clears the form, reloads and reports success', async () => {
    await createTaskService(
      'Mi tarea',
      'Mi contenido',
      user,
      setTitle,
      setContent,
      setTasks,
      readTasksMock
    );

    expect(createTaksFirestore).toHaveBeenCalledTimes(1);
    expect(createTaksFirestore).toHaveBeenCalledWith(
      'tasks',
      expect.objectContaining({
        title: 'Mi tarea',
        content: 'Mi contenido',
        creator: 'owner@test.com',
        created_at: expect.any(Date),
      })
    );
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(Swal.fire).toHaveBeenCalledWith('Tarea Agregada', '', 'success');
  });

  it('TC-2-1-04: updates the edited task with new title and content, resets edit state and reports success', async () => {
    const editTask = {
      id_task: 'task-1',
      title: 'Título anterior',
      content: 'Contenido anterior',
      creator: 'owner@test.com',
      created_at: { seconds: 1705314600, nanoseconds: 0 },
    };

    await updateTaskService(
      editTask,
      'Título nuevo',
      'Contenido nuevo',
      setEditTask,
      setTitle,
      setContent,
      setTasks,
      readTasksMock
    );

    expect(updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      ...editTask,
      title: 'Título nuevo',
      content: 'Contenido nuevo',
    });
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(Swal.fire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('TC-2-1-05: does nothing when there is no task being edited', async () => {
    await updateTaskService(
      null,
      'Título',
      'Contenido',
      setEditTask,
      setTitle,
      setContent,
      setTasks,
      readTasksMock
    );

    expect(updateTaskFirestore).not.toHaveBeenCalled();
    expect(readTasksMock).not.toHaveBeenCalled();
    expect(setEditTask).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
  });

  it('TC-2-1-06: deletes the task in Firestore before reloading the task list', async () => {
    await deleteTaskService('task-1', setTasks, readTasksMock);

    expect(deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(deleteTaskFirestore.mock.invocationCallOrder[0]).toBeLessThan(
      readTasksMock.mock.invocationCallOrder[0]
    );
  });

  it('TC-2-1-07: passes the document data of a non-empty snapshot to setTasks in order', async () => {
    const taskA = { id_task: 'a', title: 'A', content: 'Contenido A', creator: 'x@test.com' };
    const taskB = { id_task: 'b', title: 'B', content: 'Contenido B', creator: 'y@test.com' };

    readDataTasksFirestore.mockResolvedValue({
      empty: false,
      docs: [{ data: () => taskA }, { data: () => taskB }],
    });

    await readTasksService(setTasks);

    expect(readDataTasksFirestore).toHaveBeenCalledWith('tasks', 'created_at');
    expect(setTasks).toHaveBeenCalledTimes(1);
    expect(setTasks).toHaveBeenCalledWith([taskA, taskB]);
  });

  it('TC-2-1-08: sets an empty array when the snapshot is empty', async () => {
    readDataTasksFirestore.mockResolvedValue({ empty: true, docs: [] });

    await readTasksService(setTasks);

    expect(setTasks).toHaveBeenCalledTimes(1);
    expect(setTasks).toHaveBeenCalledWith([]);
  });
});
