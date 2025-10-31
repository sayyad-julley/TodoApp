# Golden Path - World-Class Full-Stack Development

A meta-repository providing templates, scripts, and comprehensive guides for building production-ready full-stack applications with best practices, integrated tooling, and AWS-native infrastructure. This project includes **Backstage integration** for seamless software template management and project scaffolding.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Creating a New Project](#creating-a-new-project)
  - [Option 1: Using Backstage (Recommended)](#option-1-using-backstage-recommended)
  - [Option 2: Using the Script](#option-2-using-the-script)
- [Required API Keys and Environment Variables](#required-api-keys-and-environment-variables)
- [Available Templates](#available-templates)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Integrated Tools](#integrated-tools)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Support](#support)

---

## Overview

The Golden Path is a standardized development workflow designed to help teams build world-class full-stack applications efficiently. It provides:

- **Production-Ready Templates**: Pre-built project skeletons with best practices
- **Backstage Integration**: Software templates with Traycer AI plan generation
- **Automation Scripts**: Tools for scaffolding and setup
- **Comprehensive Guides**: Step-by-step instructions for AWS services and tools
- **Integrated Tooling**: Traycer, Mintlify, QA Wolf, CodeRabbit, and AWS services

## Features

- ✅ **Backstage Software Templates**: Create projects directly from Backstage UI
- ✅ **Traycer AI Integration**: Automatic implementation plan generation
- ✅ **Golden Path Compliance**: Ensures consistent project structure
- ✅ **Complete Stack**: React frontend, Node.js backend, PostgreSQL database
- ✅ **Dark/Light Mode**: Theme toggle with system preference detection and persistence
- ✅ **Security Built-In**: JWT authentication, rate limiting, security middleware
- ✅ **AWS-Native**: Ready for AWS deployment (ECS, RDS, CodePipeline)
- ✅ **Testing Setup**: Jest, Vitest, and E2E testing configured
- ✅ **CI/CD Ready**: Infrastructure and pipeline configurations included

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 12 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **Backstage** (Optional but recommended): For using software templates

### Required Software

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check PostgreSQL version
psql --version  # Should be >= 12.0

# Check Git version
git --version
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TodoApp-GoldenPath
```

### 2. Set Up Backstage (Optional)

If you want to use Backstage templates:

```bash
cd todo-backstage
yarn install
yarn tsc
yarn build:backend
```

### 3. Verify Installation

```bash
# Check script permissions
chmod +x create-todo-project.sh

# Verify template structure
ls -la golden-path/templates/fullstack-todo/
```

## Creating a New Project

You have two options to create a new project:

### Option 1: Using Backstage (Recommended)

This method provides a UI-based approach with automatic Traycer plan generation.

#### Step 1: Start Backstage

```bash
cd todo-backstage
yarn start
```

Backstage will be available at `http://localhost:3000`

#### Step 2: Access Software Templates

1. Navigate to **"Create Component"** in Backstage
2. Select **"Golden Path Fullstack Todo"** template
3. Fill in the required information:
   - **Project Name**: Lowercase with hyphens (e.g., `my-todo-app`)
   - **Description**: Brief description of your project
   - **Feature Type**: `feature`, `bugfix`, or `refactoring`
   - **Feature Description**: Detailed description for Traycer plan generation
   - **Repository Location**: GitHub repository URL

#### Step 3: Execute Template

The template will automatically:
1. ✅ Fetch the base golden path template
2. ✅ Generate a Traycer implementation plan
3. ✅ Create an implementation guide (`IMPLEMENTATION_GUIDE.md`)
4. ✅ Publish to your GitHub repository
5. ✅ Register the component in Backstage catalog

### Option 2: Using the Script

For local development without Backstage:

#### Step 1: Run the Script

```bash
./create-todo-project.sh -n "my-todo-app" \
  -d "A simple todo application" \
  -t "feature" \
  -f "Create a basic todo CRUD interface with user authentication"
```

#### Step 2: Script Options

```bash
Usage: ./create-todo-project.sh -n PROJECT_NAME [OPTIONS]

Options:
  -n PROJECT_NAME        Name of the project (required, lowercase with hyphens)
  -d DESCRIPTION         Description of the project
  -t FEATURE_TYPE        Type of feature (feature|bugfix|refactoring) [default: feature]
  -f FEATURE_DESCRIPTION Detailed description of the feature

Example:
  ./create-todo-project.sh -n my-todo-app \
    -d "A simple todo application" \
    -t feature \
    -f "Create a basic todo CRUD interface"
```

#### Step 3: Setup Generated Project

```bash
cd ../my-todo-app
npm install
cp backend/env.example backend/.env
# Edit backend/.env with your database credentials
npm run migrate
npm run dev
```

## Required API Keys and Environment Variables

### For Backstage Setup

If using Backstage templates, configure these environment variables:

#### Required

```bash
# GitHub Token (Required for repository creation)
export GITHUB_TOKEN=your-github-personal-access-token
```

**How to get GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Copy the token and set it as `GITHUB_TOKEN`

#### Optional (Traycer Integration)

```bash
# Traycer API Key (Optional - falls back to local generation if not set)
export TRAYCER_API_URL=https://api.traycer.ai  # Default URL
export TRAYCER_API_KEY=your-traycer-api-key-here
```

**Note**: If `TRAYCER_API_KEY` is not set, the template will generate plans locally using Traycer specs from `/golden-path/traycer/specs/`.

#### Backstage Configuration

The API keys are configured in `todo-backstage/app-config.yaml`:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

traycer:
  apiUrl: ${TRAYCER_API_URL:-https://api.traycer.ai}
  apiKey: ${TRAYCER_API_KEY:-}
```

### For Generated Projects

Each generated project requires these environment variables:

#### Backend Environment Variables

Create `backend/.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/my-todo-app
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my-todo-app
DB_USER=username
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here  # Generate a strong random string
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**How to generate JWT_SECRET:**
```bash
# Generate a secure random string
openssl rand -base64 32
```

## Available Templates

### fullstack-todo

A complete full-stack todo application template:

**Frontend:**
- React 18 with Vite
- Ant Design UI components with dark mode support
- Tailwind CSS for styling (class-based dark mode)
- React Router for navigation
- Axios for API calls
- Theme context with dark/light mode toggle
- System theme preference detection

**Backend:**
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Rate limiting and security middleware
- Input validation with Joi

**Database:**
- PostgreSQL with migrations
- User and Todo tables
- Proper indexes and constraints

**Features:**
- User registration and authentication
- CRUD operations for todos
- User-specific todo isolation
- Dark/Light mode toggle with persistent preference
- Security best practices
- Responsive design with mobile-first approach

## Project Structure

### This Repository Structure

```
TodoApp-GoldenPath/
├── create-todo-project.sh          # Local project generation script
├── golden-path/                     # Golden path templates and guides
│   ├── templates/
│   │   └── fullstack-todo/         # Template source files
│   │       ├── backend/
│   │       ├── frontend/
│   │       ├── database/
│   │       └── README.md
│   ├── docs/                       # Documentation
│   │   ├── GOLDEN_PATH.md
│   │   ├── guides/
│   │   └── overview.mdx
│   ├── traycer/                    # Traycer specifications
│   │   ├── specs/
│   │   └── templates/
│   ├── scripts/                    # Automation scripts
│   └── coderabbit/                 # CodeRabbit config
├── todo-backstage/                 # Backstage integration
│   ├── packages/
│   │   ├── app/                    # Frontend
│   │   └── backend/                # Backend with Traycer action
│   ├── examples/
│   │   └── template/
│   │       └── golden-path-todo/   # Backstage template
│   └── app-config.yaml            # Configuration
└── README.md                       # This file
```

### Generated Project Structure

```
my-todo-app/
├── backend/                        # Node.js backend
│   ├── src/
│   │   ├── config/                 # Database configuration
│   │   ├── middleware/             # Express middleware
│   │   └── routes/                 # API routes
│   ├── server.js                   # Main server file
│   ├── env.example                 # Environment variables template
│   └── package.json
├── frontend/                       # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/                       # Database migrations
│   └── migrations/
│       ├── 001_create_users_table.sql
│       └── 002_create_todos_table.sql
├── package.json                    # Root package.json
├── README.md                       # Project documentation
├── IMPLEMENTATION_GUIDE.md         # Traycer-generated guide
└── catalog-info.yaml               # Backstage catalog info
```

## User Interface Features

### Dark/Light Mode Toggle

The template includes a comprehensive dark/light mode implementation:

- **Theme Toggle Button**: Located in the header with sun/moon icons
- **System Preference Detection**: Automatically detects and applies system theme on first visit
- **Persistent Preference**: Saves theme choice to localStorage
- **Smooth Transitions**: Animated theme switching for better UX
- **Full Coverage**: All components and pages support both themes
- **Ant Design Integration**: Automatically switches between light and dark algorithms

**Usage:**
- Click the sun/moon icon in the header to toggle themes
- Your preference is automatically saved and restored on next visit
- The app respects your system's theme preference by default

**Implementation Details:**
- Theme context (`ThemeContext.jsx`) manages global theme state
- Tailwind CSS class-based dark mode enabled
- Ant Design theme algorithm switching
- All components styled with `dark:` utility classes

## Development Workflow

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/env.example backend/.env
# Edit backend/.env with your database credentials

# Create database
createdb my-todo-app

# Run migrations
npm run migrate

# Optionally seed database
npm run seed
```

### 2. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend  # Runs on http://localhost:3000
npm run dev:backend   # Runs on http://localhost:5000
```

### 3. Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build            # Build both for production
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Database
npm run migrate          # Run database migrations
npm run seed             # Seed database with sample data
```

### 4. API Endpoints

Once running, the API endpoints are available at `http://localhost:5000/api`:

**Authentication:**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

**Todos:**
- `GET /api/todos` - Get all todos for authenticated user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

**Health Check:**
- `GET /health` - Health check endpoint

## Integrated Tools

### Traycer - AI Development Assistant

AI-powered development workflows with predefined specifications:
- Feature development
- Bug fixing
- Code refactoring

**Location**: `/golden-path/traycer/specs/`  
**Integration**: Automatically generates implementation plans in Backstage templates

### Mintlify - Documentation

Beautiful, searchable documentation platform:
- API reference documentation
- Architecture guides
- Development workflows

**Location**: `/golden-path/docs/`

### QA Wolf - End-to-End Testing

E2E testing platform with Playwright:
- Automated browser testing
- Visual regression testing
- CI/CD integration

**Setup Guide**: `/golden-path/docs/guides/qa-wolf-testing.md`

### CodeRabbit - AI Code Review

Automated code review:
- Security vulnerability detection
- Performance optimization suggestions
- Code quality checks

**Location**: `/golden-path/coderabbit/config.yaml`

### AWS Services

Integrated AWS services for production-ready infrastructure:
- **CodePipeline**: CI/CD automation
- **CodeBuild**: Build and test execution
- **ECS**: Container orchestration
- **RDS**: Managed PostgreSQL database
- **S3**: Static asset storage
- **CloudFront**: Content delivery network
- **X-Ray**: Distributed tracing
- **GuardDuty**: Threat detection
- **Secrets Manager**: Secure credential storage

**Setup Guides**:
- [AWS Secrets Manager Setup](golden-path/docs/guides/setup-secrets-manager.md)
- [AWS X-Ray and GuardDuty Setup](golden-path/docs/guides/setup-xray-and-guardduty.md)
- [AWS CodeBuild and CodePipeline Setup](golden-path/docs/guides/setup-codebuild-pipeline.md)

## Documentation

### Main Documentation

- **[Golden Path Guide](golden-path/docs/GOLDEN_PATH.md)**: Comprehensive overview and getting started guide
- **[Overview](golden-path/docs/overview.mdx)**: Quick introduction to the Golden Path
- **[Traycer Integration](golden-path/docs/guides/traycer-integration.md)**: Complete Traycer integration guide
- **[Backstage Integration](TRAYCER_BACKSTAGE_INTEGRATION.md)**: Detailed Backstage setup guide

### Setup Guides

- [AWS Secrets Manager Setup](golden-path/docs/guides/setup-secrets-manager.md)
- [AWS X-Ray and GuardDuty Setup](golden-path/docs/guides/setup-xray-and-guardduty.md)
- [AWS CodeBuild and CodePipeline Setup](golden-path/docs/guides/setup-codebuild-pipeline.md)

### Tool Integration Guides

- [Traycer Integration](golden-path/docs/guides/traycer-integration.md)
- [Mintlify Documentation](golden-path/docs/guides/mintlify-documentation.md)
- [CodeRabbit Setup](golden-path/docs/guides/coderabbit-setup.md)
- [QA Wolf Testing](golden-path/docs/guides/qa-wolf-testing.md)

## Deployment

### Environment Variables for Production

Set the following environment variables in your production environment:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key  # Use a strong random string

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment

The template includes Docker configuration:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### AWS Deployment

Follow the setup guides for AWS infrastructure:
1. [AWS Secrets Manager Setup](golden-path/docs/guides/setup-secrets-manager.md)
2. [AWS CodePipeline Setup](golden-path/docs/guides/setup-codebuild-pipeline.md)

## Troubleshooting

### Common Issues

#### Backstage Template Not Appearing

**Problem**: Template not visible in Backstage UI

**Solution**:
1. Verify template is registered in `app-config.yaml`:
   ```yaml
   catalog:
     locations:
       - type: file
         target: ../../examples/template/golden-path-todo/template.yaml
   ```
2. Restart Backstage backend
3. Check backend logs for errors

#### GitHub Token Not Working

**Problem**: Repository creation fails

**Solution**:
1. Verify token has `repo` scope:
   ```bash
   echo $GITHUB_TOKEN
   ```
2. Check token permissions at GitHub Settings
3. Verify token is set in environment:
   ```bash
   export GITHUB_TOKEN=your-token
   ```

#### Traycer API Errors

**Problem**: Traycer plan generation fails

**Solution**:
1. Verify API key (if using API):
   ```bash
   echo $TRAYCER_API_KEY
   ```
2. Check API URL:
   ```bash
   echo $TRAYCER_API_URL
   ```
3. Note: Template falls back to local generation if API unavailable

#### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

**Solution**:
1. Verify PostgreSQL is running:
   ```bash
   pg_isready
   ```
2. Check database credentials in `backend/.env`
3. Ensure database exists:
   ```bash
   createdb my-todo-app
   ```

#### Port Already in Use

**Problem**: Port 3000 or 5000 already in use

**Solution**:
1. Change port in configuration:
   ```bash
   # Frontend: Edit vite.config.js
   # Backend: Edit PORT in backend/.env
   ```
2. Or kill the process using the port:
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Adding new templates
- Improving existing templates
- Contributing guides
- Updating Traycer specs
- Improving Backstage integration

## Support

- **Documentation**: See `/golden-path/docs/GOLDEN_PATH.md`
- **Backstage Integration**: See `TRAYCER_BACKSTAGE_INTEGRATION.md`
- **Issues**: Report issues on GitHub
- **Discussions**: Join discussions for questions and feedback

---

## Summary

### Quick Reference

**Create Project via Script:**
```bash
./create-todo-project.sh -n my-app -d "Description" -t feature
```

**Start Backstage:**
```bash
cd todo-backstage && yarn start
```

**Required API Keys:**
- `GITHUB_TOKEN` - Required for Backstage repository creation
- `TRAYCER_API_KEY` - Optional (falls back to local generation)

**Generated Project Setup:**
```bash
npm install
cp backend/env.example backend/.env
# Edit backend/.env
npm run migrate
npm run dev
```

---

**Status**: Active Development  
**Version**: 1.0.0  
**License**: MIT License - see [LICENSE](LICENSE) file for details
