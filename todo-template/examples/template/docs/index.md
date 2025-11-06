# Full-Stack Todo Application Template

A comprehensive, production-ready todo application template with React frontend, Node.js backend, MongoDB database, JWT authentication, Docker support, and AWS X-Ray integration.

## Overview

This template provides a complete full-stack application foundation that follows best practices for modern web development. It includes everything you need to build a production-ready todo application with authentication, database management, distributed tracing, and deployment configurations.

## Key Features

- **Modern Frontend**: React 18 with Vite, Ant Design, and Tailwind CSS
- **Robust Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **Security**: Built-in security middleware (Helmet, CORS, rate limiting)
- **Observability**: AWS X-Ray distributed tracing
- **Testing**: Jest for backend, Vitest for frontend
- **Docker Support**: Containerized deployment with Docker Compose
- **CI/CD Ready**: Production-ready deployment configuration

## Quick Start

1. Use this template in Backstage to create a new project
2. Fill in the application name and description
3. Choose your repository location
4. Start developing!

For detailed setup instructions, see the [Getting Started Guide](getting-started.md).

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks and context
- **Vite**: Fast build tool and development server
- **Ant Design**: Enterprise-grade UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Joi**: Schema validation library
- **AWS X-Ray**: Distributed tracing and monitoring

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Project Structure

```
my-todo-app/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database and AWS configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── scripts/            # Migration and seed scripts
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── docker-compose.yml      # Docker configuration
└── package.json            # Root package.json
```

## Documentation

- [Getting Started](getting-started.md) - Setup and installation guide
- [Architecture](architecture.md) - System architecture and design
- [Features](features.md) - Detailed feature documentation
- [API Reference](api-reference.md) - API endpoints and usage
- [Deployment](deployment.md) - Deployment instructions
- [Contributing](contributing.md) - Contribution guidelines

## Support

For issues, questions, or contributions, please refer to the repository or contact the template maintainers.

