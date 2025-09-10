// src/middleware/proxy.middleware.ts
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const createProxy = (target: string, routePath: string) => {
  console.log(`🔧 Creating proxy: ${routePath} → ${target}`);

  const options = {
    target,
    changeOrigin: true,
    pathRewrite: (path: string, req: any) => {
      const fullPath = req.originalUrl.split('?')[0];
      if (fullPath.startsWith('/api/v1/users')) {
        return fullPath.replace('/api/v1/users', '/users');
      }
      if (fullPath.startsWith('/api/v1/qr')) {
        return fullPath.replace('/api/v1/qr', '/qr');
      }
      if (fullPath.startsWith('/api/v1/dashboard')) {
        return fullPath.replace('/api/v1/dashboard', '/dashboard');
      }
      // Do NOT rewrite /api/v1/auth, forward as-is
      return fullPath;
    },
    onError: (err: Error, req: any, res: any) => {
      console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl} → ${target}:`, err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Backend service unavailable',
        timestamp: new Date().toISOString()
      });
    },
    onProxyRes: (proxyRes: any, req: any, res: any) => {
      let body = Buffer.from([]);
      proxyRes.on('data', (chunk: Buffer) => {
        body = Buffer.concat([body, chunk]);
      });
      proxyRes.on('end', () => {
        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          res.status(proxyRes.statusCode || 500).json({
            error: 'Backend returned HTML error',
            message: body.toString(),
            timestamp: new Date().toISOString()
          });
        }
      });
    }
  };

  return createProxyMiddleware(options);
};
