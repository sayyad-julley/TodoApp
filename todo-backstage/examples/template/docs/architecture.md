# Architecture

This document describes the architecture and design decisions of the Full-Stack Todo Application.

## System Overview

The application follows a three-tier architecture:

```
┌─────────────────┐
│   Frontend      │  React + Vite + Ant Design
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │  Node.js + Express
│   (Port 5000)   │
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │  Database
└─────────────────┘
```

## Frontend Architecture

### Component Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── TodoList.jsx    # Main todo list component
│   ├── EnhancedTodoList.jsx  # Enhanced version with features
│   └── ProtectedRoute.jsx    # Route protection
├── pages/              # Page-level components
│   ├── Login.jsx       # Login page
│   └── Register.jsx    # Registration page
├── contexts/           # React contexts
│   ├── AuthContext.jsx     # Authentication state
│   └── ThemeContext.jsx    # Theme management
└── utils/             # Utility functions
    └── api.js          # API client
```

### State Management

- **React Context**: Used for global state (authentication, theme)
- **Local State**: Component-level state with `useState`
- **API State**: Managed through custom hooks and context

### Routing

- React Router handles client-side navigation
- Protected routes require authentication
- Automatic redirect to login for unauthenticated users

## Backend Architecture

### Directory Structure

```
backend/src/
├── config/             # Configuration files
│   ├── database.js     # Database connection
│   └── secrets-manager.js  # AWS Secrets Manager (optional)
├── controllers/        # Business logic
│   ├── authController.js   # Authentication logic
│   └── todoController.js   # Todo CRUD operations
├── middleware/         # Express middleware
│   ├── auth.js        # JWT authentication
│   ├── errorHandler.js    # Error handling
│   └── validation.js      # Input validation
├── models/             # Data models
│   ├── User.js        # User model
│   └── Todo.js        # Todo model
├── routes/             # API routes
│   ├── authRoutes.js      # Authentication routes
│   └── todoRoutes.js      # Todo routes
└── utils/              # Utility functions
    └── jwt.js          # JWT token handling
```

### Request Flow

1. **Request** → Express server
2. **Middleware** → Authentication, validation, error handling
3. **Controller** → Business logic execution
4. **Model** → Database interaction
5. **Response** → JSON response to client

### Authentication Flow

```
1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token (localStorage)
5. Token included in subsequent requests
6. Backend validates token on protected routes
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Architecture

### Authentication

- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **Token Expiration**: Configurable token lifetime

### Security Middleware

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Joi schema validation

### Data Protection

- SQL injection prevention via parameterized queries
- XSS protection through React's built-in escaping
- CSRF protection via same-origin policy

## API Design

### RESTful Endpoints

- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/todos` - Get user's todos
- **POST** `/api/todos` - Create todo
- **PUT** `/api/todos/:id` - Update todo
- **DELETE** `/api/todos/:id` - Delete todo

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Deployment Architecture

### Development

- Frontend: Vite dev server with HMR
- Backend: Node.js with nodemon for auto-reload
- Database: Local PostgreSQL instance

### Production

- Frontend: Static build served via CDN/Nginx
- Backend: Node.js process managed by PM2
- Database: Managed PostgreSQL (AWS RDS, etc.)
- Containerization: Docker for consistent environments

## Scalability Considerations

- **Stateless Backend**: Horizontal scaling possible
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Can be added for frequently accessed data
- **Load Balancing**: Multiple backend instances supported

## Future Enhancements

- Microservices architecture for larger scale
- Redis for session management and caching
- Message queue for async operations
- Real-time updates with WebSockets
- GraphQL API option

