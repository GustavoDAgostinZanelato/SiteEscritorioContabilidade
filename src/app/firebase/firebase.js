import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDWu48C3cZosDPZC7WZRu-F6fV-nBwFNLc",
  authDomain: "escritoriocontabilidade-ba493.firebaseapp.com",
  projectId: "escritoriocontabilidade-ba493",
  storageBucket: "escritoriocontabilidade-ba493.appspot.com",
  messagingSenderId: "883109832380",
  appId: "1:883109832380:web:c08fe630812494ef0f92b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {app};   