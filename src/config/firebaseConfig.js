// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env['VITE_APP_FIREBASE_APIKEY'],
  authDomain: import.meta.env['VITE_APP_FIREBASE_AUTHDOMAIN'],
  projectId: import.meta.env['VITE_APP_FIREBASE_PROJECTID'],
  storageBucket: import.meta.env['VITE_APP_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['VITE_APP_FIREBASE_SENDERID'],
  appId: import.meta.env['VITE_APP_FIREBASE_APPID']
};

// Initialize Firebase
const firebaseAcademia = initializeApp(firebaseConfig);
export default firebaseAcademia;