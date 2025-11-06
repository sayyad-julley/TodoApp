# Template Selector - Meta Template

A meta template that provides a unified interface to select and generate projects from one or multiple application templates:

1. **Full-Stack Todo Application** - Complete full-stack todo app
2. **React Application** - Frontend-only React app
3. **Node.js/Express API** - Backend-only API application

## Features

- **Multi-select capability**: Choose one or multiple templates in a single operation
- Single entry point for all templates
- Conditional parameter rendering based on selected templates
- Unified workflow for project creation
- Monorepo support: When multiple templates are selected, each is placed in its own directory
- Consistent user experience across all templates

## Usage

1. Select "Template Selector - Choose Your Application Type" in Backstage
2. Choose one or more template types from the multi-select dropdown
3. Fill in the project-specific parameters for your selected templates
4. Configure repository settings
5. Generate your project(s)!

## Directory Structure

When multiple templates are selected:
- **Full-Stack Todo**: Placed in the root directory (if selected)
- **React App**: Placed in `react-app/` directory
- **Node.js/Express API**: Placed in `api/` directory

This allows you to create a monorepo structure with multiple projects in a single repository.

## Template Types

### Full-Stack Todo Application
- React 18 frontend with TypeScript and Vite
- Node.js/Express backend with MongoDB
- JWT authentication and authorization
- Docker containerization
- AWS X-Ray distributed tracing (optional)
- Production-ready deployment configuration

### React Application
- Modern React with TypeScript
- Vite build tool
- React Router (optional)
- State management options (Zustand, Redux Toolkit, Context API)
- UI framework options (Ant Design, Material-UI, Chakra UI, Tailwind)
- CI/CD configuration
- Deployment targets (Vercel, Netlify, AWS S3)

### Node.js/Express API Application
- Node.js/Express with TypeScript
- Authentication middleware (JWT)
- CORS and rate limiting
- Swagger API documentation
- Database integration (MongoDB, PostgreSQL, MySQL, SQLite)
- Database migrations and seeding
- Docker support
- Deployment targets (AWS ECS, Heroku, DigitalOcean)

## Parameters

The meta template dynamically shows relevant parameters based on the selected template type. Only parameters applicable to your chosen template will be displayed.

## Technical Details

This meta template uses Backstage's conditional step execution (`if` conditions) to selectively run the appropriate template based on user selection. This provides a cleaner user experience while maintaining the flexibility of individual templates.

