// examples/weather-forecast-plugin/src/formatter.ts

import { WeatherInfo } from "./api.ts";

/**
 * WeatherInfoオブジェクトを整形された文字列に変換します。
 * @param {WeatherInfo} data
 * @returns {string}
 */
export function formatWeather(data) {
  const today = data.forecasts.find((f) => f.dateLabel === "今日");
  const tomorrow = data.forecasts.find((f) => f.dateLabel === "明日");

  let formatted = `${data.title}\n`;
  formatted += `\n${data.description.text}\n`;
  if (today) {
    formatted += `\n今日の天気: ${today.telop}\n`;
  }
  if (tomorrow) {
    formatted += `明日の天気: ${tomorrow.telop}\n`;
  }

  return formatted;
}
