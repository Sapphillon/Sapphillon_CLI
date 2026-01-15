// examples/weather-forecast-plugin/src/api.ts
  async function fetchWeather(cityId) {
    const url = `https://weather.tsukumijima.net/api/forecast?city=${encodeURIComponent(cityId)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // examples/weather-forecast-plugin/src/formatter.ts
  function formatWeather(data) {
    const today = data.forecasts.find((f) => f.dateLabel === "今日");
    const tomorrow = data.forecasts.find((f) => f.dateLabel === "明日");
    let formatted = `${data.title}
`;
    formatted += `
${data.description.text}
`;
    if (today) {
      formatted += `
今日の天気: ${today.telop}
`;
    }
    if (tomorrow) {
      formatted += `明日の天気: ${tomorrow.telop}
`;
    }
    return formatted;
  }

  // examples/weather-forecast-plugin/src/index.ts
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
      permissions: [{type: "Net", resource: "weather.tsukumijima.net"}],
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
