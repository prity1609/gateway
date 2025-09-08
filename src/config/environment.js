// src/config/environment.js
import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  
  // Microservice URLs
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  QR_SERVICE_URL: process.env.QR_SERVICE_URL || 'http://localhost:3002',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
};