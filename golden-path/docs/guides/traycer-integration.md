# Traycer Integration Guide

This guide explains how to integrate and use Traycer AI development assistant with the golden path templates.

## What is Traycer?

Traycer is an AI-powered development assistant that provides guided workflows for common development tasks. It helps developers:
- Follow standardized development processes
- Maintain code quality and consistency
- Accelerate feature development
- Simplify bug fixing and refactoring

## Benefits

- **Standardized Workflows**: Consistent development processes across teams
- **AI Assistance**: Context-aware suggestions and code generation
- **Quality Assurance**: Built-in checks for best practices
- **Documentation**: Automatic documentation generation
- **Code Review Integration**: Works seamlessly with CodeRabbit

## Installation

### Prerequisites

- Node.js 18+ installed
- Git configured
- Your favorite code editor (VS Code recommended)

### Installing Traycer

```bash
# Install Traycer CLI globally
npm install -g @traycer/cli

# Or use npx
npx @traycer/cli init
```

### Configuration

Traycer reads specifications from the `traycer/specs` directory:

**Location**: `/golden-path/traycer/specs/`

## Using Traycer Specs

### Feature Development Workflow

Use the feature development specification for adding new features:

**Location**: `/golden-path/traycer/specs/feature-development.md`

```bash
traycer feature --spec golden-path/traycer/specs/feature-development.md --name "Add user profile page"
```

The workflow will guide you through:
1. Understanding existing codebase structure
2. Creating new routes/endpoints
3. Building frontend components
4. Writing tests
5. Updating documentation

**Key References:**
- Backend routes: `/golden-path/templates/fullstack-todo/backend/src/routes/`
- Frontend components: `/golden-path/templates/fullstack-todo/frontend/src/components/`

### Bug Fixing Workflow

Use the bug fix specification for debugging and fixing issues:

**Location**: `/golden-path/traycer/specs/bug-fix.md`

```bash
traycer fix --spec golden-path/traycer/specs/bug-fix.md --issue "Login fails with 500 error"
```

The workflow includes:
1. Root cause analysis
2. Error log investigation
3. Test case creation for reproduction
4. Fix implementation
5. Regression testing

**Key References:**
- Error handling: `/golden-path/templates/fullstack-todo/backend/src/middleware/errorHandler.js`

### Refactoring Workflow

Use the refactoring specification for improving code quality:

**Location**: `/golden-path/traycer/specs/refactoring.md`

```bash
traycer refactor --spec golden-path/traycer/specs/refactoring.md --target "todoController.js"
```

The workflow covers:
1. Code smell detection
2. Refactoring pattern selection
3. Test verification
4. Performance optimization

**Key References:**
- Controllers: `/golden-path/templates/fullstack-todo/backend/src/controllers/`
- Components: `/golden-path/templates/fullstack-todo/frontend/src/components/`

## Prompting Best Practices

### Context-Rich Prompts

Provide Traycer with comprehensive context:

```bash
# Good: Includes context about the feature
traycer feature --name "Add task filtering" --context "Users need to filter tasks by status (active, completed, all)"

# Bad: Too vague
traycer feature --name "Add filtering"
```

### Reference Existing Code

Point Traycer to similar implementations:

```bash
traycer feature --name "Add task categories" --reference "backend/src/routes/todos.js" --similar-to "existing todo routes"
```

### Specify Requirements

Clearly state requirements and constraints:

```bash
traycer feature --name "Add search" \
  --requirements "Search by title, description, and tags" \
  --constraints "Must work with existing filter system" \
  --performance "Should handle 10k+ tasks"
```

## Common Traycer Commands

### Feature Development

```bash
# Start a new feature
traycer feature --spec specs/feature-development.md --name "Feature name"

# Generate API endpoint
traycer generate --type endpoint --route "/api/users" --method GET

# Generate React component
traycer generate --type component --name UserProfile --props "userId, onUpdate"
```

### Bug Fixing

```bash
# Analyze error logs
traycer analyze --logs "error.log" --spec specs/bug-fix.md

# Generate test case
traycer test --type reproduction --issue "Issue description"

# Apply fix
traycer fix --target "problematic-file.js" --spec specs/bug-fix.md
```

### Refactoring

```bash
# Detect code smells
traycer detect --target "file.js" --spec specs/refactoring.md

# Suggest refactoring
traycer suggest --target "file.js" --type "extract-function"

# Apply refactoring
traycer refactor --target "file.js" --pattern "extract-component"
```

## Integration with CodeRabbit

Traycer works seamlessly with CodeRabbit for code review:

1. **Traycer generates code** using specifications
2. **CodeRabbit reviews** the generated code
3. **Feedback loop** improves future generations

### Workflow

```bash
# 1. Generate feature with Traycer
traycer feature --name "Add authentication"

# 2. Commit changes
git add .
git commit -m "feat: add authentication"

# 3. Push to GitHub
git push origin feature/add-authentication

# 4. CodeRabbit automatically reviews the PR
# 5. Address feedback and regenerate if needed
traycer improve --feedback "CodeRabbit feedback" --target "auth.js"
```

## Examples

### Example 1: Adding a New API Endpoint

```bash
traycer feature --spec specs/feature-development.md \
  --name "Add user profile endpoint" \
  --type endpoint \
  --route "/api/users/:id" \
  --method GET \
  --reference "backend/src/routes/todos.js"
```

Traycer will:
- Create route handler
- Add validation middleware
- Write tests
- Update API documentation

### Example 2: Fixing a Bug

```bash
traycer fix --spec specs/bug-fix.md \
  --issue "Users can't delete completed tasks" \
  --logs "error.log" \
  --target "backend/src/controllers/todoController.js"
```

Traycer will:
- Analyze error logs
- Identify root cause
- Create reproduction test
- Implement fix
- Verify regression tests pass

### Example 3: Refactoring Component

```bash
traycer refactor --spec specs/refactoring.md \
  --target "frontend/src/components/TodoList.jsx" \
  --pattern "extract-custom-hook" \
  --goal "Extract data fetching logic"
```

Traycer will:
- Identify code to extract
- Create custom hook
- Update component
- Verify tests still pass

## Best Practices

1. **Use Specifications**: Always use the provided specs for consistency
2. **Provide Context**: Give Traycer as much context as possible
3. **Review Generated Code**: Always review and test Traycer-generated code
4. **Iterate**: Use feedback to improve future generations
5. **Stay Updated**: Keep Traycer specs updated with team standards
6. **Combine with Code Review**: Use CodeRabbit to catch issues early
7. **Document Learnings**: Update specs based on what works well

## Troubleshooting

### Traycer Not Finding Specs

```bash
# Verify spec path
ls golden-path/traycer/specs/

# Use absolute path if needed
traycer feature --spec /full/path/to/specs/feature-development.md
```

### Generated Code Doesn't Match Style

Update the specification file to include your team's coding standards, or use the `.eslintrc.json` and `.prettierrc.json` configurations.

### Performance Issues

- Use `--limit` flag to restrict scope
- Specify exact files instead of scanning entire codebase
- Cache Traycer responses for similar requests

## Customizing Specifications

You can customize Traycer specs to match your team's needs:

1. Edit spec files in `/golden-path/traycer/specs/`
2. Add team-specific guidelines
3. Update code examples
4. Add custom validation rules

## Additional Resources

- [Traycer Documentation](https://docs.traycer.ai)
- [Feature Development Spec](traycer/specs/feature-development.md)
- [Bug Fix Spec](traycer/specs/bug-fix.md)
- [Refactoring Spec](traycer/specs/refactoring.md)
- [CodeRabbit Integration Guide](guides/coderabbit-setup.md)
