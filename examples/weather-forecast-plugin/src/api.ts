// examples/weather-forecast-plugin/src/api.ts

/**
 * @typedef {object} WeatherInfo
 * @property {string} title
 * @property {{ text: string }} description
 * @property {{ dateLabel: string; telop: string }[]} forecasts
 */

/**
 * Weather APIから天気予報を取得します。
 * @param {string} cityId
 * @returns {Promise<WeatherInfo>}
 */
export async function fetchWeather(cityId: string) {
  const url = `https://weather.tsukumijima.net/api/forecast?city=${encodeURIComponent(cityId)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
