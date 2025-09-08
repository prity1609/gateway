// src/middleware/session.middleware.js
import { randomUUID } from 'crypto';
import redisClient from '../config/redis.js';

export const createSessionMiddleware = async (token, res) => {
  try {
    // Generate UUID for session
    const sessionId = randomUUID();
    
    // Store in Redis FIRST
    await redisClient.set(`session:${sessionId}`, token, { EX: 3600 });
    
    // THEN set UUID cookie AFTER Redis storage
    res.cookie('uuid', sessionId, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });
    
    return sessionId;
  } catch (error) {
    throw new Error(`Session creation failed: ${error.message}`);
  }
};

// Middleware to ensure session exists for authenticated routes
export const ensureSessionMiddleware = async (req, res, next) => {
  // If user is authenticated but no UUID cookie exists
  if (req.user && !req.cookies.uuid) {
    try {
      // Create new session with Redis-first flow
      const jwt = (await import('jsonwebtoken')).default;
      const { env } = await import('../config/environment.js');
      
      // Re-sign JWT for session storage
      const token = jwt.sign(req.user, env.JWT_SECRET, { expiresIn: '1h' });
      
      // Create session with Redis-first → UUID cookie flow
      const sessionId = await createSessionMiddleware(token, res);
      
      console.log(`Created new session: ${sessionId} for user: ${req.user.userId}`);
    } catch (error) {
      return res.status(500).json({
        error: 'Session creation failed',
        message: error.message
      });
    }
  }
  
  next();
};
