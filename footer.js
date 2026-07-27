/* =========================================================
HANGAR PLAY RADIO — FOOTER / CLIMA Y HORA
Archivo: footer.js (Completo y Definitivo)
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */
    const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
    const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

    /* =====================================================
       ESTADO INICIAL
    ===================================================== */
    let currentLocation = {
        name: "Montevideo",
        country: "Uruguay",
        latitude: -34.9011,
        longitude: -56.1645,
        timezone: "America/Montevideo"
    };

    let currentWeather = {
        temperature: null,
        weatherCode: 0,
        isDay: true,
        sunrise: null,
        sunset: null
    };

    let clockInterval = null;
    let weatherInterval = null;

    /* =====================================================
       ELEMENTOS
    ===================================================== */
    let footerElement;
    let locationNameElement;
    let changeLocationButton;
    let locationSearch;
    let closeSearchButton;
    let locationInput;
    let locationResults;
    let weatherIcon;
    let weatherCondition;
    let temperatureElement;
    let localTimeElement;
    let localDateElement;

    /* =====================================================
       CLASES METEOROLÓGICAS
    ===================================================== */
    const WEATHER_CLASSES = [
        "weather-clear",
        "weather-cloudy",
        "weather-rain",
        "weather-storm",
        "weather-sunrise",
        "weather-sunset",
        "weather-night"
    ];

    /* =====================================================
       ICONOS
    ===================================================== */
    const WEATHER_ICONS = {
        clear: "☀️",
        cloudy: "☁️",
        rain: "🌧️",
        storm: "⛈️",
        sunrise: "🌅",
        sunset: "🌇",
        night: "🌙"
    };

    /* =====================================================
       TEXTOS
    ===================================================== */
    const WEATHER_LABELS = {
        clear: "DESPEJADO",
        cloudy: "NUBLADO",
        rain: "LLUVIA",
        storm: "TORMENTA",
        sunrise: "AMANECER",
        sunset: "ATARDECER",
        night: "NOCHE"
    };

    /* =====================================================
       INICIALIZACIÓN
    ===================================================== */
    function initializeFooter() {
        footerElement = document.getElementById("hangar-footer");

        if (!footerElement) {
            console.error("Hangar Play: no se encontró #hangar-footer.");
            return;
        }

        locationNameElement = document.getElementById("location-name");
        changeLocationButton = document.getElementById("change-location");
        locationSearch = document.getElementById("location-search");
        closeSearchButton = document.getElementById("close-search");
        locationInput = document.getElementById("location-input");
        locationResults = document.getElementById("location-results");
        weatherIcon = document.getElementById("weather-icon");
        weatherCondition = document.getElementById("weather-condition");
        temperatureElement = document.getElementById("temperature");
        localTimeElement = document.getElementById("local-time");
        localDateElement = document.getElementById("local-date");

        loadSavedLocation();
        updateLocationName();
        setupLocationSearch();

        updateLocalClock();
        startClock();
        
        updateWeather().then(() => {
            startWeatherUpdates();
        });
    }

    /* =====================================================
       CARGAR LOCALIDAD GUARDADA
    ===================================================== */
    function loadSavedLocation() {
        const savedLocation = localStorage.getItem("hangarPlayLocation");

        if (!savedLocation) {
            return;
        }

        try {
            const parsed = JSON.parse(savedLocation);

            if (
                parsed &&
                Number.isFinite(Number(parsed.latitude)) &&
                Number.isFinite(Number(parsed.longitude))
            ) {
                currentLocation = {
                    name: parsed.name || "Montevideo",
                    country: parsed.country || "Uruguay",
                    latitude: Number(parsed.latitude),
                    longitude: Number(parsed.longitude),
                    timezone: parsed.timezone || "America/Montevideo"
                };
            }
        } catch (error) {
            console.warn("Hangar Play: no se pudo cargar la localidad guardada.", error);
        }
    }

    /* =====================================================
       GUARDAR LOCALIDAD
    ===================================================== */
    function saveLocation() {
        try {
            localStorage.setItem("hangarPlayLocation", JSON.stringify(currentLocation));
        } catch (error) {
            console.warn("Hangar Play: no se pudo guardar la localidad.", error);
        }
    }

    /* =====================================================
       ACTUALIZAR LOCALIDAD
    ===================================================== */
    function updateLocationName() {
        if (!locationNameElement) {
            return;
        }

        const countryText = currentLocation.country ? `, ${currentLocation.country}` : "";
        locationNameElement.textContent = `${currentLocation.name.toUpperCase()}${countryText.toUpperCase()}`;
    }

    /* =====================================================
       CONSULTAR CLIMA
    ===================================================== */
    async function updateWeather() {
        if (!currentLocation) {
            return;
        }

        try {
            const url =
                `${WEATHER_API_URL}` +
                `?latitude=${encodeURIComponent(currentLocation.latitude)}` +
                `&longitude=${encodeURIComponent(currentLocation.longitude)}` +
                `&current=temperature_2m,weather_code,is_day` +
                `&daily=sunrise,sunset` +
                `&timezone=auto` +
                `&forecast_days=1`;

            const response = await fetch(url, { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.timezone) {
                currentLocation.timezone = data.timezone;
            }

            currentWeather = {
                temperature:
                    data.current && typeof data.current.temperature_2m === "number"
                        ? data.current.temperature_2m
                        : null,

                weatherCode:
                    data.current && typeof data.current.weather_code === "number"
                        ? data.current.weather_code
                        : 0,

                isDay:
                    data.current && Number(data.current.is_day) === 1,

                sunrise:
                    data.daily && data.daily.sunrise && data.daily.sunrise[0]
                        ? data.daily.sunrise[0]
                        : null,

                sunset:
                    data.daily && data.daily.sunset && data.daily.sunset[0]
                        ? data.daily.sunset[0]
                        : null
            };

            updateWeatherInterface();
            updateWeatherBackground();
            updateLocalClock();

        } catch (error) {
            console.error("Hangar Play: error al obtener el clima.", error);

            if (weatherCondition) {
                weatherCondition.textContent = "CLIMA NO DISPONIBLE";
            }

            if (temperatureElement) {
                temperatureElement.textContent = "-- °C";
            }

            updateWeatherBackground();
        }
    }

    /* =====================================================
       ACTUALIZAR INTERFAZ METEOROLÓGICA
    ===================================================== */
    function updateWeatherInterface() {
        const weatherState = getWeatherState();

        if (weatherIcon) {
            weatherIcon.textContent = WEATHER_ICONS[weatherState] || WEATHER_ICONS.clear;
        }

        if (weatherCondition) {
            weatherCondition.textContent = WEATHER_LABELS[weatherState] || WEATHER_LABELS.clear;
        }

        if (
            temperatureElement &&
            typeof currentWeather.temperature === "number"
        ) {
            temperatureElement.textContent = `${Math.round(currentWeather.temperature)} °C`;
        }
    }

    /* =====================================================
       DETERMINAR ESTADO DEL CLIMA
    ===================================================== */
    function getWeatherState() {
        const now = new Date();
        const sunrise = parseDate(currentWeather.sunrise);
        const sunset = parseDate(currentWeather.sunset);

        if (currentWeather.isDay === false) {
            return "night";
        }

        if (sunrise && isWithinMinutes(now, sunrise, 60)) {
            return "sunrise";
        }

        if (sunset && isWithinMinutes(now, sunset, 60)) {
            return "sunset";
        }

        return getWeatherStateFromCode(currentWeather.weatherCode);
    }

    /* =====================================================
       CÓDIGOS METEOROLÓGICOS WMO
    ===================================================== */
    function getWeatherStateFromCode(weatherCode) {
        const code = Number(weatherCode);

        if (code === 0) {
            return "clear";
        }

        if ([1, 2, 3, 45, 48].includes(code)) {
            return "cloudy";
        }

        if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
            return "rain";
        }

        if ([71, 73, 75, 77, 85, 86, 95, 96, 99].includes(code)) {
            return "storm";
        }

        return "clear";
    }

    /* =====================================================
       CAMBIAR FONDO METEOROLÓGICO
    ===================================================== */
    function updateWeatherBackground() {
        if (!footerElement) {
            return;
        }

        WEATHER_CLASSES.forEach(function (weatherClass) {
            footerElement.classList.remove(weatherClass);
        });

        const weatherState = getWeatherState();
        const newWeatherClass = `weather-${weatherState}`;

        footerElement.classList.add(newWeatherClass);
    }

    /* =====================================================
       RELOJ LOCAL
    ===================================================== */
    function updateLocalClock() {
        if (!localTimeElement || !localDateElement) {
            return;
        }

        const now = new Date();
        const timezone =
            currentLocation.timezone && currentLocation.timezone !== "auto"
                ? currentLocation.timezone
                : "America/Montevideo";

        try {
            const timeFormatter = new Intl.DateTimeFormat("es-UY", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            const dateFormatter = new Intl.DateTimeFormat("es-UY", {
                timeZone: timezone,
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            localTimeElement.textContent = timeFormatter.format(now);
            localDateElement.textContent = capitalizeFirstLetter(dateFormatter.format(now));
        } catch (error) {
            console.error("Hangar Play: error mostrando la hora local.", error);
        }
    }

    /* =====================================================
       INICIAR RELOJ
    ===================================================== */
    function startClock() {
        if (clockInterval) {
            clearInterval(clockInterval);
        }

        clockInterval = setInterval(updateLocalClock, 1000);
    }

    /* =====================================================
       ACTUALIZAR CLIMA CADA 10 MINUTOS
    ===================================================== */
    function startWeatherUpdates() {
        if (weatherInterval) {
            clearInterval(weatherInterval);
        }

        weatherInterval = setInterval(updateWeather, 10 * 60 * 1000);
    }

    /* =====================================================
       CONFIGURAR BUSCADOR
    ===================================================== */
    function setupLocationSearch() {
        if (
            !changeLocationButton ||
            !closeSearchButton ||
            !locationSearch ||
            !locationInput ||
            !locationResults
        ) {
            console.error("Hangar Play: faltan elementos del buscador de localidad.");
            return;
        }

        changeLocationButton.addEventListener("click", function () {
            openLocationSearch();
        });

        closeSearchButton.addEventListener("click", function () {
            closeLocationSearch();
        });

        locationSearch.addEventListener("click", function (event) {
            if (event.target === locationSearch) {
                closeLocationSearch();
            }
        });

        locationInput.addEventListener(
            "input",
            debounce(function () {
                searchLocations();
            }, 450)
        );

        locationInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeLocationSearch();
            }
        });
    }

    /* =====================================================
       ABRIR BUSCADOR
    ===================================================== */
    function openLocationSearch() {
        if (!locationSearch) {
            return;
        }

        locationSearch.classList.remove("hidden");
        locationSearch.setAttribute("aria-hidden", "false");

        if (locationInput) {
            locationInput.value = "";
            setTimeout(function () {
                locationInput.focus();
            }, 50);
        }
    }

    /* =====================================================
       CERRAR BUSCADOR
    ===================================================== */
    function closeLocationSearch() {
        if (!locationSearch) {
            return;
        }

        locationSearch.classList.add("hidden");
        locationSearch.setAttribute("aria-hidden", "true");

        if (locationInput) {
            locationInput.value = "";
        }

        if (locationResults) {
            locationResults.innerHTML = "";
        }
    }

    /* =====================================================
       BUSCAR LOCALIDADES
    ===================================================== */
    async function searchLocations() {
        if (!locationInput || !locationResults) {
            return;
        }

        const query = locationInput.value.trim();

        if (query.length < 2) {
            locationResults.innerHTML = "";
            return;
        }

        locationResults.innerHTML = '<div class="search-status">Buscando localidades...</div>';

        try {
            const url =
                `${GEOCODING_API_URL}` +
                `?name=${encodeURIComponent(query)}` +
                `&count=8` +
                `&language=es` +
                `&format=json`;

            const response = await fetch(url, { cache: "no-store" });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            renderLocationResults(
                Array.isArray(data.results) ? data.results : []
            );

        } catch (error) {
            console.error("Hangar Play: error buscando localidad.", error);
            locationResults.innerHTML = '<div class="search-status">No se pudieron encontrar localidades.</div>';
        }
    }

    /* =====================================================
       MOSTRAR RESULTADOS
    ===================================================== */
    function renderLocationResults(locations) {
        if (!locationResults) {
            return;
        }

        locationResults.innerHTML = "";

        if (!locations || locations.length === 0) {
            locationResults.innerHTML = '<div class="search-status">No se encontraron localidades.</div>';
            return;
        }

        locations.forEach(function (location) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "location-result";

            const title = document.createElement("strong");
            title.textContent = location.name || "Localidad";

            const details = document.createElement("span");
            const locationDetails = [
                location.admin1,
                location.country
            ].filter(Boolean);

            details.textContent = locationDetails.join(", ");

            button.appendChild(title);
            button.appendChild(details);

            button.addEventListener("click", function () {
                selectLocation(location);
            });

            locationResults.appendChild(button);
        });
    }

    /* =====================================================
       SELECCIONAR LOCALIDAD
    ===================================================== */
    async function selectLocation(location) {
        if (!location) {
            return;
        }

        currentLocation = {
            name: location.name || "Localidad",
            country: location.country || "",
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            timezone: location.timezone || "America/Montevideo"
        };

        saveLocation();
        updateLocationName();
        closeLocationSearch();
        updateLocalClock();
        await updateWeather();
    }

    /* =====================================================
       PARSEAR FECHA
    ===================================================== */
    function parseDate(value) {
        if (!value) {
            return null;
        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
            return null;
        }

        return parsed;
    }

    /* =====================================================
       VENTANA DE TIEMPO
    ===================================================== */
    function isWithinMinutes(currentTime, targetTime, minutes) {
        if (!currentTime || !targetTime) {
            return false;
        }

        const difference = Math.abs(currentTime.getTime() - targetTime.getTime());
        return difference <= minutes * 60 * 1000;
    }

    /* =====================================================
       CAPITALIZAR
    ===================================================== */
    function capitalizeFirstLetter(text) {
        if (!text) {
            return "";
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /* =====================================================
       DEBOUNCE
    ===================================================== */
    function debounce(callback, delay) {
        let timeout;

        return function () {
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                callback.apply(null, args);
            }, delay);
        };
    }

    /* =====================================================
       ARRANQUE SEGURO
    ===================================================== */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeFooter, { once: true });
    } else {
        initializeFooter();
    }
})();


