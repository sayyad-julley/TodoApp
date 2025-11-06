# Contributing

Thank you for your interest in contributing to the Full-Stack Todo Application Template!

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details

### Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation
4. **Commit your changes**:
   ```bash
   git commit -m "Add: description of changes"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## Code Style

### JavaScript/TypeScript

- Use ESLint configuration
- Follow Prettier formatting
- Use meaningful variable names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript for type checking
- Extract reusable logic to custom hooks

### Backend Code

- Follow Express.js conventions
- Use async/await for async operations
- Handle errors properly
- Validate input data

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Aim for good test coverage
- Test edge cases and error scenarios
- Keep tests simple and readable

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Update README for new features
- Keep API documentation current

### Documentation Updates

When adding features:

1. Update relevant documentation files
2. Add examples if applicable
3. Update API reference
4. Update architecture diagrams if needed

## Pull Request Process

1. **Ensure tests pass**: All tests must pass
2. **Update documentation**: Keep docs current
3. **Follow commit message format**: Use conventional commits
4. **Request review**: Tag relevant reviewers
5. **Address feedback**: Make requested changes

## Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(auth): add password reset functionality
fix(api): correct validation error message
docs(readme): update installation instructions
```

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Provide clear descriptions
- Respond to review comments
- Update PR based on feedback

### For Reviewers

- Be constructive and respectful
- Focus on code quality
- Suggest improvements
- Approve when satisfied

## Development Setup

1. **Fork and clone**:
   ```bash
   git clone https://github.com/your-username/todo-template.git
   cd todo-template
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## Questions?

If you have questions:

- Check existing documentation
- Search existing issues
- Create a new issue with your question
- Contact maintainers

Thank you for contributing! 🎉

