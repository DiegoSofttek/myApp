import { addDoc, doc, getFirestore, setDoc } from "firebase/firestore";
import firebaseAcademia from "./firebaseConfig";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(firebaseAcademia);
const db = getFirestore(firebaseAcademia);

export const signInUser = (email, password) => {

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        //const user = userCredential.user;
        //console.log(userCredential);
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

export const createUser = (path, email, password, name, lastname) => {
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        // Signed up 
        const user = userCredential.user;
        //console.log(userCredential);

        await createUserDocument(path, user, name, lastname, email);
        //console.log(user);
    })
    .catch((error) => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        console.log(error);
    });
}

export const createUserDocument = async(path, user, name, lastname, email) => {
    const userDocRef = doc(db, path, user.uid);
    const userData = {
        id_user: user.uid,
        name: name,
        lastname: lastname,
        email: email,
        permission: 'read',
        created_at: new Date()
    };

    await setDoc(userDocRef, userData);
}

export const logoutFirebase = () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        //console.log('Cerró Sesión');
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