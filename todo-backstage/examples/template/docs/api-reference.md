# API Reference

Complete reference for all API endpoints in the Full-Stack Todo Application.

## Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:5000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication Endpoints

#### Register User

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Login User

Authenticate and receive a JWT token.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### Todo Endpoints

#### Get All Todos

Retrieve all todos for the authenticated user.

```http
GET /api/todos
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": 1,
        "title": "Complete project",
        "description": "Finish the todo application",
        "completed": false,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Create Todo

Create a new todo item.

```http
POST /api/todos
```

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "New todo item",
  "description": "This is a new todo item"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "todo": {
      "id": 2,
      "title": "New todo item",
      "description": "This is a new todo item",
      "completed": false,
      "user_id": 1,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Todo created successfully"
}
```

#### Update Todo

Update an existing todo item.

```http
PUT /api/todos/:id
```

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "Updated todo title",
  "description": "Updated description",
  "completed": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "todo": {
      "id": 1,
      "title": "Updated todo title",
      "description": "Updated description",
      "completed": true,
      "updated_at": "2024-01-15T11:30:00Z"
    }
  },
  "message": "Todo updated successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Todo not found"
}
```

#### Delete Todo

Delete a todo item.

```http
DELETE /api/todos/:id
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Todo not found"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Todo endpoints**: 100 requests per 15 minutes per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Validation Rules

### User Registration

- **username**: Required, 3-30 characters, alphanumeric and underscores
- **email**: Required, valid email format
- **password**: Required, minimum 8 characters, at least one uppercase, one lowercase, one number

### Todo Creation/Update

- **title**: Required, 1-255 characters
- **description**: Optional, max 1000 characters
- **completed**: Optional, boolean value

## Example Usage

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get Todos
curl -X GET http://localhost:5000/api/todos \
  -H "Authorization: Bearer <token>"

# Create Todo
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New todo","description":"Todo description"}'
```

### Using JavaScript Fetch

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { data } = await response.json();
const token = data.token;

// Get Todos
const todosResponse = await fetch('http://localhost:5000/api/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const todos = await todosResponse.json();
```

