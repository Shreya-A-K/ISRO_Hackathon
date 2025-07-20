// Global variables
let inputMap, mainMap;
let selectedLat = null, selectedLon = null;
const API_KEY = 'put you own api from open weather app'; // Using demo key - users should replace with actual OpenWeatherMap API key

// Check if Leaflet is loaded
function checkLeafletLoaded() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds maximum wait
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (typeof L !== 'undefined') {
                clearInterval(checkInterval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                reject(new Error('Leaflet failed to load'));
            }
        }, 100);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    setupEventListeners();
    
    // Wait for Leaflet to load before initializing maps
    checkLeafletLoaded()
        .then(() => {
            console.log('Leaflet loaded successfully');
            // Initialize input map with a delay to ensure DOM is ready
            setTimeout(() => {
                initializeInputMap();
            }, 100);
        })
        .catch((error) => {
            console.error('Failed to load Leaflet:', error);
            // Show error message in map containers
            const containers = ['input-map', 'main-map'];
            containers.forEach(containerId => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 15px; color: #666;">
                            <div style="text-align: center;">
                                <i class="fas fa-wifi" style="font-size: 2rem; margin-bottom: 10px;"></i>
                                <p>Map library failed to load.<br>Please check your internet connection and refresh.</p>
                            </div>
                        </div>
                    `;
                }
            });
        });
});

// Tab switching functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.input-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            btn.classList.add('active');
            document.getElementById(`${targetTab}-panel`).classList.add('active');
            
            // Initialize map if map tab is selected
            if (targetTab === 'map') {
                setTimeout(() => {
                    initializeInputMap();
                    // Force map to resize/redraw
                    if (inputMap) {
                        inputMap.invalidateSize();
                    }
                }, 200);
            }
        });
    });
}

// Initialize input map for location selection
function initializeInputMap() {
    const mapContainer = document.getElementById('input-map');
    
    // Check if container exists
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    // If map already exists, remove it first
    if (inputMap) {
        inputMap.remove();
        inputMap = null;
    }
    
    try {
        console.log('Initializing input map...');
        
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded');
            return;
        }
        
        inputMap = L.map('input-map').setView([28.6139, 77.2090], 10); // Default to Delhi
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(inputMap);
        
        let marker = null;
        
        inputMap.on('click', function(e) {
            selectedLat = e.latlng.lat;
            selectedLon = e.latlng.lng;
            
            if (marker) {
                inputMap.removeLayer(marker);
            }
            
            marker = L.marker([selectedLat, selectedLon]).addTo(inputMap);
            
            // Automatically search when location is selected
            searchByCoordinates(selectedLat, selectedLon);
        });
        
        console.log('Input map initialized successfully');
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('map-loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Force resize after a short delay
        setTimeout(() => {
            if (inputMap) {
                inputMap.invalidateSize();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error initializing input map:', error);
        
        // Show error message to user
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 15px; color: #666;">
                <div style="text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Map failed to load. Please refresh the page.</p>
                </div>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Enter key support for inputs
    document.getElementById('pincode-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchByPincode();
    });
    
    document.getElementById('location-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchByLocation();
    });
}

// Search by pincode
async function searchByPincode() {
    const pincode = document.getElementById('pincode-input').value.trim();
    
    if (!pincode) {
        alert('Please enter a valid pincode');
        return;
    }
    
    if (!/^\d{6}$/.test(pincode)) {
        alert('Please enter a valid 6-digit pincode');
        return;
    }
    
    showLoading();
    
    try {
        // First, get coordinates from pincode using a geocoding service
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${pincode},IN&appid=${API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error('Pincode not found');
        }
        
        const geoData = await geoResponse.json();
        const lat = geoData.lat;
        const lon = geoData.lon;
        const locationName = `${geoData.name}, ${pincode}`;
        
        await fetchAQIData(lat, lon, locationName);
    } catch (error) {
        console.error('Error fetching pincode data:', error);
        hideLoading();
        
        // Fallback to demo data for demonstration
        showDemoData('pincode', pincode);
    }
}

// Search by location name
async function searchByLocation() {
    const location = document.getElementById('location-input').value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    showLoading();
    
    try {
        // Get coordinates from location name
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error('Location not found');
        }
        
        const geoData = await geoResponse.json();
        
        if (geoData.length === 0) {
            throw new Error('Location not found');
        }
        
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const locationName = `${geoData[0].name}, ${geoData[0].country}`;
        
        await fetchAQIData(lat, lon, locationName);
    } catch (error) {
        console.error('Error fetching location data:', error);
        hideLoading();
        
        // Fallback to demo data for demonstration
        showDemoData('location', location);
    }
}

// Search by coordinates (from map click)
async function searchByCoordinates(lat, lon) {
    showLoading();
    
    try {
        // Get location name from coordinates
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        let locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        
        if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.length > 0) {
                locationName = `${geoData[0].name || 'Unknown'}, ${geoData[0].country || 'Unknown'}`;
            }
        }
        
        await fetchAQIData(lat, lon, locationName);
    } catch (error) {
        console.error('Error fetching coordinate data:', error);
        hideLoading();
        
        // Fallback to demo data for demonstration
        showDemoData('coordinates', `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
}

// Fetch AQI data from API
async function fetchAQIData(lat, lon, locationName) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch AQI data');
        }
        
        const data = await response.json();
        const aqiData = data.list[0];
        
        displayAQIResults({
            location: locationName,
            aqi: aqiData.main.aqi,
            components: aqiData.components,
            coordinates: { lat, lon }
        });
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        hideLoading();
        
        // Fallback to demo data for demonstration
        showDemoData('api_error', locationName);
    }
}

