import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhCBX_QddFq8sJrQSvSQvg3gRsRvA1J1c",
  authDomain: "earning-416a0.firebaseapp.com",
  databaseURL: "https://earning-416a0-default-rtdb.firebaseio.com",
  projectId: "earning-416a0",
  storageBucket: "earning-416a0.firebasestorage.app",
  messagingSenderId: "774924829836",
  appId: "1:774924829836:web:5726732ee0888bc9a2a7a9"
};

// Initialize Firebase App Modules
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/**
 * Global Routing Route Protection Guard
 */
export function checkAuthGuard(redirectOnAuth = false) {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split("/").pop();
        
        if (user) {
            if (redirectOnAuth && (currentPage === "index.html" || currentPage === "" || currentPage === "signup.html")) {
                window.location.href = "dashboard.html";
            }
        } else {
            if (!redirectOnAuth && currentPage !== "index.html" && currentPage !== "signup.html" && currentPage !== "") {
                window.location.href = "index.html";
            }
        }
    });
}

export function logoutUser() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch(err => console.error("Signout Error Protocol:", err));
}
