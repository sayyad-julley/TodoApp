# API Reference

Complete API reference for the Full-Stack Todo Application Template.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Validation error",
  "details": "Username already exists"
}
```

### Login User

Authenticate and receive a JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Invalid credentials"
}
```

## Todo Endpoints

### Get All Todos

Retrieve all todos for the authenticated user.

**Endpoint**: `GET /api/todos`

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "todos": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the todo app",
      "completed": false,
      "priority": "high",
      "category": "work",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "subtasks": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Todo

Retrieve a specific todo by ID.

**Endpoint**: `GET /api/todos/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project",
  "description": "Finish the todo app",
  "completed": false,
  "priority": "high",
  "category": "work",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "subtasks": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Todo not found"
}
```

### Create Todo

Create a new todo item.

**Endpoint**: `POST /api/todos`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Complete project",
  "description": "Finish the todo app",
  "priority": "high",
  "category": "work",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "subtasks": [
    {
      "title": "Write documentation",
      "completed": false
    }
  ]
}
```

**Success Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project",
  "description": "Finish the todo app",
  "completed": false,
  "priority": "high",
  "category": "work",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "subtasks": [
    {
      "title": "Write documentation",
      "completed": false
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Todo

Update an existing todo.

**Endpoint**: `PUT /api/todos/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "medium",
  "category": "personal"
}
```

**Success Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "medium",
  "category": "personal",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

### Delete Todo

Delete a todo item.

**Endpoint**: `DELETE /api/todos/:id`

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "message": "Todo deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Todo not found"
}
```

## Health Check Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Success Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

### X-Ray Health Check

Check X-Ray configuration and status.

**Endpoint**: `GET /health/xray`

**Success Response** (200 OK):
```json
{
  "enabled": true,
  "serviceName": "todo-api",
  "daemonAddress": "localhost:2000",
  "status": "connected"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Response Headers**: Include rate limit information

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

## Validation Rules

### User Registration

- `username`: 3-30 characters, alphanumeric and underscores
- `email`: Valid email format
- `password`: Minimum 8 characters

### Todo Creation/Update

- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `priority`: One of: "low", "medium", "high"
- `category`: Optional, max 50 characters
- `dueDate`: Optional, valid ISO date string
- `subtasks`: Optional array of subtask objects

