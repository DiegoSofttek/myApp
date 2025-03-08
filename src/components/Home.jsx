import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { Button, Col, Input, Pagination, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { createTaksFirestore, deleteTaskFirestore, readDataTasksFirestore, readDataUserFirestore, updateTaskFirestore } from '../config/firestoreCalls';
import { DeleteFilled, EditFilled } from '@ant-design/icons';
import Swal from 'sweetalert2';

export default function Home() {

  const {user} = useAuth();
  const [userPermission, setUserPermission] = useState({});
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if(!user)navigate('/login');
  }, [user]);

  useEffect(() => {
    if(tasks.length === 0){
      getUserPermission();
      readTasks();
    }
  }, [tasks]);

  //Verificar el permiso del usuario
  const getUserPermission = async() => {
    try{
      
      //Traer los datos del usuario
      const userDoc = await readDataUserFirestore('users', 'email', user.email);

      if(!userDoc.empty){
        const userData = userDoc.docs[0].data();
        //console.log(userData);
        //setUserPermission(userData.permission);
        //console.log(userData.permissions.Read);

        const permissions = userData.permissions;
        //console.log(permissions);

        setUserPermission(permissions);
      }else{
        console.log('No existe documento');
      }

    }catch(error){  
      console.log(error);
    }
  }

  //Leer la lista de tareas
  const readTasks = async () => {

    const lcTasks = await readDataTasksFirestore('tasks', 'created_at');

    if(!lcTasks.empty){
      // lcTasks.docs.forEach(doc => {
      //   //console.log(doc.data());
      //   //setTasks(doc.data());
      // });

      //Creamos un nuevo arreglo en listTasks con map y lo seteamos
      const listTasks = lcTasks.docs.map(doc => doc.data());
      setTasks(listTasks);
    }else{
      setTasks([]); // Asegúra de que el estado se vacíe si no hay tareas
    }
  }

  //Crear tarea
  const createTask = async () => {

    const newTask = {
      title,
      content,
      creator: user.email,
      created_at: new Date() 
    }

    await createTaksFirestore('tasks', newTask);

    //Limpiar formulario
    setTitle('');
    setContent('');

    readTasks(); //Actualiza las listas después de crear una tarea
    
    Swal.fire(
      'Tarea Agregada',
      '',
      'success'
    )
  }

  //Actualizar Tarea
  const updateTask = async() => {

    if(editTask){

      const updateTask = {
        ...editTask, //Se copian todas las propiedades del objeto
        title,
        content
      };

      //console.log(editTask.id_task);

      await updateTaskFirestore('tasks', editTask.id_task, updateTask);
      
      setEditTask(null);
      setTitle('');
      setContent('');
      readTasks();

      Swal.fire(
        'Tarea Actualizada!',
        '',
        'success'
      )
    }
  }

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
  }

  //Cancelar la edición de la tarea
  const cancelEdit = () => {
    setEditTask(null);
    setTitle('');
    setContent('');
  }

  //Eliminar tarea
  const deleteTask = async (id_task) => {
    await deleteTaskFirestore('tasks', id_task);
    readTasks();
  }

  //Confirma la eliminación de la tarea
  const confirmDeleteTask = (id_task) => {
    
    Swal.fire({
      title: '¿Quieres eliminar esta tarea?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if(result.isConfirmed){
        
        deleteTask(id_task);

        Swal.fire(
          'Tarea Eliminada',
          '',
          'success'
        );
      }
    });
  }

  // Función para convertir un timestamp de Firebase a un objeto Date de JavaScript
  const convertTimestampToDate = (timestamp) => {
    //El objeto Date de JS utiliza milisegundos para medir el tiempo
    //1 segundos = 1,000 milisegundos
    //1 nanosegundo = 1/1,000,000 de segundo)
    // 1 milisegundo = 1,000,000 nanosegundos

    // Crear un nuevo objeto Date utilizando los segundos y nanosegundos del timestamp
    // Multiplicamos los segundos por 1000 para convertirlos a milisegundos
    // Dividimos los nanosegundos por 1000000 para convertirlos a milisegundos
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    //console.log(date);
    return date;
  }

  // Función para formatear un objeto Date en un string legible
  const formatDate = (date) => {
    // Opciones de formato para la fecha: año, mes (en formato largo) y día
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    // Convertir la fecha a un string utilizando las opciones especificadas y el idioma español
    return date.toLocaleDateString('es-ES', options);
  }

  const changeTitle = (inputValue) => {

    setTitle(inputValue.target.value);
  }

  const changeContent = (inputValue) => {

    setContent(inputValue.target.value);
  }

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }

  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
        <h1>Tareas</h1>

        <div className='tasks-container'>

          { userPermission.Write && 
            (
              <div xs={24} md={12} className={`form-task-container ${editTask ? 'add-height' : ''}`}>
                <h2>{editTask ? 'Editar Tarea' : 'Agregar Tarea'}</h2>

                <div className='field'>
                  <label style={{color: 'black', fontWeight: 'bold'}}>Título:</label>
                  <Input
                    size='large'
                    placeholder='Título'
                    className='input'
                    value={title}
                    onChange={changeTitle}
                  >
                  </Input>
                </div>

                <TextArea
                  placeholder='Descripción de la tarea...'
                  style={{marginTop: '1rem', height: '100px'}}
                  className='input text-area'
                  value={content}
                  onChange={changeContent}
                >
                </TextArea>

                <Button
                  color='purple'
                  variant='solid'
                  style={{
                    marginTop: '1.5rem',
                    display: 'inline-block',
                    width: '100%',
                    fontWeight: 'bold'
                  }}
                  onClick={editTask ? updateTask : createTask}
                  disabled = {!title || !content}
                >
                  {editTask ? 'Actualizar' : 'Agregar'}
                </Button>
                { editTask && 
                  (
                    <Button
                      color='red'
                      variant='solid'
                      style={{
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        width: '100%',
                        fontWeight: 'bold'
                      }}
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </Button>
                  )
                }
              </div>
            )
          }

          <div xs={24} md={userPermission.Writer ? 12 : 24} 
            className={`list-tasks-container ${userPermission === 'read' || userPermission ==='delete' ? 'read-delete' : ''}`}
          >
              <h2>Lista de Tareas</h2>

              {/* {tasks.length > 0 &&
                <ul>
                  {tasks.map((task, index) => (
                    <li key={index}>{JSON.stringify(task)}</li>
                  ))}
                </ul>
              } */}

              {
                paginatedTasks.length > 0 ? (
                  paginatedTasks.map((task, index) =>(
                    <div className='task-container' key={index}>

                      <div className='task-content'>
                        <div className='task-header'>
                          <h3>{task.title}</h3>
                        </div>

                        <div className='task-description'>
                          <p>
                            {task.content}
                          </p>
                        </div>

                        <div className='task-footer'>
                          <h4>{task.creator}</h4>
                          <h5>{formatDate(convertTimestampToDate(task.created_at))}</h5>
                        </div>

                      </div>

                      <div className='task-action'>
                        { userPermission.Write && task.creator === user.email && 
                          <button 
                            onClick={() => startEdit(task)} 
                            className={`btn-edit ${userPermission.Write && task.creator === user.email ? 'border-radius' : ''}`}
                          >
                            <EditFilled></EditFilled>
                          </button>
                        }
                        
                        { userPermission.Delete &&
                          <button 
                            onClick={() => confirmDeleteTask(task.id_task)} 
                            className={`btn-delete ${userPermission.Delete ? 'border-radius' : ''}`}
                          >
                            <DeleteFilled></DeleteFilled>
                          </button>
                        }
                      </div>

                    </div>
                  ))
                ) : (
                  <h4 style={{marginTop: '1rem'}}>No hay tareas para mostrar</h4>
                )
              }
              
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={tasks.length}
                onChange={handlePageChange}
                style={
                  {marginTop: '1rem', textAlign: 'center'}
                }
              >
              </Pagination>

          </div>
        </div>
    </div>
  )
}
