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
// Login function
document.getElementById("loginForm").addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // If login is successful, show success alert
            alert("Login Successfully!");
            // Redirect to map.html after successful login
            window.location.href = 'map.html'; // Change to the actual path of your map.html file
        })
        .catch((error) => {
            // If login fails, show error alert
            alert("Email or Password is Incorrect! Please Try Again!");
        });
});
