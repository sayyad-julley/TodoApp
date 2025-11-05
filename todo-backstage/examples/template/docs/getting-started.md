# Getting Started

This guide will help you set up and run the Full-Stack Todo Application Template.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **PostgreSQL** 12 or higher
- **npm** or **yarn** package manager
- **Git** for version control

## Installation Steps

### 1. Install Dependencies

Navigate to your project directory and install all dependencies:

```bash
npm install
```

This will install dependencies for both the frontend and backend.

### 2. Database Setup

#### Create PostgreSQL Database

```bash
createdb my-todo-app
```

Or using PostgreSQL command line:

```sql
CREATE DATABASE my_todo_app;
```

#### Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/my_todo_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Migrations

Set up the database schema:

```bash
npm run migrate
```

This will create the necessary tables (users, todos) in your database.

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
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
- Start the frontend development server on `http://localhost:5173`

### Individual Servers

You can also run servers individually:

```bash
# Start only the backend
npm run dev:backend

# Start only the frontend
npm run dev:frontend
```

## Verify Installation

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Todo application login page
3. Register a new account or use seeded credentials
4. Create, update, and delete todos to verify functionality

## Using Docker

If you prefer Docker, you can run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database
- Backend API server
- Frontend development server

All services will be available on their default ports.

## Next Steps

- Read the [Architecture](architecture.md) documentation to understand the system design
- Explore the [API Reference](api-reference.md) for available endpoints
- Check out [Features](features.md) for detailed feature documentation
- Review [Deployment](deployment.md) for production deployment instructions

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `backend/.env`
- Ensure the database exists: `psql -l`

### Port Already in Use

If ports 5000 or 5173 are already in use:

- Change `PORT` in `backend/.env` for backend
- Update Vite port in `frontend/vite.config.js` for frontend

### Module Not Found Errors

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## Getting Help

If you encounter issues:

1. Check the error logs in the terminal
2. Review the troubleshooting section above
3. Consult the [API Reference](api-reference.md) for endpoint details
4. Check the repository issues for known problems

