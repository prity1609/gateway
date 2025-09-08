// src/index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/environment.js';
import routes from './config/routes.json' assert { type: 'json' };
import { authMiddleware } from './middleware/auth.middleware.js';
import { rbacMiddleware } from './middleware/rbac.middleware.js';
import { createProxy } from './middleware/proxy.middleware.js';
import { uuidMiddleware } from './middleware/uuid.middleware.js';
import { createSessionMiddleware, ensureSessionMiddleware } from './middleware/session.middleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Global UUID middleware - automatically sets UUID on every request
app.use(uuidMiddleware);

const middlewareMap = {
  auth: authMiddleware,
  rbac: rbacMiddleware,
  uuid: uuidMiddleware,
  session: ensureSessionMiddleware,
};

// Health check endpoint for the gateway itself
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'running'
  });
});

// Test endpoint to verify gateway functionality without backend services
app.get('/gateway/ping', (req, res) => {
  res.json({
    message: 'Gateway is working!',
    timestamp: new Date().toISOString(),
    requestReceived: true
  });
});

// Test endpoint for authentication (creates a test session)
app.post('/gateway/test-auth', async (req, res) => {
  try {
    const testUser = {
      userId: 'test-user-123',
      role: 'user',
      email: 'test@example.com'
    };
    
    // Create a test JWT
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(testUser, env.JWT_SECRET, { expiresIn: '1h' });
    
    // Use UUID from global middleware (req.uuid is already set)
    const sessionId = req.uuid;
    
    // Store in Redis with existing UUID
    const redisClient = (await import('./config/redis.js')).default;
    await redisClient.set(`session:${sessionId}`, token, { EX: 3600 });
    
    res.json({
      message: 'Test session created using automatic UUID',
      sessionId: sessionId,
      user: testUser,
      flow: 'Global UUID Middleware → Redis Storage',
      cookieAlreadySet: 'UUID cookie was set automatically'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create test session',
      message: error.message
    });
  }
});

// Test endpoint that requires authentication - MUST be before dynamic routes
app.get('/gateway/test-protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Route status endpoint - shows all configured routes
app.get('/gateway/routes', (req, res) => {
  res.json({
    message: 'Gateway route configuration',
    routes: routes.map(route => ({
      path: route.path,
      target: route.target,
      middleware: route.middleware,
      status: 'configured'
    })),
    totalRoutes: routes.length
  });
});

// Test endpoint to verify auth middleware is working (should fail without cookie)
app.get('/gateway/test-no-auth', (req, res) => {
  res.json({
    message: 'This endpoint has NO authentication - should always work',
    timestamp: new Date().toISOString(),
    authRequired: false
  });
});

routes.forEach((route) => {
  // Replace environment variable placeholders in target URLs
  const targetUrl = route.target
    .replace('${AUTH_SERVICE_URL}', env.AUTH_SERVICE_URL)
    .replace('${QR_SERVICE_URL}', env.QR_SERVICE_URL)
    .replace('${ANALYTICS_SERVICE_URL}', env.ANALYTICS_SERVICE_URL);

  const routeMiddlewares = route.middleware.map((name) => middlewareMap[name]).filter(Boolean);

  const methodCheck = (req, res, next) => {
    if (route.methods && !route.methods.includes(req.method)) {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
    return next();
  };

  const proxy = createProxy(targetUrl, route.path);

  app.use(route.path, methodCheck, ...routeMiddlewares, proxy);
});

app.listen(env.PORT, () => {
  console.log(`API Gateway is live on port ${env.PORT}`);
});