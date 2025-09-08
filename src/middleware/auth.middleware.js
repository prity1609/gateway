// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import redisClient from '../config/redis.js';

export const authMiddleware = async (req, res, next) => {
  const sessionId = req.cookies.uuid; // Use UUID cookie instead

  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized: No session ID found.' });
  }

  try {
    const jwtFromRedis = await redisClient.get(`session:${sessionId}`);

    if (!jwtFromRedis) {
      return res.status(401).json({ message: 'Unauthorized: Session not found or expired.' });
    }

    const decoded = jwt.verify(jwtFromRedis, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid session token.' });
  }
};