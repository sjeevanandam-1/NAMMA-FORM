import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  
  JWT_SECRET: process.env.JWT_SECRET || 'agriconnect_super_secret_jwt_key_2026_change_in_prod',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'agriconnect_super_secret_refresh_jwt_key_2026_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
  AI_FALLBACK_MODE: process.env.AI_FALLBACK_MODE !== 'false',
  
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
};
