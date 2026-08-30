"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_controller_js_1 = require("../controllers/passport.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/my-passport', auth_middleware_js_1.authenticateToken, passport_controller_js_1.PassportController.getFarmerPassport);
exports.default = router;
