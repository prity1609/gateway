# API Gateway

A robust Express.js API Gateway with Redis session management, JWT authentication, RBAC, and automatic UUID tracking.

## 🚀 Features

- **Automatic UUID Tracking**: Every request gets a unique identifier
- **Redis Session Management**: Persistent session storage with Redis
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Microservice Proxy**: Route requests to multiple backend services
- **Environment-based Configuration**: Flexible deployment settings
- **Health Monitoring**: Built-in health check endpoints

## 🛠️ Tech Stack

- **Node.js** with **Express.js**
- **Redis** for session storage
- **JWT** for authentication
- **Cookie-based** session management
- **CORS** enabled
- **Environment variables** configuration

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd api-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the gateway:
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET="your-secret-key"

# Redis Configuration
REDIS_URL="redis://your-redis-url"

# Microservice URLs
AUTH_SERVICE_URL="http://localhost:3001"
QR_SERVICE_URL="http://localhost:3002"
ANALYTICS_SERVICE_URL="http://localhost:3003"
```

### Routes Configuration

Configure your microservice routes in `src/config/routes.json`:

```json
[
  {
    "path": "/api/v1/auth/**",
    "target": "${AUTH_SERVICE_URL}",
    "methods": ["POST"],
    "middleware": []
  },
  {
    "path": "/api/v1/users/**",
    "target": "${AUTH_SERVICE_URL}",
    "methods": ["GET", "PUT", "PATCH", "DELETE"],
    "middleware": ["auth", "session", "rbac"]
  }
]
```

## 🔄 Flow

1. **UUID Assignment**: Every request gets automatic UUID tracking
2. **Authentication**: JWT-based session validation via Redis
3. **Authorization**: Role-based access control
4. **Proxying**: Requests forwarded to appropriate microservices

## 🧪 Testing

### Test Endpoints

- `GET /health` - Health check
- `GET /gateway/ping` - Gateway connectivity test
- `POST /gateway/test-auth` - Create test session
- `GET /gateway/test-protected` - Test authentication
- `GET /gateway/routes` - View route configuration

### Example Usage

```bash
# Test gateway
curl http://localhost:3000/gateway/ping

# Create test session
curl -c cookies.txt -X POST http://localhost:3000/gateway/test-auth

# Test protected endpoint
curl -b cookies.txt http://localhost:3000/gateway/test-protected
```

## 📂 Project Structure

```
api-gateway/
├── src/
│   ├── config/
│   │   ├── environment.js
│   │   ├── redis.js
│   │   └── routes.json
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── uuid.middleware.js
│   │   ├── session.middleware.js
│   │   └── proxy.middleware.js
│   └── index.js
├── package.json
├── .env
└── README.md
```

## 🔐 Security Features

- HTTP-only cookies for session management
- JWT token validation
- CORS configuration
- Environment-based secrets
- Automatic session expiration

## 📊 Monitoring

- Health check endpoint
- Request logging
- Error handling
- Redis connection monitoring

## 🚀 Deployment

1. Set production environment variables
2. Configure Redis connection
3. Update microservice URLs
4. Deploy to your preferred platform

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
