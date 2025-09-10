// src/config/environment.ts
import 'dotenv/config';

export interface EnvConfig {
  PORT: number | string;
  HOST?: string;
  JWT_SECRET?: string;
  REDIS_URL?: string;
  AUTH_SERVICE_URL: string;
  QR_SERVICE_URL: string;
  ANALYTICS_SERVICE_URL: string;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://10.1.4.19:3001',
  QR_SERVICE_URL: process.env.QR_SERVICE_URL || 'http://localhost:3002',
  ANALYTICS_SERVICE_URL: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003',
};
