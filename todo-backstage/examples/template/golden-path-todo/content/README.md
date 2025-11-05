# __APP_NAME__

__APP_DESCRIPTION__

## Features

- **Frontend**: React with Vite, Ant Design, and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest for backend, Vitest for frontend

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

3. **Set up the database**:
   ```bash
   # Create a PostgreSQL database
   createdb __APP_NAME__
   
   # Run migrations
   npm run migrate
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

This will start both the backend (port 5000) and frontend (port 5173) servers.

## Project Structure

```
__APP_NAME__/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── scripts/            # Migration and seed scripts
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── database/               # Database files
│   └── migrations/         # SQL migration files
└── package.json            # Root package.json
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run all tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with sample data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Todos
- `GET /api/todos` - Get all todos for authenticated user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Development

### Backend Development

The backend uses Express.js with the following key features:
- JWT authentication
- PostgreSQL database with connection pooling
- Input validation with Joi
- Security middleware (Helmet, CORS, rate limiting)
- Error handling middleware

### Frontend Development

The frontend uses React with:
- Vite for fast development and building
- Ant Design for UI components
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

## Deployment

### Environment Variables

Make sure to set the following environment variables in production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker

The project includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
