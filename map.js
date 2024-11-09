// Initialize the map and set view to a default location
var map = L.map('map').setView([51.505, -0.09], 13);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to search for a location using the text box input
function searchLocation() {
    var query = document.getElementById('searchBox').value;

    if (query) {
        // Geocoding API to search for the location
        var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon, display_name } = data[0];

                    // Clear existing markers
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    map.setView([lat, lon], 13);
                    L.marker([lat, lon]).addTo(map).bindPopup(display_name).openPopup();
                    sendWebhookNotification('Location search: ' + display_name);
                    addNotification('Searched for: ' + display_name); // Add notification for search history
                } else {
                    alert("Location not found!");
                }
            })
            .catch(error => console.log('Error: ', error));
    } else {
        alert("Please enter a location name!");
    }
}

// Function to send a webhook notification
function sendWebhookNotification(action) {
    const nodeServerUrl = 'http://localhost:3000/send-webhook'; // Make sure this is correct

    const timestamp = new Date().toISOString(); // Get the timestamp
    console.log('Sending data to server:', { action, timestamp });  // Log data before sending

    fetch(nodeServerUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, timestamp }),
    })
    .then(response => {
        console.log('Response status:', response.status);  // Log response status
        if (!response.ok) {
            throw new Error('Failed to send data to webhook: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Data sent to webhook successfully') {
            console.log('POST notification sent successfully');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error sending the notification: ' + error.message);
    });
}

// Function to add a notification to the notification container
function addNotification(message) {
    const notificationsContainer = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    notificationsContainer.appendChild(notification);
}

// Function to toggle notification container visibility
function toggleNotification() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (notificationContainer.style.display === 'none' || notificationContainer.style.display === '') {
        notificationContainer.style.display = 'block';
    } else {
        notificationContainer.style.display = 'none';
    }
}
function showMap() {
    // Remove login view and add map view
    document.body.classList.remove("login-view");
    document.body.classList.add("map-view");

    // Hide the login form and show the map and header only if they exist
    const container = document.querySelector(".container");
    if (container) container.classList.add("hidden");

    const mapElement = document.getElementById("map");
    if (mapElement) mapElement.classList.remove("hidden");

    const header = document.querySelector(".header");
    if (header) header.classList.remove("hidden");

    // Force Leaflet to recalculate the map size
    map.invalidateSize();  // This fixes the display issue when the map is revealed
}


