import { useState } from 'react';
/*
Guarda en local storage lo que se necesite
*/
export const useLocalStorage = (keyName, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    //intenta guardar en localstorage el item que se le pida
    try {
      const value = window.localStorage.getItem(keyName);
      //si hay un valor del item que se quiere guardar se inicializa con ese valor
      if (value) {
        return JSON.parse(value);
      } else {
        //sino se le pone un default value
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      //si hay algún error se pone el default value
      return defaultValue;
    }
  });
  /* se pone un nuevo valor para el item que se desea */
  const setValue = (newValue) => {
    try {
      //se intenta poner el nuevo valor
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
      //si algo sucede lanza un error
      console.log(err);
    }
    //se updatea el estado
    setStoredValue(newValue);
  };
  return [storedValue, setValue];
};
 
export default useLocalStorage;