/* =========================================================
HANGAR PLAY RADIO — FOOTER / CLIMA Y HORA
Archivo: footer.js
========================================================= */

/* =========================================================
CONFIGURACIÓN
========================================================= */

const WEATHER_API_URL =
"https://api.open-meteo.com/v1/forecast";

const GEOCODING_API_URL =
"https://geocoding-api.open-meteo.com/v1/search";

/* =========================================================
ESTADO DE LA APLICACIÓN
========================================================= */

let currentLocation = {
name: "Montevideo",
country: "Uruguay",
latitude: -34.9011,
longitude: -56.1645,
timezone: "America/Montevideo"
};

let currentWeather = {
temperature: null,
weatherCode: null,
isDay: true,
sunrise: null,
sunset: null
};

let clockInterval = null;
let weatherInterval = null;

/* =========================================================
ELEMENTOS DEL DOM
========================================================= */

const footerElement =
document.getElementById("hangar-footer");

const weatherBackground =
document.querySelector(".weather-background");

const locationNameElement =
document.getElementById("location-name");

const changeLocationButton =
document.getElementById("change-location");

const locationSearch =
document.getElementById("location-search");

const closeSearchButton =
document.getElementById("close-search");

const locationInput =
document.getElementById("location-input");

const locationResults =
document.getElementById("location-results");

const weatherIcon =
document.getElementById("weather-icon");

const weatherCondition =
document.getElementById("weather-condition");

const temperatureElement =
document.getElementById("temperature");

const localTimeElement =
document.getElementById("local-time");

const localDateElement =
document.getElementById("local-date");

/* =========================================================
FONDOS METEOROLÓGICOS
========================================================= */

const WEATHER_CLASSES = [
"weather-clear",
"weather-cloudy",
"weather-rain",
"weather-storm",
"weather-sunrise",
"weather-sunset",
"weather-night"
];

/* =========================================================
ICONOS METEOROLÓGICOS
========================================================= */

const WEATHER_ICONS = {

```
clear: "☀️",

cloudy: "☁️",

rain: "🌧️",

storm: "⛈️",

sunrise: "🌅",

sunset: "🌇",

night: "🌙"
```

};

/* =========================================================
DESCRIPCIONES METEOROLÓGICAS
========================================================= */

const WEATHER_LABELS = {

```
clear: "DESPEJADO",

cloudy: "NUBLADO",

rain: "LLUVIA",

storm: "TORMENTA",

sunrise: "AMANECER",

sunset: "ATARDECER",

night: "NOCHE"
```

};

/* =========================================================
INICIO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
initializeFooter
);

async function initializeFooter() {

```
loadSavedLocation();

updateLocationName();

updateLocalClock();

startClock();

await updateWeather();

startWeatherUpdates();

setupLocationSearch();
```

}

/* =========================================================
LOCALIDAD GUARDADA
========================================================= */

function loadSavedLocation() {

```
const savedLocation =
    localStorage.getItem(
        "hangarPlayLocation"
    );

if (!savedLocation) {
    return;
}

try {

    const parsedLocation =
        JSON.parse(savedLocation);

    if (
        parsedLocation &&
        Number.isFinite(
            Number(parsedLocation.latitude)
        ) &&
        Number.isFinite(
            Number(parsedLocation.longitude)
        )
    ) {

        currentLocation = {

            name:
                parsedLocation.name ||
                "Montevideo",

            country:
                parsedLocation.country ||
                "Uruguay",

            latitude:
                Number(
                    parsedLocation.latitude
                ),

            longitude:
                Number(
                    parsedLocation.longitude
                ),

            timezone:
                parsedLocation.timezone ||
                "America/Montevideo"

        };

    }

} catch (error) {

    console.warn(
        "No se pudo cargar la localidad guardada.",
        error
    );

}
```

}

/* =========================================================
GUARDAR LOCALIDAD
========================================================= */

