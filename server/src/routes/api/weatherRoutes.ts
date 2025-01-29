import { Router, type Request, type Response } from 'express';
import { Weather } from '../../service/weatherService.js';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // Client expects an array of weather data...
  try {
    const cityName = req.body.cityName;
    const weatherData: Weather[] = [];
    const currentWeather = await WeatherService.getWeatherForCity(cityName) as Weather;
    console.log(currentWeather);
    const forecastWeather = await WeatherService.getForecastForCity(cityName);
    console.log(forecastWeather);
    weatherData.push(currentWeather);
    weatherData.push(...forecastWeather);
    // Save city to search history
    if (weatherData) {
      await HistoryService.addCity(cityName);
    }
    res.json(weatherData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ error: 'City ID is required' });
    }
    await HistoryService.removeCity(req.params.id);
    res.json({ success: 'City removed from search history' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
