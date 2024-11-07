let notifications = [];
let isNotificationOpen = false;
let isLoggedIn = false;
let currentUser = null;

let requestQueue = [];
let isRequestProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            onLoginSuccess(email);
        });
    }
});

function onLoginSuccess(email) {
    isLoggedIn = true;
    currentUser = email; 
    notifications = [];
    showMap();
    const loginNotification = {
        action: "Login",
        email: email,
        timestamp: new Date().toISOString(),
    };
    queueNotification(loginNotification);
}

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
        showNotification();
        hideNotificationIndicator();
    });

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        logout();
    });

    document.getElementById('close-button').addEventListener('click', () => {
        closeNotification();
        hideNotificationIndicator();
    });
}

async function sendWebhook(notification) {
    const serverURL = 'http://localhost:3000/send-webhook';
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

async function processQueue() {
    if (isRequestProcessing || requestQueue.length === 0) return;

    isRequestProcessing = true;
    const notification = requestQueue.shift();

    try {
        await sendWebhook(notification);
        console.log("Notification sent successfully:", notification);
        notifications.unshift(notification);
        updateNotificationScroll();
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

function queueNotification(notification) {
    requestQueue.push(notification);
    showNotificationIndicator();
    processQueue();
}

function searchLocation(query, map) {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;

    fetch(geocodingUrl)
        .then(response => response.json())
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
            alert('Error fetching location: ' + error.message);
        });
}

function showNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');
    const notificationElement = document.getElementById('notification');

    notificationElement.innerHTML = '';

    if (notifications.length > 0) {
        notifications.forEach((notif) => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.innerHTML = `<strong>Action:</strong> ${notif.action} - <strong>Location:</strong> ${notif.location || notif.email} - <strong>Timestamp:</strong> ${notif.timestamp}`;
            notificationElement.appendChild(notificationItem);
        });
    } else {
        notificationElement.innerHTML = '<p>No notifications available.</p>';
    }

    overlay.style.display = 'block';
    notificationModal.style.display = 'block';
    isNotificationOpen = true;
}

function hideNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'none';
}

function showNotificationIndicator() {
    const notificationIndicator = document.getElementById('notification-indicator');
    notificationIndicator.style.display = 'block';
}

function closeNotification() {
    const overlay = document.getElementById('overlay');
    const notificationModal = document.getElementById('notification-modal');

    overlay.style.display = 'none';
    notificationModal.style.display = 'none';
    isNotificationOpen = false;
}

function logout() {
    notifications = [];
    currentUser = null;
    isLoggedIn = false;
    showLoginForm();
}

function showLoginForm() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('map-container').style.display = 'none';
}
