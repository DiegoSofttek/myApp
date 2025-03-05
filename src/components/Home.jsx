import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { Button, Col, Input, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { createTaksFirestore, deleteTaskFirestore, readDataTasksFirestore } from '../config/firestoreCalls';
import { DeleteFilled } from '@ant-design/icons';

export default function Home() {

  const {user} = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if(!user)navigate('/login');
  }, [user]);

  useEffect(() => {
    if(user){
      readTasks();
    }
  }, [tasks]);

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
  }

  const deleteTask = async (id_task) => {
    await deleteTaskFirestore('tasks', id_task);
    readTasks();
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

  return (
    <div>
        <h1>Tareas</h1>

        <div className='tasks-container'>

          <div xs={24} md={12} className='form-task-container'>
            <h2>Agregar Tarea</h2>

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
              style={{margin: '1rem 0 0 0'}}
              className='input'
              value={content}
              onChange={changeContent}
            >
            </TextArea>

            <Button
              color='orange'
              variant='solid'
              style={{
                margin: '1.5rem 0 0 0',
                display: 'inline-block',
                width: '100%',
                fontWeight: 'bold'
              }}
              onClick={createTask}
            >
              Agregar
            </Button>
          </div>

          <div xs={24} md={12} className='list-tasks-container'>
              <h2>Lista de Tareas</h2>

              {/* {tasks.length > 0 &&
                <ul>
                  {tasks.map((task, index) => (
                    <li key={index}>{JSON.stringify(task)}</li>
                  ))}
                </ul>
              } */}

              {
                tasks.length > 0 ? (
                  tasks.map((task, index) =>(
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
                        <button onClick={() => deleteTask(task.id_task)}><DeleteFilled></DeleteFilled></button>
                      </div>

                    </div>
                  ))
                ) : (
                  <h4 style={{margin: '1rem 0 0 0'}}>No hay tareas para mostrar</h4>
                )
              }
              
          </div>
        </div>
    </div>
  )
}
