import firebaseAcademia from "./firebaseConfig";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(firebaseAcademia);

export const signInUser = (email, password) => {

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        //const user = userCredential.user;
        console.log(userCredential);
    })
    .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        console.log(error);
    });

    //Lo podemos utilizar cuando la función es asincrona
    // try{
    //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //     //console.log(userCredential);
    //     return userCredential;
    // }catch(error){
    //     console.log(error);
    //     throw error;
    // }
}

export const createUser = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        //const user = userCredential.user;
        console.log(userCredential);
    })
    .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        console.log(error);
    });
}

export const logoutFirebase = () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log('Cerró Sesión');
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

export const userListener = (listener) => {
    onAuthStateChanged(auth, (user) => {
        listener(user);
    })
}