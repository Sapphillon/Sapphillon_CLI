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
async function fetchWeather(cityId) {
  const url = `https://weather.tsukumijima.net/api/forecast?city=${cityId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data.");
  }
  return response.json();
}


// examples/weather-forecast-plugin/src/formatter.ts

/**
 * WeatherInfoオブジェクトを整形された文字列に変換します。
 * @param {WeatherInfo} data
 * @returns {string}
 */
function formatWeather(data) {
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

// examples/weather-forecast-plugin/src/index.ts


/**
 * 指定された都市の天気予報を取得します。
 * @param {string} cityId - 天気予報を取得する都市のID
 * @returns {Promise<string>} 整形された天気予報
 * @permission ["Net:weather.tsukumijima.net"]
 */
async function getWeatherForecast(cityId) {
  const weatherData = await fetchWeather(cityId);
  return formatWeather(weatherData);
}

Sapphillon.Package = {
  meta: {
    name: "Weather Forecast Plugin",
    version: "1.0.0",
    description: "A plugin to get the weather forecast.",
    author_id: "app.sapphillon",
    package_id: "app.sapphillon.weather-forecast-plugin"
  },
  functions: {
    getWeatherForecast: {
      handler: getWeatherForecast,
      permissions: [{ type: "Net", resource: "weather.tsukumijima.net" }],
      description: "指定された都市の天気予報を取得します。",
      parameters: [
        { name: "cityId", idx: 0, type: "string", description: "天気予報を取得する都市のID" }
      ],
      returns: [
        { type: "Promise<string>", idx: 0, description: "整形された天気予報" }
      ]
    }
  }
};
