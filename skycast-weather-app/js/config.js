/* SKYCAST API configuration. Open-Meteo public endpoints do not require an API key. */
window.SKYCAST_CONFIG = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast",
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality",
  cacheMinutes: 10
};
