# SKYCAST — Modern Weather Application

A responsive weather dashboard built with semantic HTML, CSS and vanilla JavaScript. Weather and air-quality values are fetched live from Open-Meteo; no API key is required for the public endpoints used here.

## Run locally
1. Extract the `skycast-weather-app` folder.
2. Open the folder in Visual Studio Code.
3. Run `index.html` with the **Live Server** extension (recommended), or serve the folder with any local HTTP server.
4. Ensure your browser has internet access.

Geolocation generally requires a secure context (`https://` or `localhost`) and explicit browser permission. The app never silently assumes the visitor's location. It starts with Buea, Cameroon as a clearly identified default demo location; search for another city or use **Use my location**.

## Features
- Worldwide city search with geocoding suggestions.
- Current conditions, feels-like temperature, daily high/low, sunrise/sunset.
- Hourly forecast and 7-day forecast.
- Humidity, wind, pressure, visibility, UV, clouds and dew point.
- European AQI and available pollutant readings.
- Celsius/Fahrenheit and km/h/mph conversion.
- Favorite cities, recent-search cache, theme and settings persistence.
- Responsive mobile navigation and keyboard-visible focus states.
- Loading, API/network errors, missing air-quality data states.

## API endpoints and fields
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Air quality: `https://air-quality-api.open-meteo.com/v1/air-quality`

The endpoint/field selections are centralized in `js/config.js` and `js/weather.js`. Open-Meteo public endpoints used here do not require an API key. Review the provider's current terms, attribution requirements and usage limits before production deployment:
- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/geocoding-api
- https://open-meteo.com/en/docs/air-quality-api

## Honest feature boundaries
- **Weather alerts:** Open-Meteo forecast/air-quality endpoints used by this project do not provide an official severe-weather alert feed. The UI explicitly says alerts are not configured; no warnings are fabricated. To add alerts, integrate a supported official provider for the deployment region.
- **Weather map:** The map area is an explicit placeholder. Configure a mapping/weather tile provider and comply with its API key, attribution and licensing rules before presenting an interactive map.
- **Air quality:** Some pollutants or locations may be absent. Missing values are displayed as unavailable rather than fabricated.
- **Contact / location:** Geolocation is requested only after the visitor clicks the location button (or selects automatic location mode).

## Project structure
```text
skycast-weather-app/
├── index.html
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── weather.js
│   ├── forecast.js
│   ├── location.js
│   ├── favorites.js
│   └── script.js
├── assets/
│   └── icons/
└── README.md
```

## Before production
Test with real browsers/devices and add automated tests. The browser app has been syntax-checked, but cannot guarantee live API availability, every browser's geolocation behavior, or a full visual regression test from this build environment.
