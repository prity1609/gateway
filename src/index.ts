// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from './config/environment.js';
import { routes } from './config/routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { rbacMiddleware } from './middleware/rbac.middleware.js';
import { createProxy } from './middleware/proxy.middleware.js';
import { uuidMiddleware } from './middleware/uuid.middleware.js';
import { createSessionMiddleware, ensureSessionMiddleware } from './middleware/session.middleware.js';

const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser() as any);
app.use(uuidMiddleware);

const middlewareMap = {
  auth: authMiddleware,
  rbac: rbacMiddleware,
  uuid: uuidMiddleware,
  session: ensureSessionMiddleware,
};

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'running'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gateway Documentation',
  swaggerOptions: { persistAuthorization: true }
}));

app.get('/docs', (req: Request, res: Response) => {
  res.redirect('/api-docs');
});

app.post('/gateway/test-auth', async (req: Request, res: Response) => {
  try {
    const testUser = {
      userId: 'test-user-123',
      role: 'user',
      email: 'test@example.com'
    };
    const jwt = (await import('jsonwebtoken')).default;
    if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const token = jwt.sign(testUser, env.JWT_SECRET as string, { expiresIn: '1h' });
    const sessionId = (req as any).uuid;
    const redisClient = (await import('./config/redis.js')).default;
    await redisClient.set(`session:${sessionId}`, token, { EX: 3600 });
    res.json({
      message: 'Test session created using automatic UUID',
      sessionId: sessionId,
      user: testUser,
      flow: 'Global UUID Middleware → Redis Storage',
      cookieAlreadySet: 'UUID cookie was set automatically'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create test session',
      message: error.message
    });
  }
});

app.get('/gateway/test-protected', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Authentication successful!',
    user: (req as any).user,
    timestamp: new Date().toISOString()
  });
});

app.get('/gateway/routes', (req: Request, res: Response) => {
  res.json({
    message: 'Gateway route configuration',
    routes: (routes as any[]).map(route => ({
      path: route.path,
      target: route.target,
      middleware: route.middleware,
      status: 'configured'
    })),
    totalRoutes: (routes as any[]).length
  });
});

(routes as any[]).forEach((route) => {
  const targetUrl = route.target
    .replace('${AUTH_SERVICE_URL}', env.AUTH_SERVICE_URL)
    .replace('${QR_SERVICE_URL}', env.QR_SERVICE_URL)
    .replace('${ANALYTICS_SERVICE_URL}', env.ANALYTICS_SERVICE_URL);

  const routeMiddlewares = route.middleware.map((name: string) => (middlewareMap as any)[name]).filter(Boolean);

  const methodCheck = (req: Request, res: Response, next: NextFunction) => {
    if (route.methods && !route.methods.includes(req.method)) {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    return next();
  };

  const proxy = createProxy(targetUrl, route.path);

  const injectUserHeaders = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.userId) {
      req.headers['x-user-id'] = (req as any).user.userId;
      req.headers['x-user-role'] = (req as any).user.role || 'user';
    }
    next();
  };

  app.use(route.path, methodCheck, ...routeMiddlewares, injectUserHeaders, proxy);
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      health: 'GET /health',
      documentation: 'GET /api-docs',
      authentication: 'POST /gateway/test-auth',
      // userRoutes: 'GET|PUT|DELETE /api/v1/users/user/:userId'
    },
    timestamp: new Date().toISOString()
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(Number(env.PORT), env.HOST || '0.0.0.0', () => {
  console.log(`API Gateway is live on ${(env.HOST || '0.0.0.0')}:${env.PORT}`);
});
