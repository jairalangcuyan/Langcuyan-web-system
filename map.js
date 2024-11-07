let notifications = []; // Array to store all notifications
let isNotificationOpen = false; // Flag to track if the notification modal is open
let isLoggedIn = false; // Flag to track if the user is logged in
let currentUser = null; // Variable to store the current logged-in user's email

// Function to be called when a user successfully logs in
function onLoginSuccess(email) {
    isLoggedIn = true; // Set the user login status to true
    currentUser = email; // Store the current user's email
    notifications = []; // Clear previous notifications for the new user session
    showMap(); // Display the map when login is successful
    const loginNotification = {
        action: "Login", // Action type for notification
        email: email, // User email for notification
        timestamp: new Date().toISOString(), // Current timestamp for notification
    };
    addNotificationToUI(loginNotification); // Show login notification immediately
    queueNotification(loginNotification); // Add the login notification to the webhook queue
}

// Function to add notification to UI without waiting for webhook
function addNotificationToUI(notification) {
    notifications.unshift(notification); // Add notification to the notifications array
    showNotificationIndicator(); // Show notification indicator
    displayNotifications(); // Update notification modal if open
}

// Modified queueNotification function
export function queueNotification(notification) {
    addNotificationToUI(notification); // Display notification in UI immediately
    requestQueue.push(notification); // Add notification to the request queue for webhook
    processQueue(); // Start processing the webhook queue
}

// Wait for the DOM to be fully loaded before setting up event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button'); // Get login button element
    if (loginButton) { // If login button is found
        loginButton.addEventListener('click', () => { // Add click event to login button
            const email = document.getElementById('login-email').value; // Get email input value
            const password = document.getElementById('login-password').value; // Get password input value
            onLoginSuccess(email); 
        });
    }
});

export function showMap() {
    document.querySelector('.container').style.display = 'none'; // Hide the login container
    document.getElementById('map-container').style.display = 'block'; // Show the map container

    const map = L.map('map').setView([51.505, -0.09], 13); // Initialize the map at a default location
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, // Set maximum zoom level
        attribution: '&copy; OpenStreetMap contributors' // Map attribution
    }).addTo(map); // Add the map layer

    const searchButton = document.getElementById('search-button'); // Get the search button element
    searchButton.addEventListener('click', () => { // Add click event for search
        if (isNotificationOpen) { 
            alert('Please close the notification before searching another location.'); // Alert if notification is open
            return; 
        }
        const query = document.getElementById('search-input').value; // Get search query from input
        searchLocation(query, map); // Perform location search
    });

    document.getElementById('search-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { // If Enter key is pressed
            if (isNotificationOpen) {
                alert('Please close the notification before searching another location.'); // Alert if notification is open
                return; 
            }
            const query = event.target.value; // Get search query from input
            searchLocation(query, map); // Perform location search
        }
    });

    const notificationButton = document.getElementById('notification-button'); // Get notification button element
    notificationButton.addEventListener('click', () => {
        showNotification(); // Show notification modal
        hideNotificationIndicator(); // Hide notification indicator
    });

    const logoutButton = document.getElementById('logout-button'); // Get logout button element
    logoutButton.addEventListener('click', () => {
        logout(); // Call logout function
    });

    document.getElementById('close-button').addEventListener('click', () => {
        closeNotification(); // Close the notification modal
        hideNotificationIndicator(); // Hide the indicator when modal is closed
    });
}

let requestQueue = []; // Array to store notifications to be sent
let isRequestProcessing = false; // Flag to check if a request is being processed

// Function to send a notification webhook to the server
async function sendWebhook(notification) {
    const serverURL = 'http://localhost:3000/send-webhook'; // URL of the server endpoint
    const response = await fetch(serverURL, { // Send HTTP POST request
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification) // Send notification data as JSON
    });

    if (!response.ok) { // Check if response is not okay
        const errorText = await response.text(); // Get error message
        throw new Error(`Failed to send notification to server: ${errorText}`); // Throw error
    }

    return await response.json(); // Return server response as JSON
}

