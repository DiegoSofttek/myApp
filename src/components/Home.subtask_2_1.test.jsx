// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  navigate: vi.fn(),
  getUserPermissionService: vi.fn(),
  readTasksService: vi.fn(),
  createTaskService: vi.fn(),
  deleteTaskService: vi.fn(),
  updateTaskService: vi.fn(),
  convertTimestampToDate: vi.fn(),
  formatDate: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: mocks.auth,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('../services/taskServices', () => ({
  createTaskService: mocks.createTaskService,
  deleteTaskService: mocks.deleteTaskService,
  getUserPermissionService: mocks.getUserPermissionService,
  readTasksService: mocks.readTasksService,
  updateTaskService: mocks.updateTaskService,
}));

vi.mock('../utilities/utils', () => ({
  convertTimestampToDate: mocks.convertTimestampToDate,
  formatDate: mocks.formatDate,
}));

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

vi.mock('antd', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Col: ({ children }) => <div>{children}</div>,
  Input: (props) => <input {...props} />,
  Pagination: () => <div data-testid='pagination' />,
  Row: ({ children }) => <div>{children}</div>,
}));

vi.mock('antd/es/input/TextArea', () => ({
  default: (props) => <textarea {...props} />,
}));

vi.mock('@ant-design/icons', () => ({
  DeleteFilled: () => <span>delete icon</span>,
  EditFilled: () => <span>edit icon</span>,
}));

import Home from './Home';

describe('Home task list (subtask-2-1)', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockReturnValue({
      user: { email: 'authenticated@example.com' },
      loading: false,
      logout: vi.fn(),
    });
    mocks.getUserPermissionService.mockImplementation((_user, setPermission) => {
      setPermission({ Write: true });
    });
    mocks.convertTimestampToDate.mockImplementation((timestamp) => timestamp);
    mocks.formatDate.mockReturnValue('15 de marzo de 2024, 10:30');
  });

  it('subtask-2-1-TC04 renders available authenticated-user tasks after asynchronous loading', async () => {
    const tasks = [
      {
        id_task: 'one',
        title: 'First task',
        content: 'First task content',
        creator: 'first@example.com',
        created_at: { seconds: 1, nanoseconds: 0 },
      },
      {
        id_task: 'two',
        title: 'Second task',
        content: 'Second task content',
        creator: 'second@example.com',
        created_at: { seconds: 2, nanoseconds: 0 },
      },
    ];
    mocks.readTasksService.mockImplementation(async (setTasks) => {
      await Promise.resolve();
      setTasks(tasks);
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('First task')).toBeTruthy();
    });

    for (const task of tasks) {
      expect(screen.getByText(task.title)).toBeTruthy();
      expect(screen.getByText(task.content)).toBeTruthy();
      expect(screen.getByText(task.creator)).toBeTruthy();
    }
    expect(screen.getAllByText('15 de marzo de 2024, 10:30')).toHaveLength(2);
    expect(screen.queryByText('No hay tareas para mostrar')).toBeNull();
  });

  it('subtask-2-1-TC05 renders the empty-state message when task loading resolves empty', async () => {
    let hasSetEmptyTasks = false;
    mocks.readTasksService.mockImplementation((setTasks) => {
      if (!hasSetEmptyTasks) {
        hasSetEmptyTasks = true;
        setTasks([]);
      }
      return Promise.resolve();
    });

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByText('No hay tareas para mostrar')).toBeTruthy();
    });
    expect(document.querySelector('.task-container')).toBeNull();
    expect(screen.queryByText('First task')).toBeNull();
    expect(screen.queryByText('Second task')).toBeNull();
  });
});
