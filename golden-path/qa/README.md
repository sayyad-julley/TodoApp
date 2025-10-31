# QA Wolf Testing

This directory contains QA Wolf E2E testing configuration and examples for the golden path templates.

## Purpose

QA Wolf provides end-to-end testing capabilities using Playwright, enabling:
- Automated browser testing
- User journey validation
- Visual regression testing
- Cross-browser testing
- CI/CD integration

## Configuration

Playwright configuration is located in templates:

**Location**: `/golden-path/templates/fullstack-todo/tests/e2e/playwright.config.js`

This configuration includes:
- Test directory structure
- Browser configurations (Chrome, Firefox, Safari)
- Mobile viewport testing
- Screenshot and video capture on failure
- Global setup and teardown hooks

## Integration with Golden Path

QA Wolf tests are integrated into:

1. **Local Development**: Run tests during development
   ```bash
   cd tests/e2e
   npm test
   ```

2. **CI/CD Pipeline**: Automated testing in GitHub Actions and AWS CodePipeline
   - See `.github/workflows/ci.yml` for GitHub Actions integration
   - See `.aws/buildspec.yml` for CodePipeline integration

3. **Code Quality**: Tests are required before merging PRs

## Writing E2E Tests

### Test Structure

Tests follow this structure:
- `tests/e2e/auth.test.js` - Authentication flows
- `tests/e2e/todos.test.js` - Todo CRUD operations
- `tests/e2e/setup/` - Global setup and teardown

### Example Test

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Todos', () => {
  test('user can create a todo', async ({ page }) => {
    await page.goto('/todos');
    await page.fill('[name="title"]', 'New Todo');
    await page.click('button:has-text("Add Todo")');
    await expect(page.locator('text=New Todo')).toBeVisible();
  });
});
```

## Running Tests

### Locally

```bash
cd tests/e2e
npm install
npm test
```

### Debug Mode

```bash
npx playwright test --debug
```

### Specific Browser

```bash
npx playwright test --project=chromium
```

## Best Practices

- **Use Semantic Selectors**: Prefer `data-testid` attributes over CSS classes
- **Wait for Elements**: Use `await expect()` instead of `await page.waitForTimeout()`
- **Isolate Tests**: Each test should be independent
- **Clean Setup**: Use `beforeEach` and `afterEach` hooks
- **Group Related Tests**: Use `test.describe()` blocks

## Configuration Reference

See the template-specific Playwright configuration:

**Location**: `/golden-path/templates/fullstack-todo/tests/e2e/playwright.config.js`

## Documentation

For detailed QA Wolf setup and usage, see:

- [QA Wolf Testing Guide](../guides/qa-wolf-testing.md)
- [Playwright Documentation](https://playwright.dev)
- [QA Wolf Documentation](https://docs.qawolf.com)
