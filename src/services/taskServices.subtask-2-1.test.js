import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockCreateTaksFirestore,
  mockDeleteTaskFirestore,
  mockReadDataTasksFirestore,
  mockReadDataUserFirestore,
  mockUpdateTaskFirestore,
  mockFire,
} = vi.hoisted(() => ({
  mockCreateTaksFirestore: vi.fn(),
  mockDeleteTaskFirestore: vi.fn(),
  mockReadDataTasksFirestore: vi.fn(),
  mockReadDataUserFirestore: vi.fn(),
  mockUpdateTaskFirestore: vi.fn(),
  mockFire: vi.fn(),
}));

vi.mock('../config/firestoreCalls', () => ({
  createTaksFirestore: mockCreateTaksFirestore,
  deleteTaskFirestore: mockDeleteTaskFirestore,
  readDataTasksFirestore: mockReadDataTasksFirestore,
  readDataUserFirestore: mockReadDataUserFirestore,
  updateTaskFirestore: mockUpdateTaskFirestore,
}));

vi.mock('sweetalert2', () => ({
  default: { fire: mockFire },
}));

import {
  createTaskService,
  deleteTaskService,
  readTasksService,
  updateTaskService,
} from './taskServices';

const EMPTY_TITLE_MESSAGE = 'El título y el contenido no pueden estar vacíos';

describe('subtask-2-1: createTaskService', () => {
  let setTitle;
  let setContent;
  let setTasks;
  let readTasksMock;
  const user = { email: 'ana@test.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTaksFirestore.mockResolvedValue(undefined);
    mockFire.mockResolvedValue(undefined);
    setTitle = vi.fn();
    setContent = vi.fn();
    setTasks = vi.fn();
    readTasksMock = vi.fn().mockResolvedValue(undefined);
  });

  it('TC-2-1-01: rejects creation with an empty title and shows an error alert', async () => {
    const result = await createTaskService(
      '',
      'Contenido válido',
      user,
      setTitle,
      setContent,
      setTasks,
      readTasksMock
    );

    expect(mockFire).toHaveBeenCalledTimes(1);
    expect(mockFire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MESSAGE, 'error');
    expect(mockCreateTaksFirestore).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
    expect(readTasksMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('TC-2-1-02: rejects creation when the title or the content contains only whitespace', async () => {
    const invalidCombinations = [
      { title: '   ', content: 'Contenido válido' },
      { title: 'Título válido', content: '   ' },
    ];

    for (const { title, content } of invalidCombinations) {
      vi.clearAllMocks();
      const result = await createTaskService(
        title,
        content,
        user,
        setTitle,
        setContent,
        setTasks,
        readTasksMock
      );

      expect(mockFire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MESSAGE, 'error');
      expect(mockCreateTaksFirestore).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    }
  });

  it('TC-2-1-03: persists a valid task, clears the form, refreshes the list and shows success', async () => {
    await createTaskService(
      'Mi tarea',
      'Descripción',
      user,
      setTitle,
      setContent,
      setTasks,
      readTasksMock
    );

    expect(mockCreateTaksFirestore).toHaveBeenCalledTimes(1);
    expect(mockCreateTaksFirestore).toHaveBeenCalledWith('tasks', {
      title: 'Mi tarea',
      content: 'Descripción',
      creator: 'ana@test.com',
      created_at: expect.any(Date),
    });
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(mockFire).toHaveBeenCalledWith('Tarea Agregada', '', 'success');
  });
});

describe('subtask-2-1: updateTaskService', () => {
  let setEditTask;
  let setTitle;
  let setContent;
  let setTasks;
  let readTasksMock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateTaskFirestore.mockResolvedValue(undefined);
    mockFire.mockResolvedValue(undefined);
    setEditTask = vi.fn();
    setTitle = vi.fn();
    setContent = vi.fn();
    setTasks = vi.fn();
    readTasksMock = vi.fn();
  });

  it('TC-2-1-04: delegates the update to updateTaskFirestore, resets the form, refreshes and shows success', async () => {
    const editTask = {
      id_task: 'task-1',
      creator: 'ana@test.com',
      created_at: { seconds: 1700000000, nanoseconds: 0 },
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

    expect(mockUpdateTaskFirestore).toHaveBeenCalledTimes(1);
    expect(mockUpdateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      ...editTask,
      title: 'Título nuevo',
      content: 'Contenido nuevo',
    });
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledWith('');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(mockFire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
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

    expect(mockUpdateTaskFirestore).not.toHaveBeenCalled();
    expect(mockFire).not.toHaveBeenCalled();
    expect(setEditTask).not.toHaveBeenCalled();
    expect(readTasksMock).not.toHaveBeenCalled();
  });
});

describe('subtask-2-1: deleteTaskService', () => {
  it('TC-2-1-06: calls deleteTaskFirestore with the task id before refreshing the task list', async () => {
    vi.clearAllMocks();
    mockDeleteTaskFirestore.mockResolvedValue(undefined);
    const setTasks = vi.fn();
    const readTasksMock = vi.fn();

    await deleteTaskService('task-9', setTasks, readTasksMock);

    expect(mockDeleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-9');
    expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    expect(mockDeleteTaskFirestore.mock.invocationCallOrder[0]).toBeLessThan(
      readTasksMock.mock.invocationCallOrder[0]
    );
  });
});

describe('subtask-2-1: readTasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-2-1-07: passes the mapped data of every returned document to setTasks', async () => {
    const taskA = { id_task: 'a', title: 'A', content: 'contenido A', creator: 'ana@test.com' };
    const taskB = { id_task: 'b', title: 'B', content: 'contenido B', creator: 'luis@test.com' };
    mockReadDataTasksFirestore.mockResolvedValue({
      empty: false,
      docs: [{ data: () => taskA }, { data: () => taskB }],
    });
    const setTasks = vi.fn();

    await readTasksService(setTasks);

    expect(mockReadDataTasksFirestore).toHaveBeenCalledWith('tasks', 'created_at');
    expect(setTasks).toHaveBeenCalledTimes(1);
    expect(setTasks).toHaveBeenCalledWith([taskA, taskB]);
  });

  it('TC-2-1-08: sets an empty list when the snapshot has no documents', async () => {
    mockReadDataTasksFirestore.mockResolvedValue({ empty: true, docs: [] });
    const setTasks = vi.fn();

    await readTasksService(setTasks);

    expect(setTasks).toHaveBeenCalledTimes(1);
    expect(setTasks).toHaveBeenCalledWith([]);
  });
});
