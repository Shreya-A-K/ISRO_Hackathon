// Configuration Example for AQI Explorer
// Copy this file to config.js and update with your actual API key

const CONFIG = {
    // Get your free API key from: https://openweathermap.org/api
    OPENWEATHER_API_KEY: 'your_openweathermap_api_key_here',
    
    // Default location (latitude, longitude) - currently set to New Delhi
    DEFAULT_LOCATION: {
        lat: 28.6139,
        lon: 77.2090,
        name: 'New Delhi, India'
    },
    
    // Map settings
    MAP_SETTINGS: {
        defaultZoom: 10,
        maxZoom: 18,
        minZoom: 3
    },
    
    // Demo mode settings
    DEMO_MODE: {
        enabled: true, // Set to false when using real API key
        showNotice: true // Show demo mode notice
    }
};

// Instructions:
// 1. Sign up for a free account at https://openweathermap.org/
// 2. Go to API keys section and generate a new key
// 3. Replace 'your_openweathermap_api_key_here' with your actual key
// 4. Set DEMO_MODE.enabled to false
// 5. Save this file as 'config.js' (remove .example from filename)
// 6. Update script.js to use: const API_KEY = CONFIG.OPENWEATHER_API_KEY;