// Show demo data when API is not available
function showDemoData(source, location) {
    const demoAQI = Math.floor(Math.random() * 300) + 1; // Random AQI between 1-300
    const demoComponents = {
        pm2_5: (Math.random() * 100).toFixed(1),
        pm10: (Math.random() * 150).toFixed(1),
        o3: (Math.random() * 200).toFixed(1),
        no2: (Math.random() * 100).toFixed(1)
    };
    
    const demoCoords = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        lon: 77.2090 + (Math.random() - 0.5) * 0.1
    };
    
    displayAQIResults({
        location: location,
        aqi: demoAQI,
        components: demoComponents,
        coordinates: demoCoords,
        isDemo: true
    });
    
    hideLoading();
}

// Display AQI results
function displayAQIResults(data) {
    document.getElementById('location-name').textContent = data.location;
    document.getElementById('aqi-value').textContent = data.aqi;
    
    // Set AQI color and status
    const aqiInfo = getAQIInfo(data.aqi);
    const aqiValueElement = document.getElementById('aqi-value');
    const aqiStatusElement = document.getElementById('aqi-status');
    
    aqiValueElement.className = `aqi-value ${aqiInfo.class}`;
    aqiStatusElement.textContent = aqiInfo.status;
    aqiStatusElement.className = `aqi-status ${aqiInfo.class}`;
    
    document.getElementById('aqi-description').textContent = aqiInfo.description;
    
    // Display pollutants
    document.getElementById('pm25-value').textContent = `${data.components.pm2_5} μg/m³`;
    document.getElementById('pm10-value').textContent = `${data.components.pm10} μg/m³`;
    document.getElementById('o3-value').textContent = `${data.components.o3} μg/m³`;
    document.getElementById('no2-value').textContent = `${data.components.no2} μg/m³`;
    
    // Generate funny content
    generateFunnyContent(data.aqi, aqiInfo.status);
    
    // Initialize main map
    initializeMainMap(data.coordinates.lat, data.coordinates.lon, data.aqi, data.location);
    
    // Show results
    document.getElementById('results-section').style.display = 'grid';
    
    // Add demo notice if using demo data
    if (data.isDemo) {
        const demoNotice = document.createElement('div');
        demoNotice.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin: 10px 0; text-align: center;';
        demoNotice.innerHTML = '<strong>Demo Mode:</strong> Using simulated data. Get a free API key from OpenWeatherMap for real data.';
        document.querySelector('.aqi-card').insertBefore(demoNotice, document.querySelector('.aqi-header'));
    }
}

