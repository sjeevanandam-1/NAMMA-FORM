import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { WeatherService } from '../services/weather.service.js';

export class WeatherController {
  /**
   * Get agro-climatic forecast and actionable alerts for a district
   */
  static async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const district = (req.query.district as string) || 'Coimbatore';
      const state = (req.query.state as string) || 'Tamil Nadu';

      const data = await WeatherService.getAgroWeather(district, state);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
