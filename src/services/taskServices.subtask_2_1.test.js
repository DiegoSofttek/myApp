import { beforeEach, describe, expect, it, vi } from 'vitest';

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

import {
  createTaksFirestore,
  deleteTaskFirestore,
  updateTaskFirestore,
} from '../config/firestoreCalls';
import Swal from 'sweetalert2';
import {
  createTaskService,
  deleteTaskService,
  updateTaskService,
} from './taskServices';

describe('task services (subtask-2-1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subtask-2-1-TC01 rejects blank or whitespace-only task title/content', async () => {
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const refreshTasks = vi.fn();

    await createTaskService(
      '   ',
      '\t\n',
      { email: 'user@example.com' },
      setTitle,
      setContent,
      setTasks,
      refreshTasks
    );

    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'El título y el contenido no pueden estar vacíos',
      'error'
    );
    expect(createTaksFirestore).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
    expect(setTasks).not.toHaveBeenCalled();
    expect(refreshTasks).not.toHaveBeenCalled();
  });

  it('subtask-2-1-TC02 delegates a valid task update to Firebase and resets the edit form', async () => {
    const editTask = {
      id_task: 'task-42',
      title: 'Old title',
      content: 'Old content',
      creator: 'owner@example.com',
      created_at: { seconds: 100, nanoseconds: 0 },
      priority: 'high',
    };
    const setEditTask = vi.fn();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    const setTasks = vi.fn();
    const refreshTasks = vi.fn();
    updateTaskFirestore.mockResolvedValue(undefined);

    await updateTaskService(
      editTask,
      'Updated title',
      'Updated content',
      setEditTask,
      setTitle,
      setContent,
      setTasks,
      refreshTasks
    );

    expect(updateTaskFirestore).toHaveBeenCalledTimes(1);
    expect(updateTaskFirestore).toHaveBeenCalledWith('tasks', 'task-42', {
      ...editTask,
      title: 'Updated title',
      content: 'Updated content',
    });
    expect(setEditTask).toHaveBeenCalledTimes(1);
    expect(setEditTask).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledTimes(1);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setContent).toHaveBeenCalledTimes(1);
    expect(setContent).toHaveBeenCalledWith('');
    expect(refreshTasks).toHaveBeenCalledTimes(1);
    expect(refreshTasks).toHaveBeenCalledWith(setTasks);
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith('Tarea Actualizada!', '', 'success');
  });

  it('subtask-2-1-TC03 delegates task deletion to Firebase and requests a task refresh', async () => {
    const setTasks = vi.fn();
    const refreshTasks = vi.fn();
    deleteTaskFirestore.mockResolvedValue(undefined);

    await deleteTaskService('task-99', setTasks, refreshTasks);

    expect(deleteTaskFirestore).toHaveBeenCalledTimes(1);
    expect(deleteTaskFirestore).toHaveBeenCalledWith('tasks', 'task-99');
    expect(refreshTasks).toHaveBeenCalledTimes(1);
    expect(refreshTasks).toHaveBeenCalledWith(setTasks);
  });
});
