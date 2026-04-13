export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
}

const WMO_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear Skies', icon: 'wb_sunny' },
  1: { label: 'Mainly Clear', icon: 'wb_sunny' },
  2: { label: 'Partly Cloudy', icon: 'partly_cloudy_day' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Foggy', icon: 'foggy' },
  48: { label: 'Depositing Rime Fog', icon: 'foggy' },
  51: { label: 'Light Drizzle', icon: 'grain' },
  53: { label: 'Moderate Drizzle', icon: 'grain' },
  55: { label: 'Dense Drizzle', icon: 'grain' },
  61: { label: 'Slight Rain', icon: 'cloudy_snowing' },
  63: { label: 'Moderate Rain', icon: 'rainy' },
  65: { label: 'Heavy Rain', icon: 'rainy' },
  71: { label: 'Slight Snow', icon: 'ac_unit' },
  73: { label: 'Moderate Snow', icon: 'ac_unit' },
  75: { label: 'Heavy Snow', icon: 'ac_unit' },
  80: { label: 'Slight Rain Showers', icon: 'rainy' },
  81: { label: 'Moderate Rain Showers', icon: 'rainy' },
  82: { label: 'Violent Rain Showers', icon: 'rainy' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
};

export async function fetchWeather(lat?: number, lon?: number): Promise<WeatherData> {
  // Default to a serene location (near a forest in Europe) if no coordinates provided
  const latitude = lat ?? 48.8566;
  const longitude = lon ?? 2.3522;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`
    );
    const data = await response.json();

    const current = data.current;
    const wmo = WMO_MAP[current.weather_code] || { label: 'Serene', icon: 'filter_drama' };

    return {
      temp: Math.round(current.temperature_2m),
      condition: wmo.label,
      icon: wmo.icon,
      humidity: current.relative_humidity_2m,
    };
  } catch (error) {
    console.error('Weather fetch failed:', error);
    return {
      temp: 22,
      condition: 'Serene',
      icon: 'filter_drama',
      humidity: 45,
    };
  }
}
