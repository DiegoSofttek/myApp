import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Subtask subtask-2-1: task services (src/services/taskServices.js)

const firestore = vi.hoisted(() => ({
  createTaksFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  readDataUserFirestore: vi.fn(),
}));

const swal = vi.hoisted(() => ({
  fire: vi.fn(),
}));

vi.mock('../config/firestoreCalls', () => firestore);
vi.mock('sweetalert2', () => ({ default: swal }));

import {
  createTaskService,
  updateTaskService,
  deleteTaskService,
  readTasksService,
} from './taskServices';

const EMPTY_TITLE_MSG = 'El título y el contenido no pueden estar vacíos';

function makeSetters() {
  return {
    setTitle: vi.fn(),
    setContent: vi.fn(),
    setEditTask: vi.fn(),
    setTasks: vi.fn(),
    readTasksService: vi.fn(),
  };
}

describe('subtask-2-1 | createTaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-2-1-01: rejects an empty or whitespace-only title with an error alert and does not write, clear, or refresh', async () => {
    for (const title of ['', '   ']) {
      vi.clearAllMocks();
      const s = makeSetters();

      await expect(
        createTaskService(title, 'contenido', { email: 'a@b.com' }, s.setTitle, s.setContent, s.setTasks, s.readTasksService)
      ).resolves.toBeUndefined();

      expect(swal.fire).toHaveBeenCalledTimes(1);
      expect(swal.fire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MSG, 'error');
      expect(firestore.createTaksFirestore).not.toHaveBeenCalled();
      expect(s.setTitle).not.toHaveBeenCalled();
      expect(s.setContent).not.toHaveBeenCalled();
      expect(s.readTasksService).not.toHaveBeenCalled();
    }
  });

  it('TC-2-1-02: rejects an empty or whitespace-only content with a valid title and does not write, clear, or refresh', async () => {
    for (const content of ['', '   ']) {
      vi.clearAllMocks();
      const s = makeSetters();

      await expect(
        createTaskService('Título válido', content, { email: 'a@b.com' }, s.setTitle, s.setContent, s.setTasks, s.readTasksService)
      ).resolves.toBeUndefined();

      expect(swal.fire).toHaveBeenCalledTimes(1);
      expect(swal.fire).toHaveBeenCalledWith('Error', EMPTY_TITLE_MSG, 'error');
      expect(firestore.createTaksFirestore).not.toHaveBeenCalled();
      expect(s.setTitle).not.toHaveBeenCalled();
      expect(s.setContent).not.toHaveBeenCalled();
      expect(s.readTasksService).not.toHaveBeenCalled();
    }
  });

  it('TC-2-1-03: with valid title and content writes the task, clears the form, refreshes the list, and shows success', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    try {
      const s = makeSetters();
      const user = { email: 'user@test.com' };

      await createTaskService('Mi tarea', 'Mi contenido', user, s.setTitle, s.setContent, s.setTasks, s.readTasksService);

      expect(firestore.createTaksFirestore).toHaveBeenCalledTimes(1);
      expect(firestore.createTaksFirestore).toHaveBeenCalledWith('tasks', {
        title: 'Mi tarea',
        content: 'Mi contenido',
        creator: 'user@test.com',
        created_at: new Date('2024-01-01T00:00:00.000Z'),
      });
      expect(s.setTitle).toHaveBeenCalledWith('');
      expect(s.setContent).toHaveBeenCalledWith('');
      expect(s.readTasksService).toHaveBeenCalledWith(s.setTasks);
      expect(swal.fire).toHaveBeenCalledWith('Tarea Agregada', '', 'success');
    } finally {
      vi.useRealTimers();
    }
  });

  it('TC-2-1-08: when the Firestore write rejects, the promise rejects and no refresh or success alert runs (characterization)', async () => {
    firestore.createTaksFirestore.mockRejectedValueOnce(new Error('write failed'));
    const s = makeSetters();

    await expect(
      createTaskService('Título', 'Contenido', { email: 'a@b.com' }, s.setTitle, s.setContent, s.setTasks, s.readTasksService)
    ).rejects.toThrow('write failed');

    expect(s.readTasksService).not.toHaveBeenCalled();
    expect(swal.fire).not.toHaveBeenCalledWith('Tarea Agregada', '', 'success');
    expect(s.setTitle).not.toHaveBeenCalled();
    expect(s.setContent).not.toHaveBeenCalled();
  });
});

