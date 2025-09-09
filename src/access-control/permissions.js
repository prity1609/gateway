// src/access-control/permissions.js
const permissions = {
  admin: [
    { resource: '/api/v1/auth/user', methods: ['DELETE'] },
    { resource: '/api/v1/dashboard/**', methods: ['POST'] },
    { resource: '/api/v1/qr/**', methods: ['GET', 'POST', 'PUT', 'PATCH'] },
    { resource: '/api/v1/users/**', methods: ['GET', 'PUT', 'PATCH', 'DELETE'] },
    { resource: '/api/v1/profile/**', methods: ['GET', 'PUT', 'PATCH'] }
  ],
  user: [
    { resource: '/api/v1/auth/user', methods: ['GET', 'PUT'] },
    { resource: '/api/v1/auth/password', methods: ['PUT'] },
    { resource: '/api/v1/qr/**', methods: ['GET', 'POST', 'PUT', 'PATCH'] },
    { resource: '/api/v1/users/**', methods: ['GET', 'PUT', 'PATCH'] },
    { resource: '/api/v1/profile/**', methods: ['GET', 'PUT', 'PATCH'] }
  ],
};


const wildcardToRegex = (wildcard) => {
  return new RegExp(`^${wildcard.replace(/\*\*/g, '.*')}$`);
};

export const checkPermission = (role, resource, method) => {
  if (!permissions[role]) {
    return false;
  }

  return permissions[role].some((permission) => {
    const resourceRegex = wildcardToRegex(permission.resource);
    return resourceRegex.test(resource) && permission.methods.includes(method);
  });
};