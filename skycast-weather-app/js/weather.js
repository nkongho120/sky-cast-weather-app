(() => {
  const cfg = window.SKYCAST_CONFIG;
  const cache = new Map();
  const weatherCodes = {
    0:["Clear sky","☀","sun"],1:["Mainly clear","🌤","sun"],2:["Partly cloudy","⛅","cloud"],3:["Overcast","☁","cloud"],
    45:["Fog","🌫","fog"],48:["Depositing rime fog","🌫","fog"],51:["Light drizzle","🌦","rain"],53:["Drizzle","🌦","rain"],55:["Dense drizzle","🌧","rain"],
    56:["Freezing drizzle","🌧","rain"],57:["Freezing drizzle","🌧","rain"],61:["Slight rain","🌦","rain"],63:["Moderate rain","🌧","rain"],65:["Heavy rain","🌧","rain"],
    66:["Freezing rain","🌧","rain"],67:["Heavy freezing rain","🌧","rain"],71:["Slight snow","🌨","snow"],73:["Moderate snow","🌨","snow"],75:["Heavy snow","❄","snow"],77:["Snow grains","❄","snow"],
    80:["Rain showers","🌦","rain"],81:["Rain showers","🌧","rain"],82:["Violent rain showers","⛈","storm"],85:["Snow showers","🌨","snow"],86:["Heavy snow showers","❄","snow"],
    95:["Thunderstorm","⛈","storm"],96:["Thunderstorm with hail","⛈","storm"],99:["Thunderstorm with hail","⛈","storm"]
  };
  const safeFetch = async (url) => {
    const key = url;
    const cached = cache.get(key);
    if (cached && Date.now()-cached.time < cfg.cacheMinutes*60000) return cached.data;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.status === 400 ? "The weather service could not understand this request." : `Weather service error (${response.status}). Please try again.`);
    const data = await response.json();
    if (!data || data.error) throw new Error(data.reason || "The weather service returned invalid data.");
    cache.set(key,{time:Date.now(),data});
    return data;
  };
  const geocode = async (query) => {
    const url = `${cfg.geocoding}?name=${encodeURIComponent(query)}&count=7&language=en&format=json`;
    const data = await safeFetch(url);
    if (!Array.isArray(data.results) || !data.results.length) throw new Error(`No location found for “${query}”. Try another city name.`);
    return data.results;
  };
  const getWeather = async (place) => {
    const params = new URLSearchParams({
      latitude:place.latitude,longitude:place.longitude,timezone:"auto",
      current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
      hourly:"temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,visibility,uv_index,dew_point_2m",
      daily:"weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
      forecast_days:"7",wind_speed_unit:"kmh",temperature_unit:"celsius"
    });
    return safeFetch(`${cfg.forecast}?${params}`);
  };
  const getAirQuality = async (place) => {
    const params = new URLSearchParams({latitude:place.latitude,longitude:place.longitude,timezone:"auto",current:"european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone"});
    return safeFetch(`${cfg.airQuality}?${params}`);
  };
  const describeCode = code => weatherCodes[code] || ["Weather conditions","🌡","cloud"];
  window.WeatherAPI = {geocode,getWeather,getAirQuality,describeCode};
})();
