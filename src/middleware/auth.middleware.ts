// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import redisClient from '../config/redis.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.uuid;
  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized: No session ID found.' });
  }
  try {
    const jwtFromRedis = await redisClient.get(`session:${sessionId}`);
    if (!jwtFromRedis) {
      return res.status(401).json({ message: 'Unauthorized: Session not found or expired.' });
    }
    if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const decoded = jwt.verify(jwtFromRedis, env.JWT_SECRET as string);
    (req as any).user = decoded;
    (req as any).jwtToken = jwtFromRedis;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: 'Unauthorized: Invalid session token.' });
  }
};
