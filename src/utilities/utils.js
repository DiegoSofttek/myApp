// Función para convertir un timestamp de Firebase a un objeto Date de JavaScript
export const convertTimestampToDate = (timestamp) => {
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
export const formatDate = (date) => {
    // Opciones de formato para la fecha: año, mes (en formato largo) y día
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    // Convertir la fecha a un string utilizando las opciones especificadas y el idioma español
    return date.toLocaleDateString('es-ES', options);
  }