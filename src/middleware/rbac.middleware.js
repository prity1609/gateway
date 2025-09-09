// src/middleware/rbac.middleware.js
import { checkPermission } from '../access-control/permissions.js';

export const rbacMiddleware = (req, res, next) => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;
  const resource = req.originalUrl.split('?')[0]; 
  const method = req.method;

  if (!userRole) {
    return res.status(403).json({ message: 'Forbidden: No role assigned.' });
  }

  // Basic role-based permission check
  if (!checkPermission(userRole, resource, method)) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission.' });
  }

  // Enhanced check: Resource ownership for non-admin users
  if (userRole !== 'admin' && requiresOwnershipCheck(resource)) {
    if (!checkResourceOwnership(userId, resource)) {
      return res.status(403).json({ 
        message: 'Forbidden: You can only access your own resources.' 
      });
    }
  }

  next();
};

// Helper function to determine if resource requires ownership validation
const requiresOwnershipCheck = (resource) => {
  const ownershipPatterns = [
    '/api/v1/users/',
    '/api/v1/profile',
    '/api/v1/qr/user/'
  ];
  
  return ownershipPatterns.some(pattern => resource.includes(pattern));
};

// Helper function to validate resource ownership
const checkResourceOwnership = (userId, resource) => {
  try {
    // Extract user ID from resource path for user-specific routes
    if (resource.includes('/api/v1/users/')) {
      const pathParts = resource.split('/');
      const resourceUserId = pathParts[5]; // /api/v1/users/user/[userId]/...
      
      // Allow if no specific user ID in path or if it matches current user
      if (!resourceUserId || resourceUserId === userId) {
        return true;
      }
      return false;
    }
    
    // Profile routes are always for current user
    if (resource.includes('/api/v1/profile')) {
      return true;
    }
    
    // For other ownership-required routes, let backend handle detailed validation
    return true;
    
  } catch (error) {
    console.error('Error in ownership check:', error);
    return false;
  }
};