// Function to process the notification queue
async function processQueue() {
    if (isRequestProcessing || requestQueue.length === 0) return; // Stop if already processing or queue is empty

    isRequestProcessing = true; // Set processing flag to true
    const notification = requestQueue.shift(); // Remove the first notification from the queue

    try {
        await sendWebhook(notification); // Send the notification to the server
        console.log("Notification sent successfully:", notification); // Log success message
    } catch (error) {
        console.error("Failed to send notification:", error); // Log error message
        requestQueue.unshift(notification); // Re-add notification to the queue
    } finally {
        isRequestProcessing = false; // Set processing flag to false
        if (requestQueue.length > 0) {
            setTimeout(processQueue, 500); // Process next notification in queue after a delay
        }
    }
}

// Function to search for a location and display it on the map
function searchLocation(query, map) {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`; // Geocoding URL with query

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`); // Throw error if response is not okay
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            if (data && data.length > 0) { // Check if location data is returned
                const location = data[0]; // Get the first location result
                map.setView([location.lat, location.lon], 13); // Set map view to location
                L.marker([location.lat, location.lon]) // Add marker to map
                    .addTo(map)
                    .bindPopup(location.display_name) // Bind popup with location name
                    .openPopup();

                const notification = {
                    action: "Location Search", // Action type for notification
                    location: location.display_name, // Display name of the location
                    timestamp: new Date().toISOString(), // Current timestamp for notification
                };

                addNotificationToUI(notification); // Show location search notification immediately
                queueNotification(notification); // Add location search notification to the webhook queue
            } else {
                alert('Location not found'); // Alert if no location is found
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error); // Log error if fetch fails
            alert('Error fetching location: ' + error.message); // Show error alert
        });
}

// Function to display the notification modal
function showNotification() {
    const overlay = document.getElementById('overlay'); // Get overlay element
    const notificationModal = document.getElementById('notification-modal'); // Get notification modal element
    const notificationElement = document.getElementById('notification'); // Get notification content container

    notificationElement.innerHTML = ''; // Clear existing notifications

    if (notifications.length > 0) { // If notifications are available
        notifications.forEach((notif) => { // Loop through each notification
            const notificationItem = document.createElement('div'); // Create a div for each notification
            notificationItem.className = 'notification-item'; // Set CSS class

            if (notif.action === "Login") {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Email:</strong> ${notif.email} - <strong>Timestamp:</strong> ${notif.timestamp}`; // Display login notification
            } else {
                notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Location:</strong> ${notif.location} - <strong>Timestamp:</strong> ${notif.timestamp}`; // Display location search notification
            }

            notificationElement.appendChild(notificationItem); // Add notification item to notification container
        });
    } else {
        notificationElement.innerHTML = '<p>No notifications available.</p>'; // Display message if no notifications are available
    }

    overlay.style.display = 'block'; // Show overlay
    notificationModal.style.display = 'block'; // Show notification modal
    isNotificationOpen = true; // Set notification open flag
}

// Function to hide the notification modal
function closeNotification() {
    const overlay = document.getElementById('overlay'); // Get overlay element
    const notificationModal = document.getElementById('notification-modal'); // Get notification modal element
    overlay.style.display = 'none'; // Hide overlay
    notificationModal.style.display = 'none'; // Hide notification modal
    isNotificationOpen = false; // Set notification open flag
}

// Function to show the notification indicator
function showNotificationIndicator() {
    const indicator = document.getElementById('notification-indicator'); // Get notification indicator element
    indicator.style.display = 'block'; // Show notification indicator
}

// Function to hide the notification indicator
function hideNotificationIndicator() {
    const indicator = document.getElementById('notification-indicator'); // Get notification indicator element
    indicator.style.display = 'none'; // Hide notification indicator
}

// Function to handle user logout
function logout() {
    isLoggedIn = false; // Set login status to false
    currentUser = null; // Clear current user email
    notifications = []; // Clear notifications
    document.querySelector('.container').style.display = 'block'; // Show login container
    document.getElementById('map-container').style.display = 'none'; // Hide map container
}
