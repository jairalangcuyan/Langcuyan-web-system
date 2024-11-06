// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"; // Import Firebase initialization function
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Import Firebase Auth functions
import { showMap, queueNotification } from "./map.js"; // Import custom functions from map.js

// Firebase configuration with project credentials
const firebaseConfig = {
    apiKey: "AIzaSyCzQMbVhBJD5Q-LDrZg487SI9SjsIUH2ac", // API key for Firebase project
    authDomain: "sia101-70c6c.firebaseapp.com", // Auth domain for Firebase project
    projectId: "sia101-70c6c", // Project ID for Firebase project
    storageBucket: "sia101-70c6c.appspot.com", // Storage bucket URL for Firebase project
    messagingSenderId: "145187488457", // Sender ID for Firebase messaging
    appId: "1:145187488457:web:ee66a134ecd1d553da8318", // App ID for Firebase project
    measurementId: "G-C8M44XPJQ3" // Measurement ID for Firebase analytics
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig); // Create a Firebase app instance with the config
const auth = getAuth(app); // Initialize Firebase Auth instance with the app

// Function to toggle between login and signup forms
window.toggleForms = function() {
    const loginForm = document.getElementById('login-form'); // Get login form element
    const signupForm = document.getElementById('signup-form'); // Get signup form element
    
    // Toggle visibility of login and signup forms
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block'; // Show login form if it was hidden
        signupForm.style.display = 'none'; // Hide signup form
    } else {
        loginForm.style.display = 'none'; // Hide login form
        signupForm.style.display = 'block'; // Show signup form
    }

    // Clear input fields to reset form values when toggling
    document.getElementById('login-email').value = ''; // Clear login email input
    document.getElementById('login-password').value = ''; // Clear login password input
    document.getElementById('signup-email').value = ''; // Clear signup email input
    document.getElementById('signup-password').value = ''; // Clear signup password input
};

// Login function using Firebase Auth
window.login = async function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    const email = document.getElementById('login-email').value; // Get entered email from login form
    const password = document.getElementById('login-password').value; // Get entered password from login form

    try {
        await signInWithEmailAndPassword(auth, email, password); // Attempt to log in using Firebase Auth
        alert('Login successful!'); // Notify user of successful login

        // Create a notification object for login action
        const loginNotification = {
            action: "Login", // Action type for notification
            email: email, // Store user's email in notification
            timestamp: new Date().toISOString(), // Capture the current timestamp
        };
        queueNotification(loginNotification); // Queue the login notification for display

        showMap(); // Call function to display the map after successful login
    } catch (error) {
        alert(`Login failed: ${error.message}`); // Show error message if login fails
    }
};

// Signup function using Firebase Auth
window.signup = async function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    const email = document.getElementById('signup-email').value; // Get entered email from signup form
    const password = document.getElementById('signup-password').value; // Get entered password from signup form

    try {
        await createUserWithEmailAndPassword(auth, email, password); // Create a new user account in Firebase Auth
        alert('Signup successful! Please log in.'); // Notify user of successful signup
        toggleForms(); // Switch to login form after successful signup
    } catch (error) {
        alert(`Signup failed: ${error.message}`); // Show error message if signup fails
    }
};

// Logout function to reset forms and log out from Firebase
window.logout = async function() {
    try {
        await signOut(auth); // Log out the current user from Firebase Auth
        alert("You have been logged out."); // Notify user of successful logout

        // Clear any displayed notifications
        const notificationElement = document.getElementById('notification'); // Get notification element
        notificationElement.innerHTML = ''; // Clear all notifications

        // Reset input fields for login and signup forms
        document.getElementById('login-email').value = ''; // Clear login email input
        document.getElementById('login-password').value = ''; // Clear login password input
        document.getElementById('signup-email').value = ''; // Clear signup email input
        document.getElementById('signup-password').value = ''; // Clear signup password input

        // Show the login form and hide the signup form after logout
        document.getElementById('login-form').style.display = 'block'; // Show login form
        document.getElementById('signup-form').style.display = 'none'; // Hide signup form
    } catch (error) {
        alert(`Logout failed: ${error.message}`); // Show error message if logout fails
    }
};
