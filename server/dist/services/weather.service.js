"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const env_js_1 = require("../config/env.js");
class WeatherService {
    /**
     * Fetches weather information for a district/state from live Weather API,
     * translating it to actionable agricultural alerts.
     */
    static async getAgroWeather(district, state) {
        if (!env_js_1.ENV.WEATHER_API_KEY) {
            return {
                district,
                state,
                isConfigured: false,
                message: 'Weather service is not configured. Please set WEATHER_API_KEY in the server environment.',
                temperature: null,
                humidity: null,
                rainfallMm: null,
                rainProbability: null,
                windSpeedKmh: null,
                condition: 'Not Configured',
                forecast: [],
                actionableAlerts: [
                    'Weather service not configured. Add WEATHER_API_KEY in server environment to enable live agricultural alerts.',
                ],
            };
        }
        try {
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${env_js_1.ENV.WEATHER_API_KEY}&q=${encodeURIComponent(`${district}, ${state}`)}&days=7&aqi=no&alerts=yes`;
            const res = await fetch(url);
            if (res.ok) {
                const data = (await res.json());
                const current = data.current;
                const forecastList = data.forecast?.forecastday || [];
                const alerts = [];
                if (current.precip_mm > 20 || current.humidity > 85) {
                    alerts.push('High humidity and rainfall detected. Monitor crops for fungal infections (Blight, Mildew) and ensure proper field drainage.');
                }
                if (current.temp_c > 38) {
                    alerts.push('Extreme heat alert! Increase irrigation frequency during early morning or late evening to prevent heat stress.');
                }
                if (current.wind_kph > 30) {
                    alerts.push('High wind velocity expected. Avoid spraying pesticides or foliar fertilizers today.');
                }
                if (alerts.length === 0) {
                    alerts.push('Weather conditions are favorable for field operations, weeding, and standard harvest schedules.');
                }
                return {
                    district,
                    state,
                    isConfigured: true,
                    temperature: current.temp_c,
                    humidity: current.humidity,
                    rainfallMm: current.precip_mm,
                    rainProbability: forecastList[0]?.day?.daily_chance_of_rain || 20,
                    windSpeedKmh: current.wind_kph,
                    condition: current.condition.text,
                    forecast: forecastList.map((f) => ({
                        day: new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' }),
                        tempMax: f.day.maxtemp_c,
                        tempMin: f.day.mintemp_c,
                        condition: f.day.condition.text,
                        rainProb: f.day.daily_chance_of_rain,
                        rainfallMm: f.day.totalprecip_mm,
                    })),
                    actionableAlerts: alerts,
                };
            }
        }
        catch (err) {
            console.warn('[Weather API error]:', err);
        }
        return {
            district,
            state,
            isConfigured: false,
            message: 'Weather data is currently unavailable from the upstream provider.',
            temperature: null,
            humidity: null,
            rainfallMm: null,
            rainProbability: null,
            windSpeedKmh: null,
            condition: 'Unavailable',
            forecast: [],
            actionableAlerts: ['Weather data unavailable. Please verify internet connection or API key.'],
        };
    }
}
exports.WeatherService = WeatherService;