function saveLocation() {

```
localStorage.setItem(

    "hangarPlayLocation",

    JSON.stringify(
        currentLocation
    )

);
```

}

/* =========================================================
ACTUALIZAR NOMBRE DE LOCALIDAD
========================================================= */

function updateLocationName() {

```
if (!locationNameElement) {
    return;
}

locationNameElement.textContent =

    `${currentLocation.name}, ${currentLocation.country}`;
```

}

/* =========================================================
CLIMA
========================================================= */

async function updateWeather() {

```
try {

    const url =

        `${WEATHER_API_URL}` +

        `?latitude=${encodeURIComponent(
            currentLocation.latitude
        )}` +

        `&longitude=${encodeURIComponent(
            currentLocation.longitude
        )}` +

        `&current=temperature_2m,weather_code,is_day` +

        `&daily=sunrise,sunset` +

        `&timezone=auto` +

        `&forecast_days=1`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `Error HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    currentWeather = {

        temperature:
            data.current?.temperature_2m ??
            null,

        weatherCode:
            data.current?.weather_code ??
            null,

        isDay:
            Number(
                data.current?.is_day
            ) === 1,

        sunrise:
            data.daily?.sunrise?.[0] ??
            null,

        sunset:
            data.daily?.sunset?.[0] ??
            null

    };


    updateWeatherInterface();

    updateWeatherBackground();


} catch (error) {

    console.error(
        "No se pudo obtener el clima.",
        error
    );

    if (temperatureElement) {

        temperatureElement.textContent =
            "-- °C";

    }

    if (weatherCondition) {

        weatherCondition.textContent =
            "CLIMA NO DISPONIBLE";

    }

    updateWeatherBackground();

}
```

}

/* =========================================================
ACTUALIZAR INTERFAZ DEL CLIMA
========================================================= */

function updateWeatherInterface() {

```
const weatherState =
    getWeatherState();


if (weatherIcon) {

    weatherIcon.textContent =
        WEATHER_ICONS[
            weatherState
        ] ||
        WEATHER_ICONS.clear;

}


if (weatherCondition) {

    weatherCondition.textContent =
        WEATHER_LABELS[
            weatherState
        ] ||
        WEATHER_LABELS.clear;

}


if (temperatureElement) {

    if (
        typeof currentWeather.temperature ===
        "number"
    ) {

        temperatureElement.textContent =

            `${Math.round(
                currentWeather.temperature
            )} °C`;

    } else {

        temperatureElement.textContent =
            "-- °C";

    }

}
```

}

/* =========================================================
DETERMINAR ESTADO METEOROLÓGICO
========================================================= */

function getWeatherState() {

```
const now =
    new Date();


const sunrise =
    parseLocalDateTime(
        currentWeather.sunrise
    );


const sunset =
    parseLocalDateTime(
        currentWeather.sunset
    );


/*
   NOCHE:
   Si Open-Meteo indica que es de noche,
   usamos directamente el estado nocturno.
*/

if (
    currentWeather.isDay === false
) {

    return "night";

}


/*
   AMANECER:
   Ventana aproximada de 60 minutos
   alrededor del amanecer.
*/

if (
    sunrise &&
    isWithinMinutes(
        now,
        sunrise,
        60
    )
) {

    return "sunrise";

}


/*
   ATARDECER:
   Ventana aproximada de 60 minutos
   alrededor del atardecer.
*/

if (
    sunset &&
    isWithinMinutes(
        now,
        sunset,
        60
    )
) {

    return "sunset";

}


/*
   ESTADO SEGÚN CÓDIGO METEOROLÓGICO
*/

return getWeatherStateFromCode(
    currentWeather.weatherCode
);
```

}

/* =========================================================
ESTADO SEGÚN CÓDIGO WMO
========================================================= */

function getWeatherStateFromCode(
weatherCode
) {

```
const code =
    Number(weatherCode);


if (
    code === 0
) {

    return "clear";

}


