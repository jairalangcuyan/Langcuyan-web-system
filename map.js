// Initialize the map and set view to a default location
var map;

function initializeMap() {
    if (!map) {
        // Initialize the map centered at a default location (latitude, longitude) and zoom level
        map = L.map('map').setView([51.505, -0.09], 13);

        // Load OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Optional: Add a marker at the default location
        L.marker([51.5, -0.09]).addTo(map)
            .bindPopup("Location")
            .openPopup();
    }
}

// Function to show the map after login success
function showMap() {
    initializeMap();
}

// Function to search for a location using the text box input
function searchLocation() {
    var query = document.getElementById('searchBox').value;

    if (query) {
        document.getElementById('searchBox').disabled = true;
        document.querySelector('.header .left-side button').disabled = true;

        // Geocoding API to search for the location
        var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon, display_name } = data[0];

                    // Clear existing markers on the map
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    // Set map view to the new coordinates
                    map.setView([lat, lon], 13);

                    // Add a marker at the new location
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(display_name)
                        .openPopup();

                    addNotification('Searched for: ' + display_name);

                } else {
                    alert("Location not found!");
                }
            })
            .catch(error => console.log('Error: ', error));
    } else {
        alert("Please enter a location name!");
    }
}

// Function to toggle notification container and overlay visibility
function toggleNotification() {
    const notificationOverlay = document.getElementById('notificationOverlay');
    const notificationContainer = document.getElementById('notificationContainer');
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.querySelector('.header .left-side button');
    const isHidden = notificationOverlay.style.display === 'none' || notificationOverlay.style.display === '';

    // Toggle overlay and notification container visibility
    if (isHidden) {
        notificationOverlay.style.display = 'block';
        notificationContainer.style.display = 'block';
        
        // Disable search inputs when notification is visible
        searchBox.disabled = true;
        searchButton.disabled = true;
    } else {
        notificationOverlay.style.display = 'none';
        notificationContainer.style.display = 'none';
        
        // Re-enable search inputs when notification is closed
        searchBox.disabled = false;
        searchButton.disabled = false;
    }
}

// Notification handling
function addNotification(message) {
    const notificationsContainer = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;

    notificationsContainer.insertBefore(notification, notificationsContainer.firstChild);
}

// Logout function
function logout() {
    // Clear any stored user data or session (if necessary)
    if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
        document.getElementById("login-email").value = '';
        document.getElementById("login-password").value = '';
    }
    
    window.location.href = 'index.html'; 
}


// Ensure the map is initialized once the page loads
window.onload = function() {
    initializeMap();
};
