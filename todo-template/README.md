# Backstage Todo Application Template

This is a Backstage application template for generating full-stack todo applications with modern web technologies.

## Overview

This Backstage instance includes a comprehensive software template that generates production-ready full-stack todo applications with:

- ✅ React 18 frontend with TypeScript and Vite
- ✅ Node.js/Express backend with MongoDB
- ✅ JWT authentication and authorization
- ✅ Docker containerization support
- ✅ AWS X-Ray distributed tracing (optional)
- ✅ Comprehensive testing setup
- ✅ Development automation scripts
- ✅ Production-ready deployment configuration
- ✅ Dark/light mode support
- ✅ Responsive design
- ✅ Advanced todo features (subtasks, categories, priorities)

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Docker (optional, for containerization)
- MongoDB (optional, for local development)

### Installation

1. Install dependencies:

```sh
yarn install
```

2. Start the application:

```sh
yarn start
```

This will start both the frontend and backend services. The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:7007`.

### Configuration

Local configuration overrides can be added to `app-config.local.yaml`. This is useful for:
- Adding secrets and API keys
- Overriding database connections
- Configuring authentication providers
- Setting up integrations

## Software Templates

This Backstage instance includes a comprehensive **Full-Stack Todo Application Template** that can be accessed via the "Create..." page in the UI.

### Template Features

The template uses built-in Backstage scaffolder actions:
- `fetch:template` - For templating files with dynamic values
- `fetch:plain` - For copying static files
- `publish:github` - For publishing to GitHub repositories

### Template Parameters

When creating a new project from the template, you can configure:

- **Project Name** - The name of your application
- **Description** - Project description
- **Owner** - GitHub username or organization
- **Database Type** - MongoDB or PostgreSQL
- **Node.js Version** - Node.js version to use
- **Port Configuration** - Backend and frontend ports
- **Features** - Optional features (Auth, Docker, AWS X-Ray)
- **License** - Project license type

## Development

### Backend Development

The backend is located in `packages/backend`. See [packages/backend/README.md](./packages/backend/README.md) for more details.

### Frontend Development

The frontend is located in `packages/app`. It's a React application built with Material-UI and Backstage components.

### Adding Custom Actions

To add custom scaffolder actions, you can create backend modules in `packages/backend/src/plugins/`. However, this template uses only built-in Backstage actions for maximum compatibility.

## Documentation

- [Backstage Documentation](https://backstage.io/docs)
- [Software Templates Guide](https://backstage.io/docs/features/software-templates/)
- [Backend Development](https://backstage.io/docs/backend-system/)

## License

This project is licensed under the Apache 2.0 License.
