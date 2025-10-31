# Golden Path - World-Class Full-Stack Development

## Purpose

The Golden Path is a standardized development workflow designed to help teams build world-class full-stack applications with best practices, integrated tooling, and production-ready infrastructure from day one. This meta-repository provides templates, scripts, and comprehensive guides to accelerate development while maintaining high code quality, security, and observability standards.

## Flow

### How Developers Use the Golden Path

1. **Clone a Template**: Choose a template from `/golden-path/templates/` that matches your project needs
2. **Run Setup Script**: Execute `./golden-path/scripts/create-new-app.sh` to scaffold a new project
3. **Configure AWS Services**: Follow guides in `/golden-path/guides/` to set up infrastructure
4. **Start Building**: Your project is ready with CI/CD, testing, monitoring, and documentation already configured

### Quick Start

```bash
# Clone the golden path repository
git clone <repository-url>
cd golden-path

# Create a new project from template
./golden-path/scripts/create-new-app.sh

# Follow the prompts to set up your project
# Then follow the setup guides for AWS services
```

## Who Uses It

- **Development Teams**: Standardize development workflows across projects
- **New Projects**: Rapidly bootstrap production-ready applications
- **Rapid Prototyping**: Quickly spin up full-stack applications with best practices
- **Enterprise Teams**: Ensure consistency, security, and observability from the start

## Architecture Philosophy

### Monorepo Structure

The golden path templates follow a monorepo structure with clear separation of concerns:
- Frontend application in `/frontend/`
- Backend API in `/backend/`
- Database migrations in `/database/`
- Infrastructure as Code in `/.aws/`
- End-to-end tests in `/tests/`

### AWS-Native

All templates are designed to run seamlessly on AWS:
- **Compute**: ECS (Fargate) or Lambda for serverless
- **Database**: RDS PostgreSQL with automated backups
- **Storage**: S3 for static assets, CloudFront for CDN
- **CI/CD**: CodePipeline with CodeBuild
- **Monitoring**: X-Ray for tracing, CloudWatch for logs and metrics
- **Security**: GuardDuty for threat detection, Secrets Manager for credentials

### Security-First

Security is built into every layer:
- Secrets management with AWS Secrets Manager
- JWT authentication with refresh tokens
- Rate limiting and CORS configuration
- Automated security scanning with CodeRabbit
- GuardDuty integration for threat detection
- Input validation and sanitization

### Observability-Built-In

Every template includes comprehensive observability:
- Distributed tracing with AWS X-Ray
- Structured logging with CloudWatch
- Performance monitoring and alerting
- Error tracking and reporting
- Health check endpoints

## Tool Integration Overview

### Traycer - AI Development Assistant

Traycer provides AI-assisted development workflows with predefined specifications:
- Feature development guidelines
- Bug fixing processes
- Code refactoring patterns
- Documentation generation

**Location**: `/golden-path/traycer/specs/`

### Mintlify - Documentation

Mintlify powers beautiful, searchable documentation:
- API reference documentation
- Architecture guides
- Development workflows
- Deployment instructions

**Location**: `/golden-path/docs/` (golden path docs) and `/golden-path/templates/<template>/docs/` (template-specific docs)

### QA Wolf - End-to-End Testing

QA Wolf enables comprehensive E2E testing:
- Playwright-based test automation
- CI/CD integration
- Visual regression testing
- Cross-browser testing

**Location**: `/golden-path/templates/<template>/tests/e2e/`

### CodeRabbit - AI Code Review

CodeRabbit provides automated code review:
- Security vulnerability detection
- Performance optimization suggestions
- Code quality checks
- Best practices enforcement

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

## Available Templates

### fullstack-todo

A complete full-stack todo application template featuring:
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Infrastructure**: Full AWS setup with ECS, RDS, CodePipeline
- **Testing**: Jest, React Testing Library, QA Wolf E2E
- **Documentation**: Mintlify docs with API reference

**Location**: `/golden-path/templates/fullstack-todo/`

More templates coming soon!

## Detailed Guides

For step-by-step instructions on setting up individual components:

- [AWS Secrets Manager Setup](guides/setup-secrets-manager.md)
- [AWS X-Ray and GuardDuty Setup](guides/setup-xray-and-guardduty.md)
- [CodeBuild and CodePipeline Setup](guides/setup-codebuild-pipeline.md)
- [Traycer Integration](guides/traycer-integration.md)
- [Mintlify Documentation](guides/mintlify-documentation.md)
- [CodeRabbit Setup](guides/coderabbit-setup.md)
- [QA Wolf Testing](guides/qa-wolf-testing.md)

## Contributing

Want to add a new template or improve existing ones? See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

This golden path repository is licensed under the MIT License - see [LICENSE](../LICENSE) file for details.