if (
    [
        1,
        2,
        3,
        45,
        48
    ].includes(code)
) {

    return "cloudy";

}


if (
    [
        51,
        53,
        55,
        56,
        57,
        61,
        63,
        65,
        66,
        67,
        80,
        81,
        82
    ].includes(code)
) {

    return "rain";

}


if (
    [
        71,
        73,
        75,
        77,
        85,
        86,
        95,
        96,
        99
    ].includes(code)
) {

    return "storm";

}


return "clear";
```

}

/* =========================================================
CAMBIAR FONDO METEOROLÓGICO
========================================================= */

function updateWeatherBackground() {

```
if (!footerElement) {
    return;
}


WEATHER_CLASSES.forEach(
    weatherClass => {

        footerElement.classList.remove(
            weatherClass
        );

    }
);


const weatherState =
    getWeatherState();


const newClass =
    `weather-${weatherState}`;


footerElement.classList.add(
    newClass
);
```

}

/* =========================================================
FECHA Y HORA LOCAL
========================================================= */

function updateLocalClock() {

```
if (
    !localTimeElement ||
    !localDateElement
) {

    return;

}


const now =
    new Date();


const timezone =
    currentLocation.timezone ||
    "America/Montevideo";


const timeFormatter =
    new Intl.DateTimeFormat(
        "es-UY",
        {

            timeZone:
                timezone,

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit",

            hour12:
                false

        }
    );


const dateFormatter =
    new Intl.DateTimeFormat(
        "es-UY",
        {

            timeZone:
                timezone,

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    );


localTimeElement.textContent =
    timeFormatter.format(now);


localDateElement.textContent =
    capitalizeFirstLetter(
        dateFormatter.format(now)
    );
```

}

/* =========================================================
INICIAR RELOJ
========================================================= */

function startClock() {

```
if (clockInterval) {

    clearInterval(
        clockInterval
    );

}


clockInterval =
    setInterval(

        updateLocalClock,

        1000

    );
```

}

/* =========================================================
ACTUALIZACIONES DEL CLIMA
========================================================= */

function startWeatherUpdates() {

```
if (weatherInterval) {

    clearInterval(
        weatherInterval
    );

}


/*
   Actualiza el clima cada 10 minutos.
*/

weatherInterval =
    setInterval(

        updateWeather,

        10 * 60 * 1000

    );
```

}

/* =========================================================
BUSCADOR DE LOCALIDADES
========================================================= */

function setupLocationSearch() {

```
if (
    !changeLocationButton ||
    !closeSearchButton ||
    !locationSearch ||
    !locationInput ||
    !locationResults
) {

    return;

}


changeLocationButton.addEventListener(

    "click",

    openLocationSearch

);


closeSearchButton.addEventListener(

    "click",

    closeLocationSearch

);


locationSearch.addEventListener(

    "click",

    event => {

        if (
            event.target ===
            locationSearch
        ) {

            closeLocationSearch();

        }

    }

);


locationInput.addEventListener(

    "input",

    debounce(

        searchLocations,

        450

    )

);


locationInput.addEventListener(

    "keydown",

    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeLocationSearch();

        }

    }

);
```

}

/* =========================================================
ABRIR BUSCADOR
========================================================= */

function openLocationSearch() {

```
if (
    !locationSearch ||
    !locationInput
) {

    return;

}


locationSearch.classList.remove(
    "hidden"
);


locationSearch.setAttribute(
    "aria-hidden",
    "false"
);


setTimeout(

    () => {

        locationInput.focus();

    },

    50

);
```

}

/* =========================================================
CERRAR BUSCADOR
========================================================= */

function closeLocationSearch() {

```
if (
    !locationSearch ||
    !locationInput ||
    !locationResults
) {

    return;

}


locationSearch.classList.add(
    "hidden"
);


locationSearch.setAttribute(
    "aria-hidden",
    "true"
);


