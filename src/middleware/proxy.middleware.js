// src/middleware/proxy.middleware.js
import { createProxyMiddleware } from 'http-proxy-middleware';

export const createProxy = (target, routePath) => {
  console.log(`🔧 Creating proxy: ${routePath} → ${target}`);
  
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Use originalUrl to get the full path, then rewrite based on route type
      const fullPath = req.originalUrl.split('?')[0]; // Remove query params
      
      // Auth routes - match your backend exactly
      if (fullPath.startsWith('/api/v1/auth')) {
        // Backend expects /auth paths, so rewrite /api/v1/auth → /auth
        return fullPath.replace('/api/v1/auth', '/auth');
      }
      
      // User routes - match your backend exactly  
      if (fullPath.startsWith('/api/v1/users')) {
        // Backend expects /users paths, so rewrite /api/v1/users → /users
        return fullPath.replace('/api/v1/users', '/users');
      }
      
      // QR routes (if you have a separate QR service)
      if (fullPath.startsWith('/api/v1/qr')) {
        return fullPath.replace('/api/v1/qr', '/qr');
      }
      
      // Dashboard/Analytics routes (if you have a separate analytics service)
      if (fullPath.startsWith('/api/v1/dashboard')) {
        return fullPath.replace('/api/v1/dashboard', '/dashboard');
      }
      
      // Gateway API routes - remove /gateway prefix for backend
      if (fullPath.startsWith('/gateway/api/v1/')) {
        return fullPath.replace('/gateway/api/v1/', '/api/v1/');
      }
      
      return fullPath;
    },
    
    // Handle proxy errors
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl} → ${target}:`, err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Backend service unavailable',
        timestamp: new Date().toISOString()
      });
    }
  });
};
