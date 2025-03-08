import { createTaksFirestore, deleteTaskFirestore, readDataTasksFirestore, 
    readDataUserFirestore, updateTaskFirestore } from '../config/firestoreCalls';
import Swal from 'sweetalert2';

//Servicio para verificar el permiso del usuario
export const getUserPermissionService = async(user, setUserPermission) => {
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

//Servicio para leer la lista de tareas
export const readTasksService = async (setTasks) => {

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

//Servicio para crear tarea
export const createTaskService = async(title, content, user, setTitle, setContent, setTasks, readTasksService) => {
    
    if(!title.trim() || !content.trim()){
        Swal.fire("Error", 'El título y el contenido no pueden estar vacíos', 'error');
        return;
    }
    
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
    
    await readTasksService(setTasks); //Actualiza las listas después de crear una tarea
        
    Swal.fire(
        'Tarea Agregada',
        '',
        'success'
    )
}

//Servicio para actualizar tarea
export const updateTaskService = async(editTask, title, content, setEditTask, setTitle, setContent, setTasks, readTasksService) => {

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
        readTasksService(setTasks);
  
        Swal.fire(
          'Tarea Actualizada!',
          '',
          'success'
        )
    }
}

//Servicio para eliminar tarea
export const deleteTaskService = async(id_task, setTasks, readTasksService) => {

    await deleteTaskFirestore('tasks', id_task);
    readTasksService(setTasks);
}