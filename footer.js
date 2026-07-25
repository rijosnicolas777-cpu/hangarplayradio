/* =========================================================
   HANGAR PLAY RADIO
   PIE DINÁMICO — FOOTER
   JavaScript principal
   ========================================================= */


/* ---------------------------------------------------------
   1. CONFIGURACIÓN
   --------------------------------------------------------- */

const DEFAULT_LOCATION = {
    name: "Montevideo",
    country: "Uruguay",
    latitude: -34.9011,
    longitude: -56.1645,
    timezone: "America/Montevideo"
};

const STORAGE_KEY = "hangarPlaySelectedLocation";

const WEATHER_API_URL =
    "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API_URL =
    "https://geocoding-api.open-meteo.com/v1/search";


/* ---------------------------------------------------------
   2. REFERENCIAS HTML
   --------------------------------------------------------- */

const footer = document.getElementById(
    "hangar-footer"
);

const locationNameElement =
    document.getElementById(
        "location-name"
    );

const weatherIconElement =
    document.getElementById(
        "weather-icon"
    );

const weatherConditionElement =
    document.getElementById(
        "weather-condition"
    );

const temperatureElement =
    document.getElementById(
        "temperature"
    );

const localTimeElement =
    document.getElementById(
        "local-time"
    );

const localDateElement =
    document.getElementById(
        "local-date"
    );

const changeLocationButton =
    document.getElementById(
        "change-location"
    );

const locationSearch =
    document.getElementById(
        "location-search"
    );

const closeSearchButton =
    document.getElementById(
        "close-search"
    );

const locationInput =
    document.getElementById(
        "location-input"
    );

const locationResults =
    document.getElementById(
        "location-results"
    );


/* ---------------------------------------------------------
   3. ESTADO ACTUAL
   --------------------------------------------------------- */

let currentLocation = null;

let currentTimezone =
    DEFAULT_LOCATION.timezone;

let currentWeatherData = null;

let searchTimeout = null;


/* ---------------------------------------------------------
   4. INICIALIZACIÓN
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    initializeFooter
);


async function initializeFooter() {

    const savedLocation =
        loadSavedLocation();

    if (savedLocation) {

        currentLocation =
            savedLocation;

    } else {

        currentLocation =
            DEFAULT_LOCATION;

    }


    updateLocationName();

    updateLocalClock();

    setInterval(
        updateLocalClock,
        1000
    );

    await loadWeather();

}


/* ---------------------------------------------------------
   5. CARGAR LOCALIDAD GUARDADA
   --------------------------------------------------------- */

function loadSavedLocation() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.warn(
            "No se pudo cargar la localidad guardada.",
            error
        );

        return null;
    }

}


/* ---------------------------------------------------------
   6. GUARDAR LOCALIDAD
   --------------------------------------------------------- */

function saveLocation(location) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(location)
        );

    } catch (error) {

        console.warn(
            "No se pudo guardar la localidad.",
            error
        );

    }

}


/* ---------------------------------------------------------
   7. ACTUALIZAR NOMBRE DE LOCALIDAD
   --------------------------------------------------------- */

function updateLocationName() {

    if (!currentLocation) {
        return;
    }


    const city =
        currentLocation.name ||
        "Montevideo";


    const country =
        currentLocation.country ||
        "Uruguay";


    locationNameElement.textContent =
        `${city}, ${country}`.toUpperCase();

}


/* ---------------------------------------------------------
   8. CARGAR CLIMA
   --------------------------------------------------------- */

async function loadWeather() {

    if (!currentLocation) {
        return;
    }


    setLoadingState();


    try {

        const url =
            new URL(
                WEATHER_API_URL
            );


        url.searchParams.set(
            "latitude",
            currentLocation.latitude
        );


        url.searchParams.set(
            "longitude",
            currentLocation.longitude
        );


        url.searchParams.set(
            "current",
            [
                "temperature_2m",
                "weather_code",
                "is_day"
            ].join(",")
        );


        url.searchParams.set(
            "timezone",
            "auto"
        );


        url.searchParams.set(
            "forecast_days",
            "1"
        );


        const response =
            await fetch(
                url.toString()
            );


        if (!response.ok) {

            throw new Error(
                "No se pudo obtener el clima."
            );

        }


        const data =
            await response.json();


        currentWeatherData =
            data;


        updateWeather(
            data
        );


        currentTimezone =
            data.timezone ||
            currentLocation.timezone ||
            DEFAULT_LOCATION.timezone;


    } catch (error) {

        console.error(
            "Error al obtener el clima:",
            error
        );


        showWeatherError();

    }

}


/* ---------------------------------------------------------
   9. ACTUALIZAR INFORMACIÓN DEL CLIMA
   --------------------------------------------------------- */

