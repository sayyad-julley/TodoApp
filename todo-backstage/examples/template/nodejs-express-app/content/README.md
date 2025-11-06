# {{ __APP_NAME__ }}

{{ description }}

## Overview

This is a modern Node.js/Express.js API application with the following features:

{{#if useTypeScript}}
- **TypeScript** - Type safety and better developer experience
{{/if}}
- **Express.js** - Fast, minimalist web framework
- **Security** - Helmet, CORS, rate limiting, and other security best practices
{{#if enableAuth}}
- **JWT Authentication** - Secure token-based authentication
{{/if}}
{{#if enableSwagger}}
- **API Documentation** - Auto-generated Swagger/OpenAPI documentation
{{/if}}
{{#if (ne databaseType 'none')}}
- **Database Integration** - {{ databaseType }} support with migrations and seeding
{{/if}}
- **Health Checks** - Built-in health check endpoints
- **Logging** - Structured logging with Morgan
- **Testing** - Jest testing framework with coverage reports
- **Docker Support** - Containerized deployment
- **Production Ready** - Environment configurations and best practices

## Getting Started

### Prerequisites

- Node.js {{ nodeVersion }} or higher
- npm or yarn
{{#if (eq databaseType 'mongodb')}}
- MongoDB
{{/if}}
{{#if (eq databaseType 'postgresql')}}
- PostgreSQL
{{/if}}
{{#if (eq databaseType 'mysql')}}
- MySQL
{{/if}}
{{#if (eq databaseType 'sqlite')}}
- SQLite (comes with Node.js)
{{/if}}

### Installation

```bash
# Clone the repository
git clone {{ repoUrl }}
cd {{ repoUrl | parseRepoUrl | pick('repo') }}

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Configuration

Edit the `.env` file with your specific settings:

{{#if (eq databaseType 'mongodb')}}
```env
MONGODB_URI=mongodb://localhost:27017/{{ __APP_NAME__ }}
```
{{/if}}
{{#if (eq databaseType 'postgresql')}}
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME={{ __APP_NAME__ }}
DB_USER=your_username
DB_PASSWORD=your_password
```
{{/if}}
{{#if enableAuth}}
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```
{{/if}}

### Database Setup

{{#if (ne databaseType 'none')}}
{{#if enableMigrations}}
```bash
# Run database migrations
npm run migrate
```
{{/if}}
{{#if enableSeeding}}
```bash
# Seed the database with sample data
npm run seed
```
{{/if}}
{{/if}}

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:{{ port }}`

## API Documentation

{{#if enableSwagger}}
Once the server is running, visit `http://localhost:{{ port }}/api-docs` to view the interactive Swagger documentation.
{{else}}
API endpoints are documented below:
{{/if}}

### Base Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /{{ apiVersion }}` - API information

### Authentication

{{#if enableAuth}}
- `POST /{{ apiVersion }}/auth/login` - User login
- `POST /{{ apiVersion }}/auth/register` - User registration
- `POST /{{ apiVersion }}/auth/refresh` - Refresh token

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
{{/if}}

### User Endpoints

- `GET /{{ apiVersion }}/users` - Get all users{{#if enableAuth}} (requires authentication){{/if}}
- `GET /{{ apiVersion }}/users/:id` - Get user by ID{{#if enableAuth}} (requires authentication){{/if}}

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── routes/              # API routes
│   ├── api.{{#if useTypeScript}}ts{{else}}js{{/if}}      # Main API routes
│   {{#if enableAuth}}├── auth.{{#if useTypeScript}}ts{{else}}js{{/if}}    # Authentication routes{{/if}}
├── middleware/          # Custom middleware
├── models/             # Database models
├── controllers/        # Route controllers
├── services/           # Business logic
├── utils/              # Utility functions
├── config/             # Configuration files
└── server.{{#if useTypeScript}}ts{{else}}js{{/if}}      # Main server file
```

{{#if enableDocker}}
## Docker Deployment

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or use Docker directly
docker build -t {{ __APP_NAME__ }} .
docker run -p {{ port }}:{{ port }} {{ __APP_NAME__ }}
```
{{/if}}

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `{{ port }}` |
{{#if enableAuth}}
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
{{/if}}
{{#if (eq databaseType 'mongodb')}}
| `MONGODB_URI` | MongoDB connection string | - |
{{/if}}
{{#if (eq databaseType 'postgresql')}}
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `{{ __APP_NAME__ }}` |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
{{/if}}

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
{{#if (ne databaseType 'none')}}
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
{{/if}}

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.