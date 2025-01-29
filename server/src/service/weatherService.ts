import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

export class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

class WeatherService {

  private baseURL?: string;

  private apiKey?: string;

  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
  }
  // Get current weather by city
  async getWeatherForCity(city: string) {
    
    this.city = city;
    const coordsArray: Coordinates[] = await this.convertCityToCoords(this.city);

    try {
      const response = await fetch(
        `${this.baseURL}/data/2.5/weather?lat=${coordsArray[0].lat}&lon=${coordsArray[0].lon}&units=imperial&appid=${this.apiKey}`
      );

      const cityWeather = await response.json();

      const weather = new Weather(
        cityWeather.name,
        dayjs().format('MM/DD/YYYY'),
        cityWeather.main.temp,
        cityWeather.wind.speed,
        cityWeather.main.humidity,
        cityWeather.weather[0].icon,
        cityWeather.weather[0].description
      );

      return weather;
    } catch (err) {
      console.error('Error:', err);
      return err;
    }
  }

  // Get 5 day / 3 hour forecast by city - store in array and return
  async getForecastForCity(city: string) {
    // Convert city to coordinates
    const coordsArray: Coordinates[] = await this.convertCityToCoords(city);

    try {
      const response = await fetch(
        `${this.baseURL}/data/2.5/forecast/?lat=${coordsArray[0].lat}&lon=${coordsArray[0].lon}&units=imperial&appid=${this.apiKey}`
      );

      const cityForecast = await response.json();
      const forecastArray = cityForecast.list.map((forecast: any) => {
        const formattedDate = dayjs(forecast.dt_txt).format('MM/DD/YYYY HH:mm:ss');

        return new Weather(
          city,
          formattedDate,
          forecast.main.temp,
          forecast.wind.speed,
          forecast.main.humidity,
          forecast.weather[0].icon,
          forecast.weather[0].description
        );
    });

      return forecastArray;
      
    } catch (err) {
      console.error('Error:', err);
      return err;
  }
}
  // Convert city name to coordinates
  async convertCityToCoords(city: string): Promise<Coordinates[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/geo/1.0/direct?q=${city}&appid=${this.apiKey}`
      );

      const locationData = await response.json();
      const coordsArray: Coordinates[] = locationData.map((coord: any) => {
        const coordObject: Coordinates = {
          name: coord.name,
          lat: coord.lat,
          lon: coord.lon,
          country: coord.country,
          state: coord.state,
        };
        return coordObject;
      });
      return coordsArray;
    } catch (err: any) {
      console.error('Error:', err);
      throw new Error(err);
    }
  }
}

export default new WeatherService();