function updateWeather(data) {

    if (
        !data ||
        !data.current
    ) {

        showWeatherError();

        return;

    }


    const current =
        data.current;


    const temperature =
        Math.round(
            current.temperature_2m
        );


    const weatherCode =
        current.weather_code;


    const isDay =
        Boolean(
            current.is_day
        );


    const weatherInfo =
        getWeatherInfo(
            weatherCode,
            isDay
        );


    temperatureElement.textContent =
        `${temperature} °C`;


    weatherConditionElement.textContent =
        weatherInfo.label;


    weatherIconElement.textContent =
        weatherInfo.icon;


    updateWeatherBackground(
        weatherInfo.type
    );

}


/* ---------------------------------------------------------
   10. CÓDIGOS METEOROLÓGICOS
   --------------------------------------------------------- */

function getWeatherInfo(
    weatherCode,
    isDay
) {

    /*
       Códigos basados en
       WMO Weather Interpretation Codes.
    */


    if (
        weatherCode === 0
    ) {

        if (isDay) {

            return {
                label: "DESPEJADO",
                icon: "☀️",
                type: "clear"
            };

        }

        return {
            label: "CIELO DESPEJADO",
            icon: "🌙",
            type: "night"
        };

    }


    if (
        weatherCode === 1 ||
        weatherCode === 2
    ) {

        if (isDay) {

            return {
                label: "PARCIALMENTE NUBLADO",
                icon: "⛅",
                type: "clear"
            };

        }

        return {
            label: "NOCHE PARCIALMENTE NUBLADA",
            icon: "☾",
            type: "night"
        };

    }


    if (
        weatherCode === 3
    ) {

        return {
            label: "NUBLADO",
            icon: "☁️",
            type: "cloudy"
        };

    }


    if (
        weatherCode === 45 ||
        weatherCode === 48
    ) {

        return {
            label: "NIEBLA",
            icon: "🌫️",
            type: "cloudy"
        };

    }


    if (
        weatherCode >= 51 &&
        weatherCode <= 57
    ) {

        return {
            label: "LLOVIZNA",
            icon: "🌦️",
            type: "rain"
        };

    }


    if (
        weatherCode >= 61 &&
        weatherCode <= 67
    ) {

        return {
            label: "LLUVIA",
            icon: "🌧️",
            type: "rain"
        };

    }


    if (
        weatherCode >= 71 &&
        weatherCode <= 77
    ) {

        return {
            label: "NIEVE",
            icon: "❄️",
            type: "cloudy"
        };

    }


    if (
        weatherCode >= 80 &&
        weatherCode <= 82
    ) {

        return {
            label: "CHUBASCOS",
            icon: "🌦️",
            type: "rain"
        };

    }


    if (
        weatherCode >= 85 &&
        weatherCode <= 86
    ) {

        return {
            label: "CHUBASCOS DE NIEVE",
            icon: "🌨️",
            type: "cloudy"
        };

    }


    if (
        weatherCode >= 95
    ) {

        return {
            label: "TORMENTA",
            icon: "⛈️",
            type: "storm"
        };

    }


    return {
        label: "CONDICIONES VARIABLES",
        icon: "🌤️",
        type: "clear"
    };

}


/* ---------------------------------------------------------
   11. CAMBIAR FONDO METEOROLÓGICO
   --------------------------------------------------------- */

function updateWeatherBackground(
    weatherType
) {

    const weatherClasses = [
        "weather-clear",
        "weather-cloudy",
        "weather-rain",
        "weather-storm",
        "weather-sunset",
        "weather-sunrise",
        "weather-night"
    ];


    footer.classList.remove(
        ...weatherClasses
    );


    footer.classList.add(
        `weather-${weatherType}`
    );


    /*
       En una próxima etapa,
       aquí conectaremos los fondos
       visuales originales de Hangar Play.
    */

}


/* ---------------------------------------------------------
   12. ESTADO DE CARGA
   --------------------------------------------------------- */

function setLoadingState() {

    temperatureElement.textContent =
        "-- °C";


    weatherConditionElement.textContent =
        "CONSULTANDO EL CIELO";


    weatherIconElement.textContent =
        "✈️";

}


/* ---------------------------------------------------------
   13. ERROR DEL CLIMA
   --------------------------------------------------------- */

function showWeatherError() {

    temperatureElement.textContent =
        "-- °C";


    weatherConditionElement.textContent =
        "DATOS NO DISPONIBLES";


    weatherIconElement.textContent =
        "☁️";

}


/* ---------------------------------------------------------
   14. RELOJ LOCAL
   --------------------------------------------------------- */

