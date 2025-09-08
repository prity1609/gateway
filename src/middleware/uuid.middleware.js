// src/middleware/uuid.middleware.js
import { randomUUID } from 'crypto';

export const uuidMiddleware = (req, res, next) => {
  // Check if UUID cookie already exists
  const existingUuid = req.cookies.uuid;
  
  if (!existingUuid) {
    // Generate new UUID and set it in response cookie
    const uuid = randomUUID();
    
    res.cookie('uuid', uuid, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Also attach to request for use in other middleware
    req.uuid = uuid;
  } else {
    // Use existing UUID
    req.uuid = existingUuid;
  }
  
  next();
};

