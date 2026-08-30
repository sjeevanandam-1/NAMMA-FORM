import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import routes from './routes/index.js';
import { initSocket } from './services/socket.service.js';

const app = express();
const server = http.createServer(app);

// Security & Utility Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads serving
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Namma Farm API Server',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
    fallbackMode: ENV.AI_FALLBACK_MODE,
  });
});

// Mount modular API routes
app.use('/api', routes);

// Serve frontend client dist if built
const clientDistPath = path.join(process.cwd(), '..', 'client', 'dist');
const localClientDistPath = path.join(process.cwd(), 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else if (fs.existsSync(localClientDistPath)) {
  app.use(express.static(localClientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(localClientDistPath, 'index.html'));
  });
}

// Global error handling middleware
app.use(errorHandler);

// Initialize Socket.IO server
initSocket(server, ENV.CLIENT_URL);

// Start server
server.listen(ENV.PORT, () => {
  console.log(`
========================================================
🌾 NAMMA FARM - SERVER RUNNING
========================================================
🚀 API Server listening on: http://localhost:${ENV.PORT}
📊 Health check: http://localhost:${ENV.PORT}/api/health
🌐 Client Origin: ${ENV.CLIENT_URL}
========================================================
  `);
});

export { app, server };
