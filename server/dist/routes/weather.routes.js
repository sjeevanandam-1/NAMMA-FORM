"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weather_controller_js_1 = require("../controllers/weather.controller.js");
const router = (0, express_1.Router)();
router.get('/', weather_controller_js_1.WeatherController.getWeather);
exports.default = router;
