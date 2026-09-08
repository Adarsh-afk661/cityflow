export interface WeatherData {
  temperatureC: number;
  precipitationMm: number;
  rainMm: number;
  windSpeedKmh: number;
  humidityPercent: number;
  weatherCode: number;
  conditionText: string;
  weatherRiskScore: number; // 0 (ideal) to 100 (extreme danger)
  source: string;
  timestamp: string;
}

export async function fetchCorridorWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      const current = data.current;
      if (current) {
        const temp = current.temperature_2m;
        const precip = current.precipitation;
        const rain = current.rain;
        const wind = current.wind_speed_10m;
        const humidity = current.relative_humidity_2m;
        const code = current.weather_code ?? 0;

        // Only return data if we have actual values from API
        if (temp === undefined || wind === undefined) {
          console.warn('[WeatherService] Incomplete data from Open-Meteo response');
          return null;
        }

        const conditionText = decodeWmoWeatherCode(code);
        const weatherRiskScore = calculateWeatherRisk(rain ?? 0, wind, code);

        return {
          temperatureC: temp,
          precipitationMm: precip ?? 0,
          rainMm: rain ?? 0,
          windSpeedKmh: wind,
          humidityPercent: humidity ?? 0,
          weatherCode: code,
          conditionText,
          weatherRiskScore,
          source: 'Open-Meteo High-Resolution Numerical Forecast',
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('[WeatherService] Live Open-Meteo fetch failed:', (err as Error).message);
  }

  // Return null — caller must display WEATHER DATA UNAVAILABLE, not fake values
  return null;
}

function decodeWmoWeatherCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 80 && code <= 82) return 'Heavy Rainfall';
  if (code >= 95 && code <= 99) return 'Thunderstorm Warning';
  return 'Fair / Standard Visibility';
}

function calculateWeatherRisk(rainMm: number, windKmh: number, code: number): number {
  let risk = 5;
  if (rainMm > 0.5) risk += 15;
  if (rainMm > 2.5) risk += 25;
  if (rainMm > 10) risk += 40;
  if (windKmh > 35) risk += 15;
  if (windKmh > 55) risk += 30;
  if (code >= 80) risk += 20;
  if (code >= 95) risk += 35;
  return Math.min(100, Math.max(0, risk));
}
