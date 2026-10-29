import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/firestoreCalls', () => ({
  readDataUserFirestore: vi.fn(),
  readDataTasksFirestore: vi.fn(),
  createTaksFirestore: vi.fn(),
  updateTaskFirestore: vi.fn(),
  deleteTaskFirestore: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('../utilities/utils', () => ({
  convertTimestampToDate: vi.fn(),
  formatDate: vi.fn(),
}));

import Swal from 'sweetalert2';
import {
  createTaksFirestore,
  deleteTaskFirestore,
  readDataTasksFirestore,
  updateTaskFirestore,
} from '../config/firestoreCalls';
import { convertTimestampToDate, formatDate } from '../utilities/utils';
import {
  createTaskService,
  deleteTaskService,
  readTasksService,
  updateTaskService,
} from './taskServices';

const user = { email: 'ana@example.com' };

const makeSnapshot = (items) => ({
  empty: items.length === 0,
  docs: items.map((data) => ({ data: () => data })),
});

describe('taskServices (subtask-2-1)', () => {
  let setTitle;
  let setContent;
  let setTasks;
  let setEditTask;
  let readTasksMock;

  beforeEach(() => {
    vi.clearAllMocks();
    setTitle = vi.fn();
    setContent = vi.fn();
    setTasks = vi.fn();
    setEditTask = vi.fn();
    readTasksMock = vi.fn().mockResolvedValue(undefined);
    createTaksFirestore.mockResolvedValue(undefined);
    updateTaskFirestore.mockResolvedValue(undefined);
    deleteTaskFirestore.mockResolvedValue(undefined);
  });

  // UT-subtask-2-1-US-2-AC-1
  describe('createTaskService', () => {
    it('UT-subtask-2-1-US-2-AC-1-01 shows an error and does not save when title is empty or whitespace', async () => {
      await createTaskService('   ', 'contenido', user, setTitle, setContent, setTasks, readTasksMock);

      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'El título y el contenido no pueden estar vacíos',
        'error'
      );
      expect(createTaksFirestore).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
    });

    it('UT-subtask-2-1-US-2-AC-1-02 shows an error and does not save when content is empty or whitespace', async () => {
      await createTaskService('Título', '', user, setTitle, setContent, setTasks, readTasksMock);

      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'El título y el contenido no pueden estar vacíos',
        'error'
      );
      expect(createTaksFirestore).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
    });

    it('UT-subtask-2-1-US-2-AC-1-03 saves the task, clears the form, reloads the list and shows success', async () => {
      await createTaskService('Comprar pan', 'Dos bolsas', user, setTitle, setContent, setTasks, readTasksMock);

      expect(createTaksFirestore).toHaveBeenCalledTimes(1);
      expect(createTaksFirestore).toHaveBeenCalledWith('tasks', {
        title: 'Comprar pan',
        content: 'Dos bolsas',
        creator: 'ana@example.com',
        created_at: expect.any(Date),
      });
      expect(setTitle).toHaveBeenCalledWith('');
      expect(setContent).toHaveBeenCalledWith('');
      expect(readTasksMock).toHaveBeenCalledWith(setTasks);
      expect(Swal.fire).toHaveBeenCalledWith('Tarea Agregada', '', 'success');
    });

    it('UT-subtask-2-1-US-2-AC-1-04 clears the form and reloads only after the Firestore write resolves', async () => {
      let resolveWrite;
      createTaksFirestore.mockReturnValue(
        new Promise((resolve) => {
          resolveWrite = resolve;
        })
      );

      const pending = createTaskService(
        'Título', 'Contenido', user, setTitle, setContent, setTasks, readTasksMock
      );

      expect(setTitle).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();

      resolveWrite();
      await pending;

      expect(setTitle).toHaveBeenCalledWith('');
      expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    });

    it('UT-subtask-2-1-US-2-AC-1-05 keeps the form and does not reload when the write rejects', async () => {
      createTaksFirestore.mockRejectedValue(new Error('write failed'));

      await expect(
        createTaskService('Título', 'Contenido', user, setTitle, setContent, setTasks, readTasksMock)
      ).rejects.toThrow('write failed');

      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
      expect(Swal.fire).not.toHaveBeenCalled();
    });
  });

  // UT-subtask-2-1-US-2-AC-2
  describe('readTasksService', () => {
    it('UT-subtask-2-1-US-2-AC-2-01 passes the ordered task data to setTasks', async () => {
      const tasks = [
        { id_task: 'a', title: 'Uno', content: 'x', creator: user.email },
        { id_task: 'b', title: 'Dos', content: 'y', creator: user.email },
      ];
      readDataTasksFirestore.mockResolvedValue(makeSnapshot(tasks));

      await readTasksService(setTasks);

      expect(readDataTasksFirestore).toHaveBeenCalledWith('tasks', 'created_at');
      expect(setTasks).toHaveBeenCalledTimes(1);
      expect(setTasks).toHaveBeenCalledWith(tasks);
    });

    it('UT-subtask-2-1-US-2-AC-2-02 sets an empty list when the snapshot is empty', async () => {
      readDataTasksFirestore.mockResolvedValue(makeSnapshot([]));

      await readTasksService(setTasks);

      expect(setTasks).toHaveBeenCalledWith([]);
    });

    it('UT-subtask-2-1-US-2-AC-2-03 keeps created_at unchanged and does not format dates in the service', async () => {
      const timestamp = { seconds: 1700000000, nanoseconds: 0 };
      readDataTasksFirestore.mockResolvedValue(
        makeSnapshot([{ id_task: 'a', title: 'Uno', content: 'x', created_at: timestamp }])
      );

      await readTasksService(setTasks);

      const [[listTasks]] = setTasks.mock.calls;
      expect(listTasks[0].created_at).toBe(timestamp);
      expect(convertTimestampToDate).not.toHaveBeenCalled();
      expect(formatDate).not.toHaveBeenCalled();
    });
  });

  // UT-subtask-2-1-US-2-AC-3
  describe('updateTaskService', () => {
    const editTask = {
      id_task: 'task-1',
      title: 'Viejo',
      content: 'Viejo contenido',
      creator: user.email,
      created_at: { seconds: 1700000000, nanoseconds: 0 },
    };

    it('UT-subtask-2-1-US-2-AC-3-01 updates the task, resets the form, reloads and shows success', async () => {
      await updateTaskService(
        editTask, 'Nuevo', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasksMock
      );

      expect(updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1', {
        ...editTask,
        title: 'Nuevo',
        content: 'Nuevo contenido',
      });
      expect(setEditTask).toHaveBeenCalledWith(null);
      expect(setTitle).toHaveBeenCalledWith('');
      expect(setContent).toHaveBeenCalledWith('');
      expect(readTasksMock).toHaveBeenCalledWith(setTasks);
      expect(Swal.fire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
    });

    it('UT-subtask-2-1-US-2-AC-3-02 does nothing when there is no task being edited', async () => {
      await updateTaskService(
        null, 'Nuevo', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasksMock
      );
      await updateTaskService(
        undefined, 'Nuevo', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasksMock
      );

      expect(updateTaskFirestore).not.toHaveBeenCalled();
      expect(setEditTask).not.toHaveBeenCalled();
      expect(setTitle).not.toHaveBeenCalled();
      expect(setContent).not.toHaveBeenCalled();
      expect(readTasksMock).not.toHaveBeenCalled();
      expect(Swal.fire).not.toHaveBeenCalled();
    });

    it('UT-subtask-2-1-US-2-AC-3-03 preserves id_task, creator and created_at from the edited task', async () => {
      await updateTaskService(
        editTask, 'Nuevo', 'Nuevo contenido', setEditTask, setTitle, setContent, setTasks, readTasksMock
      );

      const [, , payload] = updateTaskFirestore.mock.calls[0];
      expect(payload.id_task).toBe('task-1');
      expect(payload.creator).toBe(user.email);
      expect(payload.created_at).toBe(editTask.created_at);
    });

    it.todo(
      'UT-subtask-2-1-US-2-AC-3-04 rejects empty title or content with an error and no write (open question: validation missing in source)'
    );
  });

  // Delete operation (supports US-2 list refresh)
  describe('deleteTaskService', () => {
    it('UT-subtask-2-1-DEL-01 deletes the task and reloads the list after the delete resolves', async () => {
      let resolveDelete;
      deleteTaskFirestore.mockReturnValue(
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
      );

      const pending = deleteTaskService('task-1', setTasks, readTasksMock);

      expect(deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-1');
      expect(readTasksMock).not.toHaveBeenCalled();

      resolveDelete();
      await pending;

      expect(readTasksMock).toHaveBeenCalledTimes(1);
      expect(readTasksMock).toHaveBeenCalledWith(setTasks);
    });
  });
});
