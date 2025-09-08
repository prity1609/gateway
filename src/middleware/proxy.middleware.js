// src/middleware/proxy.middleware.js
import { createProxyMiddleware } from 'http-proxy-middleware';

export const createProxy = (target, path) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${path.replace('/**', '')}`]: '',
    },
  });
};