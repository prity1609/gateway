// src/middleware/uuid.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const uuidMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const existingUuid = (req as any).cookies?.uuid;
  if (!existingUuid) {
    const uuid = randomUUID();
    res.cookie('uuid', uuid, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    (req as any).uuid = uuid;
  } else {
    (req as any).uuid = existingUuid;
  }
  next();
};
