// weather.js

document.addEventListener('DOMContentLoaded', () => {

    const apikey = '4ccd127f025e5d93ae2c970a56ea0c6c';
    
    // Selectores de Inputs y Botones
    const cityInput = document.getElementById('city-input');
    const districtInput = document.getElementById('district-input');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Selectores de la UI
    const weatherImg = document.querySelector('.weather-icon'); 
    const errorDisplay = document.querySelector('.error'); 
    const errorText = document.querySelector('.error .error-text');
    const weatherContainer = document.querySelector('.weather'); 
    const precipitationElement = document.querySelector('.precipitation'); 
    
    // Variables para guardar la ubicación actual (necesario para el botón de refresco)
    let currentCity = null;
    let currentDistrict = null; // Guardamos el barrio también por si se refresca

    // Ocultar la barra de error y el contenedor de resultados al inicio
    if (errorDisplay) errorDisplay.style.display = 'none';
    if (weatherContainer) weatherContainer.style.display = 'none';


    // -------------------------------------------------------------
    // FUNCIÓN PRINCIPAL: Obtiene y maneja los datos del clima
    // -------------------------------------------------------------
    async function checkWeather(city, district = '') {
        
        const fullQuery = district ? `${district}, ${city}` : city;

        // Limpiar la UI antes de la nueva búsqueda
        if (errorDisplay) errorDisplay.style.display = 'none';
        if (weatherContainer) weatherContainer.style.display = 'none';

        try {
            // --- 1. GEOCODIFICACIÓN (Obtener Latitud y Longitud) ---
            const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${fullQuery}&limit=1&appid=${apikey}`;
            const geoResponse = await fetch(geoApiUrl);
            const geoData = await geoResponse.json();

            if (!geoResponse.ok || !geoData || geoData.length === 0) {
                throw new Error('Ubicación no encontrada. Intenta con una ciudad principal.');
            }

            const lat = geoData[0].lat;
            const lon = geoData[0].lon;
            const locationName = geoData[0].name;

            // Almacenar ubicación para el refresco
            currentCity = city;
            currentDistrict = district; 
            
            // --- 2. BÚSQUEDA DEL CLIMA ACTUAL Y PRONÓSTICO (Con Promise.all) ---
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apikey}`;
            // Pronóstico de 5 días / 3 horas para la probabilidad de precipitación (pop)
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherApiUrl),
                fetch(forecastApiUrl)
            ]);
            
            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            if (!weatherResponse.ok) throw new Error(weatherData.message || 'Error al obtener datos del clima.');
            if (!forecastResponse.ok) throw new Error('Error al obtener pronóstico.');
            
            // ✅ EXTRAER PROBABILIDAD DE PRECIPITACIÓN (POP)
            // Tomamos la probabilidad de precipitación (pop) para la hora más cercana
            const pop = forecastData.list && forecastData.list.length > 0 
                        ? Math.round(forecastData.list[0].pop * 100) 
                        : 'N/A';
            
            // 3. ACTUALIZACIÓN DEL DOM
            updateWeatherUi(weatherData, locationName, pop);

        } catch (error) {
            console.error("Error en la solicitud de API:", error);
            if (errorDisplay && errorText) {
                errorText.innerHTML = error.message || "Ocurrió un error al procesar la solicitud.";
                errorDisplay.style.display = 'block';
            }
        }
    }

    // -------------------------------------------------------------
    // FUNCIÓN PARA ACTUALIZAR EL DOM (UI)
    // -------------------------------------------------------------
    function updateWeatherUi(data, locationName, precipitationChance) {
        
        const tempElement = document.querySelector('.temp');
        const cityElement = document.querySelector('.city');
        const humidityElement = document.querySelector('.humidity');
        const windElement = document.querySelector('.wind');
        
        // 1. Asignar valores
        if (tempElement) tempElement.innerHTML = `${Math.round(data.main.temp)}&deg;C`;
        if (cityElement) cityElement.innerHTML = locationName; 
        if (humidityElement) humidityElement.innerHTML = `${data.main.humidity}%`;
        if (windElement) windElement.innerHTML = `${Math.round(data.wind.speed)} km/h`; 
        
        // ✅ Probabilidad de precipitación
        if (precipitationElement) precipitationElement.innerHTML = `${precipitationChance}%`; 

        // 2. Asignar ícono del clima
        const weatherIcons = {
            'Clear': '../img/clear.png', 
            'Snow': '../img/snow.png',
            'Rain': '../img/rain.png',
            'Clouds': '../img/clouds.png',
            'Drizzle': '../img/rain.png', 
            'Mist': '../img/clouds.png',
            'Haze': '../img/clouds.png',
            'Fog': '../img/clouds.png',
        };

        const weatherState = data.weather[0].main;
        
        if (weatherImg) {
            weatherImg.src = weatherIcons[weatherState] || '../img/clouds.png'; 
            weatherImg.style.display = 'block'; 
        }

        // 3. Mostrar el contenedor principal de resultados
        if (weatherContainer) {
            weatherContainer.style.display = 'block';
        }
    }

    // -------------------------------------------------------------
    // EVENT LISTENERS Y SETUP
    // -------------------------------------------------------------
    
    const handleSearch = () => {
        const city = cityInput.value.trim();
        const district = districtInput.value.trim();
        
        if (city) {
            checkWeather(city, district);
        } else {
            if (errorDisplay && errorText) {
                errorText.innerHTML = "Por favor, ingresa una Ciudad.";
                errorDisplay.style.display = 'block';
            }
        }
    };

    // Evento de Búsqueda (Botón Buscar)
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    // Evento de Búsqueda (Presionar Enter en input de Ciudad/Barrio)
    if (cityInput) {
        cityInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') handleSearch();
        });
    }
    if (districtInput) {
        districtInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') handleSearch();
        });
    }

    // Evento de Actualización
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Usamos la última ubicación guardada
            if (currentCity) {
                checkWeather(currentCity, currentDistrict);
            } else {
                handleSearch();
            }
        });
    }
});