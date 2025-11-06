# Architecture

This document describes the architecture of the Full-Stack Todo Application Template.

## System Overview

The application follows a modern full-stack architecture with separation of concerns:

```
┌─────────────────┐
│   React Frontend │
│   (Port 5143)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Backend │
│   (Port 5000)   │
└────────┬────────┘
         │
         ├─► MongoDB Database
         │
         └─► AWS X-Ray (Optional)
```

## Frontend Architecture

### Technology Stack

- **React 18**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **Ant Design**: UI component library
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Axios**: HTTP client

### Component Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── TodoList.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   └── Register.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ThemeContext.jsx # Theme management
└── utils/             # Utility functions
    ├── api.js          # API client
    └── xray.js         # X-Ray integration
```

### State Management

- **React Context API**: For global state (auth, theme)
- **Local State**: Component-level state with hooks
- **No Redux**: Kept simple for this template

## Backend Architecture

### Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **AWS X-Ray**: Distributed tracing

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration
│   │   ├── database.js
│   │   └── secrets-manager.js
│   ├── controllers/    # Business logic
│   │   ├── authController.js
│   │   └── todoController.js
│   ├── middleware/     # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/         # Database models
│   │   ├── User.js
│   │   └── Todo.js
│   ├── routes/         # API routes
│   │   ├── authRoutes.js
│   │   └── todoRoutes.js
│   └── utils/         # Utility functions
│       └── jwt.js
├── scripts/           # Utility scripts
│   ├── migrate.js
│   └── seed.js
└── server.js          # Application entry point
```

### Request Flow

1. **Request** → Express middleware chain
2. **Authentication** → JWT validation (if protected route)
3. **Validation** → Request data validation with Joi
4. **Controller** → Business logic execution
5. **Model** → Database operations via Mongoose
6. **Response** → JSON response to client

### Middleware Stack

```javascript
// Order of middleware execution:
1. X-Ray (if enabled)
2. CORS
3. Helmet (security headers)
4. Rate limiting
5. Body parser
6. Authentication
7. Routes
8. Error handler
```

## Database Architecture

### MongoDB Schema

#### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Todo Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  title: String (required),
  description: String,
  completed: Boolean (default: false),
  priority: String (enum: low, medium, high),
  category: String,
  dueDate: Date,
  subtasks: [{
    title: String,
    completed: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- **Users**: `username`, `email` (unique indexes)
- **Todos**: `userId` (for efficient queries)

## Security Architecture

### Authentication Flow

1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token (localStorage/memory)
5. Token included in Authorization header for protected routes
6. Backend validates token on each request

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed and verified tokens
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers (XSS, CSRF protection)
- **Input Validation**: Joi schema validation

## AWS X-Ray Integration

### Tracing Architecture

When X-Ray is enabled:

1. **Request arrives** → X-Ray middleware creates segment
2. **Subsegments** → Database queries, HTTP calls tracked
3. **Annotations** → Custom metadata added
4. **Trace data** → Sent to X-Ray daemon
5. **X-Ray Console** → Visualize traces and service map

### Trace Structure

```
Request Segment
├── Database Query Subsegment
├── HTTP Call Subsegment
│   └── Nested Subsegments
└── Processing Subsegment
```

## Deployment Architecture

### Docker Containers

- **Frontend**: Nginx serving static files
- **Backend**: Node.js Express server
- **Database**: MongoDB
- **X-Ray Daemon**: (Optional) For distributed tracing

### Production Considerations

- Environment variables for secrets
- Database connection pooling
- Health check endpoints
- Logging and monitoring
- Error tracking
- SSL/TLS certificates

## Scalability

### Horizontal Scaling

- **Stateless Backend**: Can scale across multiple instances
- **Database**: MongoDB replica sets for read scaling
- **Load Balancer**: Distribute traffic across instances

### Vertical Scaling

- **Database**: Increase MongoDB resources
- **Application**: Increase Node.js memory/CPU
- **Caching**: Add Redis for frequently accessed data

## Performance Optimizations

- **Database Indexes**: Fast queries
- **Connection Pooling**: Efficient database connections
- **Code Splitting**: Frontend bundle optimization
- **Lazy Loading**: Load components on demand
- **Caching**: Reduce redundant operations

