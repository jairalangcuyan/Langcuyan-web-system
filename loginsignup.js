import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzQMbVhBJD5Q-LDrZg487SI9SjsIUH2ac",
    authDomain: "sia101-70c6c.firebaseapp.com",
    projectId: "sia101-70c6c",
    storageBucket: "sia101-70c6c.appspot.com",
    messagingSenderId: "145187488457",
    appId: "1:145187488457:web:ee66a134ecd1d553da8318",
    measurementId: "G-C8M44XPJQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Show the registration form and hide the login form
document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registration").classList.remove("hidden");
    document.getElementById("login-form").classList.add("hidden");
});

// Show the login form and hide the registration form
document.getElementById("backtologin").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registration").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
});

// Registration function
document.getElementById('btn_reg').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("User Registered Successfully!");
            document.getElementById("registration").classList.add("hidden");
            document.getElementById("login-form").classList.remove("hidden");
        })
        .catch((error) => alert(error.message));
});

// Login function
document.getElementById("loginForm").addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showMap(); // Call to display map after successful login
        })
        .catch((error) => alert(error.message));
});

// Function to display the map and header, and hide the login form
function showMap() {
    // Remove login view and add map view
    document.body.classList.remove("login-view");
    document.body.classList.add("map-view");

    // Hide the login form and show the map and header
    document.querySelector(".container").classList.add("hidden");
    document.getElementById("map").classList.remove("hidden");
    document.querySelector(".header").classList.remove("hidden");
}
