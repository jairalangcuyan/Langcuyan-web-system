let notifications = []; // Array to store all notifications
let isNotificationOpen = false; // Flag to track if the notification modal is open
let isLoggedIn = false; // Flag to track if the user is logged in
let currentUser = null; // To store the current logged-in user

let requestQueue = [];
let isRequestProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            // Handle login logic and call onLoginSuccess with email
            onLoginSuccess(email);
        });
    }
});

// Function to be called when user successfully logs in
function onLoginSuccess(email) {
    isLoggedIn = true;
    currentUser = email; // Store the current user's email
    notifications = []; // Clear previous notifications when a new user logs in
    showMap(); // Call showMap when login is successful
    const loginNotification = {
        action: "Login",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(loginNotification); // Queue the login notification for the new user
}

// Function to show map and set up map functionality
export function showMap() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('map-container').style.display = 'block';

    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        if (isNotificationOpen) { 
            alert('Please close the notification before searching another location.');
            return; 
        }
        const query = document.getElementById('search-input').value;
        searchLocation(query, map);
    });

    document.getElementById('search-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            if (isNotificationOpen) {
                alert('Please close the notification before searching another location.');
                return; 
            }
            const query = event.target.value;
            searchLocation(query, map);
        }
    });

    const notificationButton = document.getElementById('notification-button');
    notificationButton.addEventListener('click', () => {
        showNotification(); // Show notification when button is clicked
        hideNotificationIndicator(); // Hide the notification indicator
    });

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logout(); // Call logout function
    });

    document.getElementById('close-button').addEventListener('click', () => {
        closeNotification(); // Close the notification modal
        hideNotificationIndicator(); // Hide the indicator when modal is closed
    });
}

// Function to process and send notifications
async function sendWebhook(notification) {
    const serverURL = 'http://localhost:3000/send-webhook'; // Update the URL to the new endpoint
    const response = await fetch(serverURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send notification to server: ${errorText}`);
    }

    return await response.json();
}

// Function to process notification queue
async function processQueue() {
    if (isRequestProcessing || requestQueue.length === 0) return;

    isRequestProcessing = true;
    const notification = requestQueue.shift();

    try {
        await sendWebhook(notification);
        console.log("Notification sent successfully:", notification);
        notifications.unshift(notification);
        updateNotificationScroll(); // Check for scroll update after adding notification
    } catch (error) {
        console.error("Failed to send notification:", error);
        requestQueue.unshift(notification);
    } finally {
        isRequestProcessing = false;
        if (requestQueue.length > 0) {
            setTimeout(processQueue, 500);
        }
    }
}

// Function to update the scrollability of the notification container
function updateNotificationScroll() {
    const notificationContainer = document.getElementById('notification');
    if (notifications.length > 3) {
        notificationContainer.classList.add('scrollable');  // Enable scrolling
    } else {
        notificationContainer.classList.remove('scrollable');  // Disable scrolling
    }
}


// Function to queue notifications and show indicator
export function queueNotification(notification) {
    requestQueue.push(notification);
    showNotificationIndicator();
    processQueue();
}

// Function to search for a location using OpenStreetMap geocoding API
function searchLocation(query, map) {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;

    console.log('Fetching location for query:', query);
    console.log('Geocoding URL:', geocodingUrl);

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                map.setView([location.lat, location.lon], 13);
                L.marker([location.lat, location.lon])
                    .addTo(map)
                    .bindPopup(location.display_name)
                    .openPopup();

                const notification = {
                    action: "Location Search",
                    location: location.display_name,
                    timestamp: new Date().toISOString(),
                };

                queueNotification(notification);
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            alert('Error fetching location: ' + error.message);
        });
}

// Function to show notification modal
function showNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');
    const notificationElement = document.getElementById('notification');

    notificationElement.innerHTML = '';

    if (notifications.length > 0) {
        notifications.forEach((notif) => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';

            if (notif.action === "Login") {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Email:</strong> ${notif.email} - <strong>Timestamp:</strong> ${notif.timestamp}`;
            } else {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Location:</strong> ${notif.location} - <strong>Timestamp:</strong> ${notif.timestamp}`;
            }

            notificationElement.appendChild(notificationItem);
        });
    } else {
        notificationElement.innerHTML = '<p>No notifications available.</p>';
    }

    overlay.style.display = 'block';
    notificationModal.style.display = 'block';
    isNotificationOpen = true;
}

// Function to hide notification indicator
function hideNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'none';
}

// Function to show notification indicator
function showNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'block';
}

// Function to close the notification modal
function closeNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');

    overlay.style.display = 'none';
    notificationModal.style.display = 'none';
    isNotificationOpen = false;
}

// Function to handle logout functionality
function logout() {
    // Clear notifications when user logs out
    notifications = [];
    currentUser = null;
    isLoggedIn = false;
    clearInputFields();
    showLoginForm();
}

// Function to clear input fields
function clearInputFields() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
}

// Function to show the login form after logout
function showLoginForm() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('map-container').style.display = 'none';
}

// Dummy functions to simulate login and signup
function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const notification = {
        action: "Login",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(notification);
    onLoginSuccess(email);
}

function signup(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const notification = {
        action: "Sign Up",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(notification);
    alert('Sign up successful! You can now log in.');
}
