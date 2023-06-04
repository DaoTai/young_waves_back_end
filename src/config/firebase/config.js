// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyDj6f8Qh8gfW8uI3ULjQGmjyG2on05dRZU",
   authDomain: "young-waves.firebaseapp.com",
   projectId: "young-waves",
   storageBucket: "young-waves.appspot.com",
   messagingSenderId: "777128159015",
   appId: "1:777128159015:web:1586420850dc3d3fc96b02",
   measurementId: "G-K20VEFBDNY",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const storage = firebase.storage();

export default firebase;
