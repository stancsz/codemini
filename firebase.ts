// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 apiKey: "AIzaSyDQ8h1Ymh-sz10k9UJbmC-6UTNhATSPQrk",
 authDomain: "codemini-abd3c.firebaseapp.com",
 projectId: "codemini-abd3c",
 storageBucket: "codemini-abd3c.appspot.com",
 messagingSenderId: "459088724172",
 appId: "1:459088724172:web:a3789fc8d8bfa7411e8269",
 measurementId: "G-8HNWPMGX8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db, doc, setDoc };