function updateLocalClock() {

    if (!currentTimezone) {
        return;
    }


    const now =
        new Date();


    try {

        const time =
            new Intl.DateTimeFormat(
                "es-UY",
                {
                    timeZone:
                        currentTimezone,

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hour12:
                        false
                }
            ).format(now);


        const date =
            new Intl.DateTimeFormat(
                "es-UY",
                {
                    timeZone:
                        currentTimezone,

                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "long",

                    year:
                        "numeric"
                }
            ).format(now);


        localTimeElement.textContent =
            time;


        localDateElement.textContent =
            date;


    } catch (error) {

        console.warn(
            "No se pudo actualizar la hora local.",
            error
        );

    }

}


/* ---------------------------------------------------------
   15. ABRIR BUSCADOR
   --------------------------------------------------------- */

changeLocationButton.addEventListener(
    "click",
    openLocationSearch
);


function openLocationSearch() {

    locationSearch.classList.remove(
        "hidden"
    );


    locationSearch.setAttribute(
        "aria-hidden",
        "false"
    );


    locationInput.value =
        "";


    locationResults.innerHTML =
        "";


    setTimeout(
        () => {
            locationInput.focus();
        },
        100
    );

}


/* ---------------------------------------------------------
   16. CERRAR BUSCADOR
   --------------------------------------------------------- */

closeSearchButton.addEventListener(
    "click",
    closeLocationSearch
);


function closeLocationSearch() {

    locationSearch.classList.add(
        "hidden"
    );


    locationSearch.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ---------------------------------------------------------
   17. CERRAR CON ESCAPE
   --------------------------------------------------------- */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !locationSearch.classList.contains(
                "hidden"
            )
        ) {

            closeLocationSearch();

        }

    }
);


/* ---------------------------------------------------------
   18. BUSCADOR DE LOCALIDADES
   --------------------------------------------------------- */

locationInput.addEventListener(
    "input",
    () => {

        const query =
            locationInput.value.trim();


        clearTimeout(
            searchTimeout
        );


        if (
            query.length < 2
        ) {

            locationResults.innerHTML =
                "";

            return;

        }


        searchTimeout =
            setTimeout(
                () => {
                    searchLocations(
                        query
                    );
                },
                450
            );

    }
);


/* ---------------------------------------------------------
   19. CONSULTAR LOCALIDADES
   --------------------------------------------------------- */

async function searchLocations(
    query
) {

    locationResults.innerHTML =
        `
        <div class="location-result">
            Buscando localidades...
        </div>
        `;


    try {

        const url =
            new URL(
                GEOCODING_API_URL
            );


        url.searchParams.set(
            "name",
            query
        );


        url.searchParams.set(
            "count",
            "8"
        );


        url.searchParams.set(
            "language",
            "es"
        );


        url.searchParams.set(
            "format",
            "json"
        );


        const response =
            await fetch(
                url.toString()
            );


        if (!response.ok) {

            throw new Error(
                "Error en la búsqueda."
            );

        }


        const data =
            await response.json();


        displayLocationResults(
            data.results || []
        );


    } catch (error) {

        console.error(
            "Error buscando localidades:",
            error
        );


        locationResults.innerHTML =
            `
            <div class="location-result">
                No se pudieron buscar localidades.
            </div>
            `;

    }

}


/* ---------------------------------------------------------
   20. MOSTRAR RESULTADOS
   --------------------------------------------------------- */

function displayLocationResults(
    results
) {

    locationResults.innerHTML =
        "";


    if (
        results.length === 0
    ) {

        locationResults.innerHTML =
            `
            <div class="location-result">
                No encontramos esa localidad.
            </div>
            `;

        return;

    }


    results.forEach(
        (result) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "location-result";


            const country =
                result.country ||
                "";


            const admin1 =
                result.admin1 ||
                "";


            button.innerHTML =
                `
                <strong>
                    ${escapeHTML(
                        result.name
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        admin1
                    )}

                    ${
                        admin1 &&
                        country
                            ? ", "
                            : ""
                    }

                    ${escapeHTML(
                        country
                    )}
                </span>
                `;


            button.addEventListener(
                "click",
                () => {

                    selectLocation(
                        result
                    );

                }
            );


            locationResults.appendChild(
                button
            );

        }
    );

}


/* ---------------------------------------------------------
   21. SELECCIONAR LOCALIDAD
   --------------------------------------------------------- */

async function selectLocation(
    result
) {

    currentLocation = {

        name:
            result.name,

        country:
            result.country ||
            "",

        latitude:
            result.latitude,

        longitude:
            result.longitude,

        timezone:
            result.timezone ||
            DEFAULT_LOCATION.timezone

    };


    saveLocation(
        currentLocation
    );


    updateLocationName();


    closeLocationSearch();


    currentTimezone =
        currentLocation.timezone;


    await loadWeather();

}


/* ---------------------------------------------------------
   22. SEGURIDAD — ESCAPAR HTML
   --------------------------------------------------------- */

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ---------------------------------------------------------
   23. FIN DEL SCRIPT
   --------------------------------------------------------- */
