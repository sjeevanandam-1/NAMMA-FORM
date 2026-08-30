"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const irrigation_controller_js_1 = require("../controllers/irrigation.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.post('/calculate', auth_middleware_js_1.authenticateToken, irrigation_controller_js_1.IrrigationController.calculateIrrigation);
router.get('/history', auth_middleware_js_1.authenticateToken, irrigation_controller_js_1.IrrigationController.getMyIrrigationHistory);
exports.default = router;
