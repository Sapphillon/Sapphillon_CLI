// examples/weather-forecast-plugin/src/index.ts

import { fetchWeather } from "./api.ts";
import { formatWeather } from "./formatter.ts";

/**
 * 指定された都市の天気予報を取得します。
 * @param {string} cityId - 天気予報を取得する都市のID
 * @returns {Promise<string>} 整形された天気予報
 * @permission ["Net:weather.tsukumijima.net"]
 */
export async function getWeatherForecast(cityId: string): Promise<string> {
  const weatherData = await fetchWeather(cityId);
  return formatWeather(weatherData);
}
