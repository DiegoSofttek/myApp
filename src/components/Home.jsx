import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Input, Pagination, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { DeleteFilled, EditFilled } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { formatDate, convertTimestampToDate } from '../utilities/utils';
import {
  createTaskService,
  deleteTaskService,
  getUserPermissionService,
  readTasksService,
  updateTaskService,
} from '../services/taskServices';

export default function Home() {
  const { user } = useAuth();
  const [userPermission, setUserPermission] = useState({});
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    if (tasks.length === 0) {
      getUserPermissionService(user, setUserPermission);
      readTasksService(setTasks);
    }
  }, [tasks]);

  //Crear tarea
  const createTask = async () => {
    await createTaskService(
      title,
      content,
      user,
      setTitle,
      setContent,
      setTasks,
      readTasksService
    );
  };

  //Actualizar Tarea

  //Iniciar la edición de la tarea
  const startEdit = (task) => {
    // if(task.creator === user.email){

    //   setEditTask(task);
    //   setTitle(task.title);
    //   setContent(task.content);
    // }else{
    //   console.log('No tienes permiso de editar esta tarea');
    // }

    //console.log(task);

    setEditTask(task);
    setTitle(task.title);
    setContent(task.content);
  };

  const updateTask = async () => {
    await updateTaskService(
      editTask,
      title,
      content,
      setEditTask,
      setTitle,
      setContent,
      setTasks,
      readTasksService
    );
  };

  //Cancelar la edición de la tarea
  const cancelEdit = () => {
    setEditTask(null);
    setTitle('');
    setContent('');
  };

  //Confirma la eliminación de la tarea
  const confirmDeleteTask = (id_task) => {
    Swal.fire({
      title: '¿Quieres eliminar esta tarea?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTaskService(id_task, setTasks, readTasksService);

        Swal.fire('Tarea Eliminada', '', 'success');
      }
    });
  };

  const changeTitle = (inputValue) => {
    setTitle(inputValue.target.value);
  };

  const changeContent = (inputValue) => {
    setContent(inputValue.target.value);
  };

  //Paginación
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h2 style={{ color: 'black' }}>Lista de Tareas</h2>

      <div className='tasks-container'>
        {userPermission.Write && (
          <div
            xs={24}
            md={12}
            className={`form-task-container ${editTask ? 'add-height' : ''}`}
          >
            <h2>{editTask ? 'Editar Tarea' : 'Agregar Tarea'}</h2>

            <div className='field'>
              <label style={{ color: 'black', fontWeight: 'bold' }}>
                Título:
              </label>
              <Input
                size='large'
                placeholder='Título'
                className='input'
                value={title}
                onChange={changeTitle}
              ></Input>
            </div>

            <TextArea
              placeholder='Descripción de la tarea...'
              style={{ marginTop: '1rem', height: '100px' }}
              className='input text-area'
              value={content}
              onChange={changeContent}
            ></TextArea>

            <Button
              color='purple'
              variant='solid'
              style={{
                marginTop: '1.5rem',
                display: 'inline-block',
                width: '100%',
                fontWeight: 'bold',
              }}
              onClick={editTask ? updateTask : createTask}
              disabled={!title || !content}
            >
              {editTask ? 'Actualizar' : 'Agregar'}
            </Button>
            {editTask && (
              <Button
                color='red'
                variant='solid'
                style={{
                  marginTop: '0.5rem',
                  display: 'inline-block',
                  width: '100%',
                  fontWeight: 'bold',
                }}
                onClick={cancelEdit}
              >
                Cancelar
              </Button>
            )}
          </div>
        )}

        <div
          xs={24}
          md={userPermission.Writer ? 12 : 24}
          className={`list-tasks-container ${
            userPermission === 'read' || userPermission === 'delete'
              ? 'read-delete'
              : ''
          }`}
        >
          {/* {tasks.length > 0 &&
                <ul>
                  {tasks.map((task, index) => (
                    <li key={index}>{JSON.stringify(task)}</li>
                  ))}
                </ul>
              } */}

          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task, index) => (
              <div className='task-container' key={index}>
                <div className='task-content'>
                  <div className='task-header'>
                    <h3>{task.title}</h3>
                  </div>

                  <div className='task-description'>
                    <p>{task.content}</p>
                  </div>

                  <div className='task-footer'>
                    <h4>{task.creator}</h4>
                    <h5>
                      {formatDate(convertTimestampToDate(task.created_at))}
                    </h5>
                  </div>
                </div>

                <div className='task-action'>
                  {userPermission.Write && task.creator === user.email && (
                    <button
                      onClick={() => startEdit(task)}
                      className={`btn-edit ${
                        userPermission.Write && task.creator === user.email
                          ? 'border-radius'
                          : ''
                      }`}
                    >
                      <EditFilled></EditFilled>
                    </button>
                  )}

                  {userPermission.Delete && (
                    <button
                      onClick={() => confirmDeleteTask(task.id_task)}
                      className={`btn-delete ${
                        userPermission.Delete ? 'border-radius' : ''
                      }`}
                    >
                      <DeleteFilled></DeleteFilled>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <h4 style={{ marginTop: '1rem' }}>No hay tareas para mostrar</h4>
          )}

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tasks.length}
            onChange={handlePageChange}
            style={{ marginTop: '1rem', textAlign: 'center' }}
          ></Pagination>
        </div>
      </div>
    </div>
  );
}
