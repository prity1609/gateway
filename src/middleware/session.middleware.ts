// src/middleware/session.middleware.ts
import { Response, Request, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import redisClient from '../config/redis.js';

export const createSessionMiddleware = async (token: string, res: Response): Promise<string> => {
  try {
    const sessionId = randomUUID();
    await redisClient.set(`session:${sessionId}`, token, { EX: 3600 });
    res.cookie('uuid', sessionId, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });
    return sessionId;
  } catch (error: any) {
    throw new Error(`Session creation failed: ${error.message}`);
  }
};

export const ensureSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && !(req as any).cookies?.uuid) {
    try {
      const jwt = (await import('jsonwebtoken')).default;
      const { env } = await import('../config/environment.js');
      if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
      const token = jwt.sign((req as any).user, env.JWT_SECRET as string, { expiresIn: '1h' });
      const sessionId = await createSessionMiddleware(token, res);
      console.log(`Created new session: ${sessionId} for user: ${(req as any).user.userId}`);
    } catch (error: any) {
      return res.status(500).json({
        error: 'Session creation failed',
        message: error.message
      });
    }
  }
  next();
};
