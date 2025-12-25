// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm_fd-pF3nlJjA0zQSzn9nBES87NBTGyY",
    authDomain: "happynation-b92ba.firebaseapp.com",
    projectId: "happynation-b92ba",
    storageBucket: "happynation-b92ba.firebasestorage.app",
    messagingSenderId: "309846990616",
    appId: "1:309846990616:web:afc26209fbb221026e886d",
    measurementId: "G-5P81S6R7JT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export { analytics };
