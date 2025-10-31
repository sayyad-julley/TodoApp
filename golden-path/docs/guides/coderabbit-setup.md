# CodeRabbit Setup Guide

This guide covers setting up CodeRabbit AI code review for your golden path project.

## What is CodeRabbit?

CodeRabbit is an AI-powered code review tool that:
- Automatically reviews pull requests
- Provides security vulnerability detection
- Suggests performance optimizations
- Enforces coding standards
- Checks for best practices

## Benefits

- **Automated Reviews**: Get instant feedback on every PR
- **Security**: Detect vulnerabilities before they reach production
- **Quality**: Maintain consistent code quality
- **Learning**: Learn best practices through suggestions
- **Time Savings**: Reduce manual review time

## Installation

### GitHub App Installation

1. Go to [CodeRabbit GitHub App](https://github.com/apps/coderabbitai)
2. Click "Install"
3. Choose repositories:
   - **All repositories**: For organization-wide installation
   - **Select repositories**: For specific repositories only
4. Click "Install"

### Repository Configuration

CodeRabbit reads configuration from `.coderabbit.yml` or `coderabbit/config.yaml`:

**Location**: `/golden-path/coderabbit/config.yaml`

This file contains:
- General settings
- Code quality rules
- Language-specific settings
- File patterns
- Review focus areas

## Configuration

### Basic Configuration

```yaml
# CodeRabbit Configuration
general:
  enabled: true
  min_confidence: 0.7
  max_comments_per_file: 10

code_quality:
  security_checks: true
  performance_checks: true
  maintainability_checks: true
  accessibility_checks: true
```

### Language-Specific Settings

```yaml
languages:
  javascript:
    eslint_suggestions: true
    typescript_checks: false
  python:
    pep8_suggestions: true
  css:
    css_best_practices: true
```

### File Patterns

```yaml
patterns:
  include:
    - "**/*.js"
    - "**/*.jsx"
    - "**/*.ts"
    - "**/*.tsx"
  exclude:
    - "node_modules/**"
    - "dist/**"
    - "build/**"
```

## Customizing Review Rules

### Security Checks

Enable security checks:

```yaml
code_quality:
  security_checks: true
  # Check for:
  # - SQL injection vulnerabilities
  # - XSS vulnerabilities
  # - Insecure dependencies
  # - Hardcoded secrets
```

### Performance Checks

Enable performance suggestions:

```yaml
code_quality:
  performance_checks: true
  # Check for:
  # - Inefficient algorithms
  # - Unnecessary re-renders
  # - Missing memoization
  # - Large bundle sizes
```

### Custom Rules

Add custom rules:

```yaml
custom_rules:
  naming_conventions: true
  todo_comments: true
  console_logs: true
  hardcoded_values: true
```

## Pull Request Workflow

### Automatic Reviews

CodeRabbit automatically reviews:
- New pull requests
- Updated pull requests (when new commits are pushed)
- Dependabot PRs

### Review Comments

CodeRabbit adds comments for:
- Security issues
- Performance problems
- Code quality issues
- Best practice violations
- Suggestions for improvement

### Addressing Reviews

1. **Read Comments**: Review CodeRabbit's suggestions
2. **Apply Changes**: Make suggested improvements
3. **Push Updates**: Push changes to trigger re-review
4. **Resolve Comments**: Mark comments as resolved when addressed

## Integration with GitHub

### Pull Request Checks

CodeRabbit can be configured as a required check:

1. Go to repository Settings
2. Navigate to Branches
3. Add branch protection rule
4. Require "CodeRabbit Review" status check

### Review Status

CodeRabbit provides review status:
- ✅ **Approved**: No critical issues found
- ⚠️ **Needs Changes**: Issues found that should be addressed
- ❌ **Failed**: Critical issues found

## Best Practices

### Review Focus Areas

Configure focus areas:

```yaml
focus_areas:
  - "security"
  - "performance"
  - "maintainability"
  - "accessibility"
  - "code_style"
  - "documentation"
```

### Combining with Human Reviews

- Use CodeRabbit for initial automated review
- Human reviewers focus on business logic and architecture
- CodeRabbit catches issues human reviewers might miss

### Team-Specific Rules

Create team-specific configurations:

```yaml
team_rules:
  frontend:
    focus_areas:
      - "accessibility"
      - "performance"
      - "react_best_practices"
  backend:
    focus_areas:
      - "security"
      - "database_optimization"
      - "api_design"
```

## Understanding CodeRabbit Comments

### Comment Types

1. **Security**: Critical security issues
2. **Performance**: Performance optimization suggestions
3. **Quality**: Code quality improvements
4. **Style**: Code style suggestions
5. **Documentation**: Documentation improvements

### Comment Severity

- 🔴 **Critical**: Must fix before merging
- 🟡 **Warning**: Should fix, but not blocking
- 🔵 **Info**: Suggestion for improvement

### Example Comments

```javascript
// CodeRabbit: Security Warning
// Potential SQL injection vulnerability. Use parameterized queries.
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Should be:
const query = 'SELECT * FROM users WHERE id = $1';
```

## Configuration Reference

### Golden Path Configuration

The golden path includes a pre-configured CodeRabbit setup:

**Location**: `/golden-path/coderabbit/config.yaml`

This configuration:
- Enables all code quality checks
- Sets appropriate confidence thresholds
- Includes/excludes relevant file patterns
- Focuses on security, performance, and maintainability

## Troubleshooting

### CodeRabbit Not Reviewing PRs

1. Verify GitHub App is installed
2. Check repository is included in installation
3. Verify `.coderabbit.yml` or `coderabbit/config.yaml` exists
4. Check CodeRabbit dashboard for errors

### Too Many Comments

- Increase `min_confidence` threshold
- Add more files to `exclude` patterns
- Disable specific checks you don't need

### Missing Reviews

- Check CodeRabbit service status
- Verify GitHub App permissions
- Check repository settings

### False Positives

- Provide feedback to CodeRabbit team
- Adjust `min_confidence` threshold
- Exclude specific patterns

## Advanced Configuration

### Custom Prompts

Provide context to CodeRabbit:

```yaml
context:
  project_description: "Todo application with React frontend and Node.js backend"
  coding_standards: "Follow Airbnb JavaScript style guide"
  architecture: "RESTful API with JWT authentication"
```

### Review Thresholds

Customize review thresholds:

```yaml
general:
  min_confidence: 0.8  # Higher = fewer comments
  max_comments_per_file: 5  # Limit comments per file
  max_comments_per_review: 50  # Limit total comments
```

### Integration with CI/CD

CodeRabbit can fail CI builds:

1. Configure branch protection
2. Require CodeRabbit review
3. Set failure threshold

## Additional Resources

- [CodeRabbit Documentation](https://docs.coderabbit.ai)
- [GitHub App](https://github.com/apps/coderabbitai)
- [Configuration Reference](https://docs.coderabbit.ai/configuration)
- [Golden Path Config](../coderabbit/config.yaml)