// Get AQI information based on value
function getAQIInfo(aqi) {
    if (aqi === 1) {
        return {
            status: 'Good',
            class: 'aqi-good',
            description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
        };
    } else if (aqi === 2) {
        return {
            status: 'Fair',
            class: 'aqi-moderate',
            description: 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.'
        };
    } else if (aqi === 3) {
        return {
            status: 'Moderate',
            class: 'aqi-unhealthy-sensitive',
            description: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
        };
    } else if (aqi === 4) {
        return {
            status: 'Poor',
            class: 'aqi-unhealthy',
            description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'
        };
    } else {
        return {
            status: 'Very Poor',
            class: 'aqi-very-unhealthy',
            description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
        };
    }
}

// Generate funny content based on AQI
function generateFunnyContent(aqi, status) {
    const funnyContent = document.getElementById('funny-content');
    let content = '';
    
    if (aqi === 1) {
        content = `
            <p><strong>Congratulations!</strong> The air is so clean, you could probably bottle it and sell it as premium oxygen! 🌟</p>
            <p><strong>Recommended activity:</strong> Go outside and take the deepest breath of your life. Your lungs will thank you!</p>
            <p><strong>Fun fact:</strong> This air quality is rarer than finding a parking spot in downtown during rush hour!</p>
        `;
    } else if (aqi === 2) {
        content = `
            <p><strong>Not bad!</strong> The air quality is like a decent pizza - not perfect, but definitely acceptable! 🍕</p>
            <p><strong>Recommended activity:</strong> Perfect weather for a jog, just don't expect to break any Olympic records.</p>
            <p><strong>Pro tip:</strong> This is as good as it gets in most cities. Enjoy it while it lasts!</p>
        `;
    } else if (aqi === 3) {
        content = `
            <p><strong>Meh...</strong> The air quality is like your WiFi connection - works most of the time, but you notice when it doesn't! 📶</p>
            <p><strong>Recommended activity:</strong> Indoor yoga or contemplating why you didn't move to the mountains yet.</p>
            <p><strong>Survival tip:</strong> If you're sensitive, maybe save the marathon training for another day.</p>
        `;
    } else if (aqi === 4) {
        content = `
            <p><strong>Yikes!</strong> The air quality is like a bad relationship - everyone can see it's not good for you! 💔</p>
            <p><strong>Recommended activity:</strong> Netflix and chill (literally, stay inside and chill).</p>
            <p><strong>Bright side:</strong> Great excuse to avoid that outdoor team building event you didn't want to attend!</p>
        `;
    } else {
        content = `
            <p><strong>ABORT MISSION!</strong> The air quality is so bad, even the plants are wearing masks! 😷🌱</p>
            <p><strong>Recommended activity:</strong> Indoor meditation on why you chose to live here. Maybe online shopping for air purifiers?</p>
            <p><strong>Emergency kit:</strong> Masks, indoor plants, and a strong internet connection for house hunting in cleaner areas!</p>
            <p><strong>Fun fact:</strong> You're basically living in a real-life science experiment about human resilience!</p>
        `;
    }
    
    funnyContent.innerHTML = content;
}

