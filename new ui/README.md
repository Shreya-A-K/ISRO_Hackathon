# AQI Explorer - Real Time Air Quality Website 🌬️

A modern, responsive web application that allows users to check real-time Air Quality Index (AQI) data with a humorous twist! Users can search by pincode, location name, or select a location on an interactive map.

## Features

### 🎯 Multiple Search Options
- **Pincode Search**: Enter a 6-digit Indian pincode
- **Location Search**: Enter any city or location name
- **Interactive Map**: Click on a map to select any location worldwide
- **Current Location**: Use GPS to get your current location's AQI

### 📊 Comprehensive Data Display
- Real-time AQI values with color-coded indicators
- Detailed pollutant information (PM2.5, PM10, O₃, NO₂)
- Interactive color-coded heat map
- AQI status and health recommendations

### 😄 Humorous Content
- Funny survival guides based on AQI levels
- Witty recommendations for activities
- Light-hearted take on air quality situations

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Smooth animations and hover effects
- Beautiful gradient backgrounds
- Intuitive tabbed interface

## Demo Mode

The website currently runs in **demo mode** with simulated data. To get real-time AQI data, you'll need to:

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the `API_KEY` variable in `script.js`:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

## How to Use

1. **Open `index.html`** in your web browser
2. **Choose your preferred search method**:
   - **Pincode**: Enter a 6-digit Indian pincode (e.g., 110001 for New Delhi)
   - **Location**: Enter any city name (e.g., "New York" or "Mumbai")
   - **Map**: Click on the map tab and click anywhere on the map
3. **View Results**: Get AQI data, funny recommendations, and an interactive heat map

## AQI Color Coding

- 🟢 **Good (1)**: Green - Air quality is satisfactory
- 🟡 **Fair (2)**: Yellow - Acceptable air quality
- 🟠 **Moderate (3)**: Orange - Unhealthy for sensitive groups
- 🔴 **Poor (4)**: Red - Unhealthy for everyone
- 🟣 **Very Poor (5)**: Purple - Very unhealthy conditions

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox/Grid, animations, and responsive design
- **JavaScript (ES6+)**: Async/await, DOM manipulation, and API integration
- **Leaflet.js**: Interactive maps
- **OpenWeatherMap API**: Real-time air pollution data
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Poppins)

## API Integration

The website integrates with:
- **OpenWeatherMap Geocoding API**: Convert pincodes/locations to coordinates
- **OpenWeatherMap Air Pollution API**: Fetch real-time AQI data
- **OpenStreetMap**: Map tiles for visualization

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Getting Started for Development

1. **Clone or download** the project files
2. **Get an API key** from OpenWeatherMap (free tier available)
3. **Update the API key** in `script.js`
4. **Open `index.html`** in a web browser
5. **Start exploring** air quality data!

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Search Functionality
- **Input validation** for pincodes (6-digit format)
- **Error handling** with graceful fallbacks to demo data
- **Keyboard support** (Enter key to search)
- **Loading states** with animated spinners

### Map Features
- **Interactive selection** by clicking
- **Zoom and pan** capabilities
- **Multiple AQI points** for area visualization
- **Custom popups** with AQI information
- **Responsive design** that works on mobile

### Funny Content Generator
The humor engine generates contextual content based on AQI levels:
- **Good AQI**: Celebrates the rare clean air
- **Moderate AQI**: Compares to everyday situations
- **Poor AQI**: Provides humorous survival tips
- **Very Poor AQI**: Emergency-level comedy relief

## Contributing

Feel free to contribute by:
- Adding more humorous content
- Improving the UI/UX design
- Adding new features (historical data, forecasts)
- Optimizing performance
- Adding more location services

## License

This project is open source and available under the MIT License.

## Disclaimer

- Air quality data is provided by OpenWeatherMap
- Humorous content is for entertainment purposes only
- Always follow official health guidelines for air quality
- Demo mode uses simulated data for demonstration purposes

---

**Made with ❤️ and a sense of humor** | Get your free API key at [OpenWeatherMap](https://openweathermap.org/api)