describe('subtask-2-1 | updateTaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-2-1-04: updates the Firestore document with the merged task, resets the edit form, refreshes, and shows success', async () => {
    const s = makeSetters();
    const editTask = {
      id_task: 'task-1',
      creator: 'user@test.com',
      created_at: { seconds: 1704067200, nanoseconds: 0 },
      title: 'Viejo',
      content: 'Viejo contenido',
    };

    await updateTaskService(editTask, 'Nuevo', 'Nuevo contenido', s.setEditTask, s.setTitle, s.setContent, s.setTasks, s.readTasksService);

    expect(firestore.updateTaskFirestore).toHaveBeenCalledTimes(1);
    expect(firestore.updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
      ...editTask,
      title: 'Nuevo',
      content: 'Nuevo contenido',
    });
    expect(s.setEditTask).toHaveBeenCalledWith(null);
    expect(s.setTitle).toHaveBeenCalledWith('');
    expect(s.setContent).toHaveBeenCalledWith('');
    expect(s.readTasksService).toHaveBeenCalledWith(s.setTasks);
    expect(swal.fire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('TC-2-1-05: does nothing when editTask is null', async () => {
    const s = makeSetters();

    await expect(
      updateTaskService(null, 'Título', 'Contenido', s.setEditTask, s.setTitle, s.setContent, s.setTasks, s.readTasksService)
    ).resolves.toBeUndefined();

    expect(firestore.updateTaskFirestore).not.toHaveBeenCalled();
    expect(s.setEditTask).not.toHaveBeenCalled();
    expect(s.setTitle).not.toHaveBeenCalled();
    expect(s.setContent).not.toHaveBeenCalled();
    expect(s.readTasksService).not.toHaveBeenCalled();
    expect(swal.fire).not.toHaveBeenCalled();
  });
});

describe('subtask-2-1 | deleteTaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-2-1-06: deletes the Firestore document before refreshing the list, and does not show an alert itself', async () => {
    const s = makeSetters();

    await deleteTaskService('task-9', s.setTasks, s.readTasksService);

    expect(firestore.deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-9');
    expect(s.readTasksService).toHaveBeenCalledWith(s.setTasks);
    expect(firestore.deleteTaskFirestore.mock.invocationCallOrder[0]).toBeLessThan(
      s.readTasksService.mock.invocationCallOrder[0]
    );
    expect(swal.fire).not.toHaveBeenCalled();
  });
});

describe('subtask-2-1 | readTasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-2-1-07: sets an empty list for an empty snapshot and the ordered mapped data for a two-document snapshot', async () => {
    const emptySetTasks = vi.fn();
    firestore.readDataTasksFirestore.mockResolvedValueOnce({ empty: true, docs: [] });

    await readTasksService(emptySetTasks);

    expect(firestore.readDataTasksFirestore).toHaveBeenCalledWith('tasks', 'created_at');
    expect(emptySetTasks).toHaveBeenCalledWith([]);

    const taskA = { id_task: 'a', title: 'A', content: 'a', creator: 'x@test.com' };
    const taskB = { id_task: 'b', title: 'B', content: 'b', creator: 'x@test.com' };
    const filledSetTasks = vi.fn();
    firestore.readDataTasksFirestore.mockResolvedValueOnce({
      empty: false,
      docs: [{ data: () => taskA }, { data: () => taskB }],
    });

    await readTasksService(filledSetTasks);

    expect(filledSetTasks).toHaveBeenCalledTimes(1);
    expect(filledSetTasks).toHaveBeenCalledWith([taskA, taskB]);
  });
});
