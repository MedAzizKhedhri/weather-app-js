const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const weatherCardsContainer = document.querySelector(".weather-cards-container");

// Tunisian cities with their coordinates (latitude, longitude)
const tunisianCities = [
    { name: "Tunis", lat: 36.8065, lon: 10.1815 },
    { name: "Sfax", lat: 34.7406, lon: 10.7603 },
    { name: "Sousse", lat: 35.8254, lon: 10.6370 },
    { name: "Kairouan", lat: 35.6781, lon: 10.0963 },
    { name: "Bizerte", lat: 37.2747, lon: 9.8739 },
    { name: "Gabès", lat: 33.8815, lon: 10.0982 },
    { name: "Ariana", lat: 36.8625, lon: 10.1956 },
    { name: "Gafsa", lat: 34.4250, lon: 8.7842 }
];

console.log("Weather App Started - Using Open-Meteo API");

// Load Tunisian cities weather on page load
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - starting app");
    loadTunisianCitiesWeather();
    
    // Add event listeners for buttons
    const showAllBtn = document.querySelector(".show-all-btn");
    const refreshBtn = document.querySelector(".refresh-btn");
    
    if (showAllBtn) {
        showAllBtn.addEventListener("click", loadTunisianCitiesWeather);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadTunisianCitiesWeather);
    }
});

// Form submission for city search
if (weatherForm) {
    weatherForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const city = cityInput.value.trim();
        
        if (city) {
            try {
                console.log("Searching for city:", city);
                // For search, we'll use coordinates of Tunis as fallback
                // In a real app, you'd geocode the city name to coordinates
                const weatherData = await getWeatherDataByCoords(36.8065, 10.1815, city);
                displaySingleWeatherCard(weatherData);
                cityInput.value = "";
            } catch (error) {
                console.error("Search error:", error);
                displayError("Error: " + error.message);
            }
        } else {
            displayError("Please enter a city name");
        }
    });
}

// Get weather data from Open-Meteo API (FREE, no API key required)
async function getWeatherDataByCoords(lat, lon, cityName) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max&timezone=auto`;
    
    console.log("Fetching from Open-Meteo:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Weather data received:", data);
    
    // Format the data to match our display structure
    return {
        name: cityName,
        main: {
            temp: data.current_weather.temperature,
            humidity: data.daily.relative_humidity_2m_max[0] || 65
        },
        weather: [{
            description: getWeatherDescription(data.current_weather.weathercode),
            id: convertWeatherCode(data.current_weather.weathercode)
        }]
    };
}

// Convert Open-Meteo weather codes to descriptions
function getWeatherDescription(weatherCode) {
    const weatherMap = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };
    
    return weatherMap[weatherCode] || "Unknown weather";
}

// Convert Open-Meteo codes to OpenWeatherMap-like codes for emojis
function convertWeatherCode(weatherCode) {
    if (weatherCode === 0) return 800; // Clear sky
    if (weatherCode <= 2) return 801; // Few clouds
    if (weatherCode === 3) return 804; // Overcast
    if (weatherCode <= 57) return 500; // Rain
    if (weatherCode <= 67) return 600; // Snow
    if (weatherCode <= 82) return 300; // Drizzle
    if (weatherCode >= 95) return 200; // Thunderstorm
    return 800;
}

// Load weather for all Tunisian cities
async function loadTunisianCitiesWeather() {
    try {
        console.log("Loading weather for Tunisian cities using Open-Meteo...");
        showLoadingState();
        
        const weatherPromises = tunisianCities.map(city => 
            getWeatherDataByCoords(city.lat, city.lon, city.name)
        );
        
        const weatherDataArray = await Promise.all(weatherPromises);
        
        console.log("All weather data loaded:", weatherDataArray);
        displayAllWeatherCards(weatherDataArray);
        
    } catch (error) {
        console.error("Error loading cities:", error);
        displayError("Failed to load weather data. Using sample data instead.");
        // Fallback to sample data
        displaySampleData();
    }
}

// Display sample data as fallback
function displaySampleData() {
    const sampleData = [
        { name: "Tunis", main: { temp: 22, humidity: 65 }, weather: [{ description: "Sunny", id: 800 }] },
        { name: "Sfax", main: { temp: 25, humidity: 60 }, weather: [{ description: "Clear", id: 800 }] },
        { name: "Sousse", main: { temp: 24, humidity: 70 }, weather: [{ description: "Partly Cloudy", id: 801 }] },
        { name: "Kairouan", main: { temp: 26, humidity: 55 }, weather: [{ description: "Sunny", id: 800 }] },
        { name: "Bizerte", main: { temp: 21, humidity: 75 }, weather: [{ description: "Light Rain", id: 500 }] },
        { name: "Gabès", main: { temp: 28, humidity: 50 }, weather: [{ description: "Sunny", id: 800 }] },
        { name: "Ariana", main: { temp: 23, humidity: 68 }, weather: [{ description: "Partly Cloudy", id: 801 }] },
        { name: "Gafsa", main: { temp: 27, humidity: 45 }, weather: [{ description: "Clear", id: 800 }] }
    ];
    
    displayAllWeatherCards(sampleData);
}

// Display all weather cards
function displayAllWeatherCards(weatherDataArray) {
    weatherCardsContainer.innerHTML = "";
    
    weatherDataArray.forEach((weatherData, index) => {
        setTimeout(() => {
            displayWeatherCard(weatherData);
        }, index * 100);
    });
}

// Show loading state
function showLoadingState() {
    weatherCardsContainer.innerHTML = `
        <div class="card" style="text-align: center;">
            <div class="loading"></div>
            <p style="margin-top: 20px; color: #666;">Loading weather data...</p>
        </div>
    `;
}

// Display a single weather card (for search results)
function displaySingleWeatherCard(data) {
    weatherCardsContainer.innerHTML = "";
    displayWeatherCard(data);
}

// Display a weather card in the grid
function displayWeatherCard(data) {
    console.log("Displaying card for:", data.name);
    
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    
    card.innerHTML = `
        <h1 class="cityDisplay">${data.name}</h1>
        <p class="tempDisplay">${Math.round(data.main.temp)}°C</p>
        <p class="humidityDisplay">Humidity: ${data.main.humidity}%</p>
        <p class="descDisplay">${data.weather[0].description}</p>
        <p class="weatherEmoji">${getweatherEmoji(data.weather[0].id)}</p>
    `;

    weatherCardsContainer.appendChild(card);

    // Animate card appearance
    setTimeout(() => {
        card.style.transition = "all 0.5s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, 50);
}

function getweatherEmoji(weatherId) {
    switch(true) {
        case (weatherId >= 200 && weatherId < 300): return "⛈";
        case (weatherId >= 300 && weatherId < 400): return "🌧";
        case (weatherId >= 500 && weatherId < 600): return "🌧";
        case (weatherId >= 600 && weatherId < 700): return "❄";
        case (weatherId >= 700 && weatherId < 800): return "🌫";
        case (weatherId === 800): return "☀";
        case (weatherId >= 801 && weatherId < 810): return "☁";
        default: return "❓";
    }
}

function displayError(message) {
    weatherCardsContainer.innerHTML = `
        <div class="card">
            <p style="color: red;">${message}</p>
        </div>
    `;
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    .loading {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);