locationInput.value =
    "";


locationResults.innerHTML =
    "";
```

}

/* =========================================================
BUSCAR LOCALIDADES
========================================================= */

async function searchLocations() {

```
if (!locationInput) {
    return;
}


const query =
    locationInput.value.trim();


if (
    query.length <
    2
) {

    if (locationResults) {

        locationResults.innerHTML =
            "";

    }

    return;

}


if (locationResults) {

    locationResults.innerHTML =
        "<div class=\"search-status\">Buscando...</div>";

}


try {

    const url =

        `${GEOCODING_API_URL}` +

        `?name=${encodeURIComponent(
            query
        )}` +

        `&count=8` +

        `&language=es` +

        `&format=json`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `Error HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    renderLocationResults(
        data.results ||
        []
    );


} catch (error) {

    console.error(
        "Error buscando localidades.",
        error
    );


    if (locationResults) {

        locationResults.innerHTML =

            "<div class=\"search-status\">" +

            "No se pudieron encontrar localidades." +

            "</div>";

    }

}
```

}

/* =========================================================
MOSTRAR RESULTADOS
========================================================= */

function renderLocationResults(
locations
) {

```
if (!locationResults) {
    return;
}


locationResults.innerHTML =
    "";


if (
    !locations ||
    locations.length === 0
) {

    locationResults.innerHTML =

        "<div class=\"search-status\">" +

        "No se encontraron localidades." +

        "</div>";

    return;

}


locations.forEach(
    location => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "location-result";


        const locationName =
            document.createElement(
                "strong"
            );


        locationName.textContent =
            location.name ||
            "Localidad";


        const locationDetails =
            document.createElement(
                "span"
            );


        const details = [

            location.admin1,

            location.country

        ].filter(Boolean);


        locationDetails.textContent =
            details.join(
                ", "
            );


        button.appendChild(
            locationName
        );


        button.appendChild(
            locationDetails
        );


        button.addEventListener(

            "click",

            () => {

                selectLocation(
                    location
                );

            }

        );


        locationResults.appendChild(
            button
        );

    }
);
```

}

/* =========================================================
SELECCIONAR LOCALIDAD
========================================================= */

async function selectLocation(
location
) {

```
currentLocation = {

    name:
        location.name ||
        "Localidad",

    country:
        location.country ||
        "",

    latitude:
        Number(
            location.latitude
        ),

    longitude:
        Number(
            location.longitude
        ),

    timezone:
        location.timezone ||
        "auto"

};


saveLocation();

updateLocationName();

closeLocationSearch();

updateLocalClock();

await updateWeather();
```

}

/* =========================================================
PARSEAR FECHA LOCAL
========================================================= */

function parseLocalDateTime(
value
) {

```
if (!value) {
    return null;
}


const parsed =
    new Date(value);


if (
    Number.isNaN(
        parsed.getTime()
    )
) {

    return null;

}


return parsed;
```

}

/* =========================================================
COMPROBAR VENTANA DE TIEMPO
========================================================= */

function isWithinMinutes(
currentTime,
targetTime,
minutes
) {

```
if (
    !currentTime ||
    !targetTime
) {

    return false;

}


const difference =
    Math.abs(

        currentTime.getTime() -
        targetTime.getTime()

    );


return (

    difference <=
    minutes *
    60 *
    1000

);
```

}

/* =========================================================
CAPITALIZAR TEXTO
========================================================= */

function capitalizeFirstLetter(
text
) {

```
if (!text) {
    return "";
}


return (

    text.charAt(0).toUpperCase() +

    text.slice(1)

);
```

}

/* =========================================================
DEBOUNCE
========================================================= */

function debounce(
callback,
delay
) {

```
let timeout;


return function (...args) {

    clearTimeout(
        timeout
    );


    timeout =

        setTimeout(

            () => {

                callback.apply(
                    this,
                    args
                );

            },

            delay

        );

};
```

}

