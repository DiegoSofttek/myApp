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
  const { user, loading } = useAuth();
  const [userPermission, setUserPermission] = useState({});
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  /*useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);*/

  useEffect(() => {
    // Solo redirige al login si YA terminó de cargar y de verdad no hay usuario
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // useEffect(() => {
  //   if (tasks.length === 0) {
  //     getUserPermissionService(user, setUserPermission);
  //     readTasksService(setTasks);
  //   }
  // }, [tasks]);

  useEffect(() => {
    if (!loading && user && tasks.length === 0) {
      getUserPermissionService(user, setUserPermission);
      readTasksService(setTasks);
    }
  }, [user, loading, tasks]);

  useEffect(() => {
    if (!loading && user && !editTask && tasks.length > 0) {
      const preferredTask =
        tasks.find((task) => task.title === 'Video del proyecto') || tasks[0];

      if (preferredTask) {
        setEditTask(preferredTask);
        setTitle(preferredTask.title || '');
        setContent(preferredTask.content || '');
      }
    }
  }, [loading, user, tasks, editTask]);

  // Si todavía está cargando la sesión, muestra un indicador en lugar de romper el flujo
  // if (loading) {
  //   return <div>Cargando sesión...</div>;
  // }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Cargando sesión...</h2>
      </div>
    );
  }

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
    <div style={{ padding: '32px' }}>
      <h2
        style={{
          color: 'black',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '40px',
        }}
      >
        Lista de Tareas
      </h2>

      <div
        className='tasks-container'
        style={{
          display: 'grid',
          gridTemplateColumns: userPermission.Write ? 'minmax(360px, 520px) 1fr' : '1fr',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {userPermission.Write && (
          <div
            xs={24}
            md={12}
            className={`form-task-container ${editTask ? 'add-height' : ''}`}
            style={{
              border: '1px solid #8a4bdb',
              borderRadius: '14px',
              padding: '32px 40px 28px',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                textAlign: 'center',
                color: '#d99200',
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '32px',
              }}
            >
              {editTask ? 'Editar Tarea' : 'Agregar Tarea'}
            </h2>

            <div
              className='field'
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <label
                style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}
              >
                Título:
              </label>
              <Input
                size='large'
                placeholder='Título'
                className='input'
                style={{ height: '48px' }}
                value={title}
                onChange={changeTitle}
              ></Input>
            </div>

            <TextArea
              placeholder='Descripción de la tarea...'
              style={{ marginTop: '1.5rem', height: '120px' }}
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
                height: '38px',
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
                  marginTop: '0.75rem',
                  display: 'inline-block',
                  width: '100%',
                  height: '38px',
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
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
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
              <div
                className='task-container'
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    userPermission.Write && task.creator === user.email
                      ? '1fr 100px'
                      : userPermission.Delete
                      ? '1fr 100px'
                      : '1fr',
                  border: '1px solid #8a4bdb',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div className='task-content' style={{ padding: '24px 20px' }}>
                  <div className='task-header'>
                    <h3 style={{ color: '#6f35d0', fontSize: '24px', margin: 0 }}>
                      {task.title}
                    </h3>
                  </div>

                  <div className='task-description'>
                    <p style={{ fontSize: '18px', margin: '20px 0 24px' }}>
                      {task.content}
                    </p>
                  </div>

                  <div
                    className='task-footer'
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '18px' }}>{task.creator}</h4>
                    <h5 style={{ margin: 0, color: '#d99200', fontSize: '16px' }}>
                      {formatDate(convertTimestampToDate(task.created_at))}
                    </h5>
                  </div>
                </div>

                <div
                  className='task-action'
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                  }}
                >
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
