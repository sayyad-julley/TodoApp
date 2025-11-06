# Getting Started

This guide will help you set up and run the Full-Stack Todo Application Template.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **MongoDB** 4.4 or higher (or use Docker)
- **npm** or **yarn** package manager
- **Git** for version control
- **Docker** (optional, for containerized deployment)

## Installation Steps

### 1. Install Dependencies

Navigate to your project directory and install all dependencies:

```bash
npm install
```

This will install dependencies for both the frontend and backend.

### 2. Database Setup

#### Using Docker (Recommended)

The easiest way to set up MongoDB is using Docker:

```bash
docker-compose up -d mongodb
```

This will start a MongoDB container on port 27017.

#### Using Local MongoDB

If you have MongoDB installed locally, ensure it's running:

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

### 3. Configure Environment Variables

#### Backend Configuration

Copy the example environment file and configure it:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5143

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/my_todo_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS X-Ray (Optional)
ENABLE_XRAY=false
SERVICE_NAME=todo-api
AWS_XRAY_DAEMON_ADDRESS=localhost:2000
```

#### Frontend Configuration

Copy the example environment file:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_PORT=5143
```

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
cd backend
npm run seed
```

## Running the Application

### Development Mode

Start both frontend and backend servers in development mode:

```bash
npm run dev
```

This will:
- Start the backend server on `http://localhost:5000`
- Start the frontend development server on `http://localhost:5143`

### Individual Servers

You can also run servers individually:

```bash
# Start only the backend
npm run dev:backend

# Start only the frontend
npm run dev:frontend
```

## Verify Installation

1. Open your browser and navigate to `http://localhost:5143`
2. You should see the Todo application login page
3. Register a new account or use seeded credentials
4. Create, update, and delete todos to verify functionality

## Using Docker

If you prefer Docker, you can run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- MongoDB database
- Backend API server
- Frontend development server

All services will be available on their default ports.

## AWS X-Ray Setup (Optional)

If you want to enable AWS X-Ray distributed tracing:

1. Start the X-Ray daemon:
```bash
docker run -d -p 2000:2000 --name xray-daemon amazon/aws-xray-daemon
```

2. Update `backend/.env`:
```env
ENABLE_XRAY=true
AWS_XRAY_DAEMON_ADDRESS=localhost:2000
```

3. Restart the backend server

## Next Steps

- Read the [Architecture](architecture.md) documentation to understand the system design
- Explore the [API Reference](api-reference.md) for available endpoints
- Check out [Features](features.md) for detailed feature documentation
- Review [Deployment](deployment.md) for production deployment instructions

## Troubleshooting

### Database Connection Issues

- Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check database connection string in `backend/.env`
- Ensure MongoDB is accessible on the configured port

### Port Already in Use

If ports 5000 or 5143 are already in use:

- Change `PORT` in `backend/.env` for backend
- Update `VITE_PORT` in `frontend/.env` for frontend

### Module Not Found Errors

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

### Docker Issues

- Ensure Docker is running: `docker ps`
- Check Docker Compose version: `docker-compose --version`
- Verify container logs: `docker-compose logs`

## Getting Help

If you encounter issues:

1. Check the error logs in the terminal
2. Review the troubleshooting section above
3. Consult the [API Reference](api-reference.md) for endpoint details
4. Check the repository issues for known problems

