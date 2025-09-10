// src/middleware/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { checkPermission } from '../access-control/permissions.js';

export const rbacMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role;
  const userId = (req as any).user?.userId;
  const resource = req.originalUrl.split('?')[0];
  const method = req.method as any; // Cast to any to match Method type

  if (!userRole) {
    return res.status(403).json({ message: 'Forbidden: No role assigned.' });
  }

  if (!checkPermission(userRole, resource, method)) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission.' });
  }

  if (userRole !== 'admin' && requiresOwnershipCheck(resource)) {
    if (!checkResourceOwnership(userId, resource)) {
      return res.status(403).json({
        message: 'Forbidden: You can only access your own resources.'
      });
    }
  }

  next();
};

const requiresOwnershipCheck = (resource: string): boolean => {
  const ownershipPatterns = [
    '/api/v1/users/',
    '/api/v1/profile',
    '/api/v1/qr/user/'
  ];
  return ownershipPatterns.some(pattern => resource.includes(pattern));
};

const checkResourceOwnership = (userId: string, resource: string): boolean => {
  try {
    if (resource.includes('/api/v1/users/')) {
      const pathParts = resource.split('/');
      const resourceUserId = pathParts[5];
      if (!resourceUserId || resourceUserId === userId) {
        return true;
      }
      return false;
    }
    if (resource.includes('/api/v1/profile')) {
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error in ownership check:', error);
    return false;
  }
};
