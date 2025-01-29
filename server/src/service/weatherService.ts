//import dotenv from 'dotenv';
//dotenv.config();

// TODO: Define an interface for the Coordinates object

// TODO: Define a class for the Weather object

// TODO: Complete the WeatherService class
//class WeatherService {
// TODO: Define the baseURL, API key, and city name properties
// TODO: Create fetchLocationData method
// private async fetchLocationData(query: string) {}
// TODO: Create destructureLocationData method
// private destructureLocationData(locationData: Coordinates): Coordinates {}
// TODO: Create buildGeocodeQuery method
// private buildGeocodeQuery(): string {}
// TODO: Create buildWeatherQuery method
// private buildWeatherQuery(coordinates: Coordinates): string {}
// TODO: Create fetchAndDestructureLocationData method
// private async fetchAndDestructureLocationData() {}
// TODO: Create fetchWeatherData method
// private async fetchWeatherData(coordinates: Coordinates) {}
// TODO: Build parseCurrentWeather method
// private parseCurrentWeather(response: any) {}
// TODO: Complete buildForecastArray method
// private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
// TODO: Complete getWeatherForCity method
// async getWeatherForCity(city: string) {}
//}

import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// TODO: Define a class for the Weather object
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

// TODO: Complete the WeatherService class
class WeatherService {

  private baseURL?: string;

  private apiKey?: string;

  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
  }
  // TODO: method to fetch weather based on city 
  async getWeatherForCity(city: string) {
    //Fetch weather based on city logic
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

  // TODO: method to fetch 5 day forecast based on lon and lat 
  async getForecastForCity(city: string) {
    //Fetch 5 day forecast based on city logic
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
//export default new WeatherService();

export default new WeatherService();
