import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRb63cAubs_KDmsd3GL2EY9D5BWjiM3qA",
  authDomain: "webshield-db4b7.firebaseapp.com",
  projectId: "webshield-db4b7",
  storageBucket: "webshield-db4b7.firebasestorage.app",
  messagingSenderId: "227033388182",
  appId: "1:227033388182:web:10089c0bde4f209f12deb7",
};

const app = initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
export const auth = getAuth(app);
