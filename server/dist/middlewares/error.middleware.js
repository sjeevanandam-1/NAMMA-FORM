"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_js_1 = require("../utils/response.js");
const zod_1 = require("zod");
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    console.error('[Error Middleware]:', err);
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        (0, response_js_1.sendError)(res, 'Validation failed for request parameters', 400, formattedErrors);
        return;
    }
    if (err.name === 'UnauthorizedError' || err.message.includes('jwt')) {
        (0, response_js_1.sendError)(res, 'Invalid or expired credentials', 401);
        return;
    }
    const message = err.message || 'Internal server error occurred';
    (0, response_js_1.sendError)(res, message, 500);
};
exports.errorHandler = errorHandler;
