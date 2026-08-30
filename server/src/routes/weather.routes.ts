import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller.js';

const router = Router();

router.get('/', WeatherController.getWeather);

export default router;
