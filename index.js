
const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const weatherCardsContainer = document.querySelector(".weather-cards-container");
const apiKey = "your_exposed_api_key";

// Tunisian cities to display by default
const tunisianCities = [
    "Tunis",
    "Sfax", 
    "Sousse",
    "Kairouan",
    "Bizerte",
    "Gabès",
    "Ariana",
    "Gafsa"
];

// Load Tunisian cities weather on page load
document.addEventListener("DOMContentLoaded", () => {
    loadTunisianCitiesWeather();
    
    // Add event listener for "Show All Cities" button
    const showAllBtn = document.querySelector(".show-all-btn");
    showAllBtn.addEventListener("click", () => {
        loadTunisianCitiesWeather();
    });
    
    // Add event listener for refresh button
    const refreshBtn = document.querySelector(".refresh-btn");
    refreshBtn.addEventListener("click", () => {
        loadTunisianCitiesWeather();
    });
});

weatherForm.addEventListener("submit", async event =>{
    event.preventDefault();
    const city = cityInput.value;
    if(city){
        try{
            const weatherData = await getWeatherData(city);
            displaySingleWeatherCard(weatherData);
            cityInput.value = ""; // Clear input after successful search
            }
        catch(error){
            console.error(error);
            displayError(error.message);
        }

    }
    else{
        displayError("Please enter a city");
    }

});
async function getWeatherData(city) {
    const apiUrl =`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
    const response = await fetch (apiUrl);
    console.log(response);
    if(!response.ok){
        throw new Error("Failed to fetch weather data. Please check the city name.");
    }
    return await response.json();
}

// Load weather for all Tunisian cities
async function loadTunisianCitiesWeather() {
    try {
        // Show loading state
        showLoadingState();
        
        const weatherPromises = tunisianCities.map(city => getWeatherData(city));
        const weatherDataArray = await Promise.all(weatherPromises);
        
        // Clear container and display all weather cards with animation
        weatherCardsContainer.innerHTML = "";
        weatherDataArray.forEach((weatherData, index) => {
            setTimeout(() => {
                displayWeatherCard(weatherData);
            }, index * 100); // Staggered animation
        });
    } catch (error) {
        console.error("Error loading Tunisian cities weather:", error);
        displayError("Failed to load weather data for Tunisian cities");
    }
}

// Show loading state
function showLoadingState() {
    weatherCardsContainer.innerHTML = "";
    const loadingCard = document.createElement("div");
    loadingCard.classList.add("card");
    loadingCard.style.textAlign = "center";
    
    const loadingSpinner = document.createElement("div");
    loadingSpinner.classList.add("loading");
    
    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading weather data...";
    loadingText.style.marginTop = "20px";
    loadingText.style.color = "#666";
    
    loadingCard.appendChild(loadingSpinner);
    loadingCard.appendChild(loadingText);
    weatherCardsContainer.appendChild(loadingCard);
}

// Display a single weather card (for search results)
function displaySingleWeatherCard(data) {
    // Clear existing cards and show only the searched city
    weatherCardsContainer.innerHTML = "";
    setTimeout(() => {
        displayWeatherCard(data);
    }, 100);
}

// Display a weather card in the grid
function displayWeatherCard(data) {
    const {name: city, 
           main: {temp, humidity}, 
           weather: [{description, id}]} = data;

    const card = document.createElement("div");
    card.classList.add("card");
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp - 273.15).toFixed(0)}°C`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getweatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);

    weatherCardsContainer.appendChild(card);

    // Animate card appearance
    setTimeout(() => {
        card.style.transition = "all 0.5s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
    }, 50);
}
function getweatherEmoji(weatherId){
    switch(true){
        case (weatherId >= 200 && weatherId < 300):
            return "⛈";
        case (weatherId >= 300 && weatherId < 400):
            return "🌧";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧";
        case (weatherId >= 600 && weatherId < 700):
            return "❄";
        case (weatherId >= 700 && weatherId < 800):
            return "🌫";
        case (weatherId === 800):
            return "☀";
        case (weatherId >= 801 && weatherId < 810):
            return "☁";
        default:
            return "❓";
    }
 }
function displayError(message) {
    const errorCard = document.createElement("div");
    errorCard.classList.add("card");
    
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    errorCard.appendChild(errorDisplay);
    weatherCardsContainer.innerHTML = "";
    weatherCardsContainer.appendChild(errorCard);
}