// src/config/routes.ts
import { env } from './environment.js';

export interface RouteConfig {
  path: string;
  target: string;
  methods: string[];
  middleware: string[];
}

export const routes: RouteConfig[] = [
  {
    path: '/api/v1/auth/**',
    target: env.AUTH_SERVICE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    middleware: []
  },
  {
    path: '/api/v1/users/**',
    target: env.AUTH_SERVICE_URL,
    methods: ['GET', 'PUT', 'DELETE'],
    middleware: ['auth', 'session', 'rbac']
  },
  {
    path: '/api/v1/qr/**',
    target: env.QR_SERVICE_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    middleware: ['auth', 'session', 'rbac']
  },
  {
    path: '/api/v1/dashboard/**',
    target: env.ANALYTICS_SERVICE_URL,
    methods: ['POST'],
    middleware: ['auth', 'session', 'rbac']
  },
  {
    path: '/gateway/api/v1/**',
    target: env.AUTH_SERVICE_URL,
    methods: ['GET'],
    middleware: []
  }
];
