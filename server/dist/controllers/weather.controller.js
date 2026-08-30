"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherController = void 0;
const response_js_1 = require("../utils/response.js");
const weather_service_js_1 = require("../services/weather.service.js");
class WeatherController {
    /**
     * Get agro-climatic forecast and actionable alerts for a district
     */
    static async getWeather(req, res) {
        try {
            const district = req.query.district || 'Coimbatore';
            const state = req.query.state || 'Tamil Nadu';
            const data = await weather_service_js_1.WeatherService.getAgroWeather(district, state);
            (0, response_js_1.sendSuccess)(res, data);
        }
        catch (err) {
            (0, response_js_1.sendError)(res, err.message, 500);
        }
    }
}
exports.WeatherController = WeatherController;
