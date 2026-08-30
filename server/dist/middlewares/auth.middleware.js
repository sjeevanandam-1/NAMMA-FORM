"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateToken = void 0;
const token_js_1 = require("../utils/token.js");
const response_js_1 = require("../utils/response.js");
const prisma_js_1 = require("../config/prisma.js");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        (0, response_js_1.sendError)(res, 'Authentication token is required', 401);
        return;
    }
    try {
        const payload = (0, token_js_1.verifyAccessToken)(token);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true, name: true, isVerified: true },
        });
        if (!user) {
            (0, response_js_1.sendError)(res, 'User account no longer exists', 401);
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        (0, response_js_1.sendError)(res, 'Invalid or expired authentication token', 401, error);
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_js_1.sendError)(res, 'Unauthorized - Authentication required', 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_js_1.sendError)(res, `Forbidden - Access restricted to roles: ${allowedRoles.join(', ')}`, 403);
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
