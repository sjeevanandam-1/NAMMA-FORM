"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_js_1 = require("./config/env.js");
const error_middleware_js_1 = require("./middlewares/error.middleware.js");
const rateLimiter_middleware_js_1 = require("./middlewares/rateLimiter.middleware.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const socket_service_js_1 = require("./services/socket.service.js");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Security & Utility Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: [env_js_1.ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// Static uploads serving
const uploadsPath = path_1.default.join(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
// Apply rate limiter to /api
app.use('/api', rateLimiter_middleware_js_1.apiLimiter);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'HEALTHY',
        service: 'Namma Farm API Server',
        timestamp: new Date().toISOString(),
        env: env_js_1.ENV.NODE_ENV,
        fallbackMode: env_js_1.ENV.AI_FALLBACK_MODE,
    });
});
// Mount modular API routes
app.use('/api', index_js_1.default);
// Serve frontend client dist if built
const clientDistPath = path_1.default.join(process.cwd(), '..', 'client', 'dist');
const localClientDistPath = path_1.default.join(process.cwd(), 'client', 'dist');
if (fs_1.default.existsSync(clientDistPath)) {
    app.use(express_1.default.static(clientDistPath));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
else if (fs_1.default.existsSync(localClientDistPath)) {
    app.use(express_1.default.static(localClientDistPath));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(localClientDistPath, 'index.html'));
    });
}
// Global error handling middleware
app.use(error_middleware_js_1.errorHandler);
// Initialize Socket.IO server
(0, socket_service_js_1.initSocket)(server, env_js_1.ENV.CLIENT_URL);
// Start server
server.listen(env_js_1.ENV.PORT, () => {
    console.log(`
========================================================
🌾 NAMMA FARM - SERVER RUNNING
========================================================
🚀 API Server listening on: http://localhost:${env_js_1.ENV.PORT}
📊 Health check: http://localhost:${env_js_1.ENV.PORT}/api/health
🌐 Client Origin: ${env_js_1.ENV.CLIENT_URL}
========================================================
  `);
});
