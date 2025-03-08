import firebaseAcademia from "./firebaseConfig";
import { collection, query, where, getDocs, getFirestore, addDoc, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";

const db = getFirestore(firebaseAcademia);

export const readDataUserFirestore = async (path, child, value) => {
    const q = query(
        collection(db, path),
        where(child, '==', value)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot;
}

//Tasks
export const readDataTasksFirestore = async (path, order) => {
    const q = query(
        collection(db, path),
        orderBy(order)
    )

    const querySnapshot = await getDocs(q);

    return querySnapshot;
}  

export const createTaksFirestore = async(path, task) => {
    try{
        const docRef = await addDoc(collection(db, path), task);
        //console.log(docRef.id);

        //Actualiza el documento con el id del documento
        await updateDoc(doc(db, path, docRef.id), {
            id_task: docRef.id
        })
    }catch(error){
        console.log(error);
    }
}

export const updateTaskFirestore = async(path, id_task, updateTask) => {
    try{
        const docRef = doc(db, path, id_task);
        await updateDoc(docRef, updateTask);
    }catch(error){
        console.log(error);
    }
}

export const deleteTaskFirestore = async(path, id_task) => {
    try{
        const docRef = doc(db, path, id_task);

        await deleteDoc(docRef);
    }catch(error){
        console.log(error);
    }
}