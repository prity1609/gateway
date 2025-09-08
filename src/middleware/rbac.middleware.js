// src/middleware/rbac.middleware.js
import { checkPermission } from '../access-control/permissions.js';

export const rbacMiddleware = (req, res, next) => {
  const userRole = req.user?.role;
  const resource = req.originalUrl.split('?')[0]; 
  const method = req.method;

  if (!userRole) {
    return res.status(403).json({ message: 'Forbidden: No role assigned.' });
  }

  if (!checkPermission(userRole, resource, method)) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission.' });
  }

  next();
};