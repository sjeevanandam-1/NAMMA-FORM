"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200, meta) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'An unexpected error occurred', statusCode = 500, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.sendError = sendError;
