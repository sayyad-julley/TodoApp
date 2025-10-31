# Contributing to Golden Path

Thank you for your interest in contributing to the Golden Path! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Contributing New Templates

### Adding a Template

1. Create a new directory in `/golden-path/templates/` with your template name
2. Follow the structure of existing templates (see `/golden-path/templates/fullstack-todo/`)
3. Include all required files:
   - `README.md` - Template documentation
   - `package.json` - Root package.json
   - `.gitignore` - Git ignore patterns
   - Frontend and backend directories
   - AWS infrastructure configuration
   - Tests directory
   - Documentation

4. Run validation script:
   ```bash
   ./golden-path/scripts/validate-template.sh your-template-name
   ```

5. Update documentation:
   - Add template to `/golden-path/GOLDEN_PATH.md`
   - Update `/golden-path/docs/overview.mdx`
   - Add template-specific docs if needed

### Improving Existing Templates

1. Identify areas for improvement
2. Make changes following existing patterns
3. Ensure all tests pass
4. Update documentation if needed
5. Submit a pull request

## Contributing Guides

### Adding a New Guide

1. Create a new `.md` file in `/golden-path/guides/`
2. Follow the structure of existing guides
3. Include:
   - Purpose and overview
   - Prerequisites
   - Step-by-step instructions
   - Troubleshooting section
   - Additional resources

4. Update documentation navigation:
   - Add to `/golden-path/docs/mint.json`
   - Update `/golden-path/GOLDEN_PATH.md`

## Contributing Traycer Specs

### Updating Specifications

1. Edit spec files in `/golden-path/traycer/specs/`
2. Follow existing specification format
3. Include:
   - Workflow steps
   - Code examples
   - Reference files
   - Success criteria

4. Test specifications with Traycer
5. Update related documentation

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 13+
- Docker and Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/todoapp-golden-path.git
   cd todoapp-golden-path
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. **Start the database**
   ```bash
   docker-compose up postgres -d
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start the development servers**
   ```bash
   npm run dev
   ```

## Contributing Guidelines

### Branch Naming

Use descriptive branch names that indicate the type of change:

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

Examples:
- `feat(auth): add JWT refresh token support`
- `fix(api): resolve CORS configuration issue`
- `docs(readme): update installation instructions`
- `test(todos): add integration tests for CRUD operations`

### Pull Request Process

1. **Create a Pull Request**
   - Use a descriptive title
   - Reference any related issues
   - Provide a detailed description

2. **Ensure Quality**
   - All tests pass
   - Code follows style guidelines
   - Documentation is updated
   - No console.log statements in production code

3. **Review Process**
   - At least one approval required
   - Address all review comments
   - Keep PRs focused and atomic

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

### Feature Requests

For feature requests, please include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Alternative solutions considered

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer const over let, avoid var

### React

- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Use TypeScript for type safety
- Implement proper error boundaries
- Follow accessibility guidelines

### CSS

- Use Tailwind CSS utility classes
- Follow BEM methodology for custom CSS
- Use CSS custom properties for theming
- Ensure responsive design

### Backend

- Follow RESTful API conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation
- Use environment variables for configuration

## Validation Requirements

Before submitting, ensure:

1. **Template Validation**: Run validation script if adding/updating templates
   ```bash
   ./golden-path/scripts/validate-template.sh [template-name]
   ```

2. **Linting**: All code follows style guidelines
   ```bash
   npm run lint
   ```

3. **Documentation**: All documentation is updated and accurate

4. **Testing**: All tests pass (if applicable)

## Code Review Process

### CodeRabbit Integration

This project uses CodeRabbit for automated code review:

1. **Automated Review**: CodeRabbit automatically reviews PRs
2. **Address Comments**: Fix issues identified by CodeRabbit
3. **Human Review**: After CodeRabbit approval, request human review
4. **Merge**: Once approved, merge your changes

### Review Checklist

- [ ] Code follows project patterns
- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No placeholder values
- [ ] Security best practices followed

## Testing

### Template Testing

When adding or updating templates:

1. **Structure Validation**: Run `validate-template.sh`
2. **Functional Testing**: Ensure template works end-to-end
3. **Documentation Review**: Verify all documentation is accurate

### Guide Testing

When adding or updating guides:

1. **Follow Instructions**: Test the guide yourself
2. **Verify Commands**: Ensure all commands work
3. **Check Links**: Verify all links are correct
4. **Review Formatting**: Ensure formatting is consistent

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Include parameter and return type information
- Provide usage examples for complex functions
- Update README files when adding new features

### API Documentation

- Document all API endpoints
- Include request/response examples
- Specify authentication requirements
- Update OpenAPI/Swagger specs

### User Documentation

- Keep README files up to date
- Provide clear installation instructions
- Include troubleshooting guides
- Add screenshots for UI changes

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## Getting Help

- Check existing issues and discussions
- Join our community Discord/Slack
- Read the documentation
- Ask questions in GitHub Discussions

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## Documentation Requirements

### Mintlify Documentation

When updating documentation:

1. Follow MDX format
2. Update navigation in `mint.json`
3. Test locally with Mintlify CLI
4. Ensure all links work

### Code Documentation

- Add JSDoc comments for functions and classes
- Update README files when adding features
- Keep guides up to date

Thank you for contributing to Golden Path! 🚀