// Initialize main results map
function initializeMainMap(lat, lon, aqi, locationName) {
    const mapContainer = document.getElementById('main-map');
    
    if (!mapContainer) {
        console.error('Main map container not found');
        return;
    }
    
    if (mainMap) {
        mainMap.remove();
        mainMap = null;
    }
    
    try {
        console.log('Initializing main map...');
        
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded for main map');
            return;
        }
        
        mainMap = L.map('main-map').setView([lat, lon], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(mainMap);
        
        // Add main location marker
        const aqiInfo = getAQIInfo(aqi);
        const marker = L.marker([lat, lon]).addTo(mainMap);
        
        marker.bindPopup(`
            <div class="popup-aqi">
                <div class="popup-location">${locationName}</div>
                <div class="popup-aqi-value ${aqiInfo.class}">AQI: ${aqi}</div>
                <div>${aqiInfo.status}</div>
            </div>
        `).openPopup();
        
        // Add some nearby demo points for visualization
        addNearbyAQIPoints(lat, lon);
        
        console.log('Main map initialized successfully');
        
        // Force resize after a short delay
        setTimeout(() => {
            if (mainMap) {
                mainMap.invalidateSize();
            }
        }, 100);
        
    } catch (error) {
        console.error('Error initializing main map:', error);
        
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 15px; color: #666;">
                <div style="text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Map failed to load. Please refresh the page.</p>
                </div>
            </div>
        `;
    }
}

// Add nearby AQI points for better visualization
function addNearbyAQIPoints(centerLat, centerLon) {
    const points = [];
    const numPoints = 8;
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const distance = 0.05 + Math.random() * 0.1; // Random distance between 0.05 and 0.15 degrees
        
        const lat = centerLat + distance * Math.cos(angle);
        const lon = centerLon + distance * Math.sin(angle);
        const aqi = Math.floor(Math.random() * 5) + 1; // Random AQI between 1-5
        
        points.push({ lat, lon, aqi });
    }
    
    points.forEach(point => {
        const aqiInfo = getAQIInfo(point.aqi);
        const circleColor = getAQIColor(point.aqi);
        
        L.circleMarker([point.lat, point.lon], {
            radius: 8,
            fillColor: circleColor,
            color: circleColor,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
        }).addTo(mainMap).bindPopup(`
            <div class="popup-aqi">
                <div class="popup-aqi-value ${aqiInfo.class}">AQI: ${point.aqi}</div>
                <div>${aqiInfo.status}</div>
            </div>
        `);
    });
}

// Get color for AQI value
function getAQIColor(aqi) {
    switch (aqi) {
        case 1: return '#00e400';
        case 2: return '#ffff00';
        case 3: return '#ff7e00';
        case 4: return '#ff0000';
        case 5: return '#8f3f97';
        default: return '#7e0023';
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                searchByCoordinates(lat, lon);
                
                // Update input map to show current location
                if (inputMap) {
                    inputMap.setView([lat, lon], 12);
                }
            },
            error => {
                console.error('Error getting current location:', error);
                alert('Unable to get your current location. Please enter a location manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Add current location button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add current location button to map panel
    const mapPanel = document.getElementById('map-panel');
    const currentLocationBtn = document.createElement('button');
    currentLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use Current Location';
    currentLocationBtn.className = 'search-btn';
    currentLocationBtn.style.cssText = 'margin: 10px auto; display: block; border-radius: 25px; padding: 10px 20px; width: auto;';
    currentLocationBtn.onclick = getCurrentLocation;
    
    mapPanel.insertBefore(currentLocationBtn, document.getElementById('input-map'));
});

// Error handling for API key
function showAPIKeyNotice() {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notice.innerHTML = `
        <strong>API Key Required</strong><br>
        To get real-time data, please get a free API key from OpenWeatherMap and replace the demo key in script.js
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
    `;
    document.body.appendChild(notice);
    
    setTimeout(() => {
        if (notice.parentElement) {
            notice.remove();
        }
    }, 10000);
}

// Show API notice on first load
if (API_KEY === 'demo') {
    setTimeout(showAPIKeyNotice, 2000);
}

// Debug function to help troubleshoot map issues
function debugMaps() {
    console.log('=== MAP DEBUG INFO ===');
    console.log('Leaflet loaded:', typeof L !== 'undefined');
    console.log('Input map exists:', !!inputMap);
    console.log('Main map exists:', !!mainMap);
    
    const inputMapContainer = document.getElementById('input-map');
    const mainMapContainer = document.getElementById('main-map');
    
    console.log('Input map container exists:', !!inputMapContainer);
    console.log('Main map container exists:', !!mainMapContainer);
    
    if (inputMapContainer) {
        console.log('Input map container dimensions:', {
            width: inputMapContainer.offsetWidth,
            height: inputMapContainer.offsetHeight,
            display: window.getComputedStyle(inputMapContainer).display
        });
    }
    
    if (mainMapContainer) {
        console.log('Main map container dimensions:', {
            width: mainMapContainer.offsetWidth,
            height: mainMapContainer.offsetHeight,
            display: window.getComputedStyle(mainMapContainer).display
        });
    }
    
    // Try to reinitialize input map
    console.log('Attempting to reinitialize input map...');
    try {
        initializeInputMap();
        console.log('Input map reinitialization completed');
    } catch (error) {
        console.error('Input map reinitialization failed:', error);
    }
    
    alert('Debug info logged to console. Press F12 to view.');
}