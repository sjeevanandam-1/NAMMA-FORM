"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_js_1.ENV.JWT_SECRET, {
        expiresIn: '1d', // 1 day for smoother interactive dev/demo experience
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_js_1.ENV.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
