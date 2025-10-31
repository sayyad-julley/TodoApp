# QA Wolf E2E Tests

This directory contains end-to-end tests for the Todo App using QA Wolf methodology with Playwright.

## What is QA Wolf?

QA Wolf is a testing platform that makes it easy to create, run, and maintain end-to-end tests. This project uses QA Wolf's approach and patterns with Playwright for reliable, maintainable tests.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run install-browsers
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### View test report
```bash
npm run test:report
```

## Recording Tests with QA Wolf Approach

### Creating New Tests

1. Make sure your app is running at `http://localhost:5173`

2. Start the QA Wolf-style test recorder:
```bash
npm run test:record
```

This will:
- Open Playwright Codegen with a browser
- Navigate to `http://localhost:5173`
- Show a code generator panel on the side
- Generate Playwright test code as you interact with your app
- Save the generated code directly to the `tests/` directory

3. Interact with your app (click, type, navigate, etc.)

4. The code will be generated in real-time. When done, you can:
   - Save the generated code to a new test file
   - Copy it and paste into an existing test file
   - Edit it directly in the generated file

5. Close the recorder when done

### Alternative: Use QA Wolf Create Command

You can also use the QA Wolf-style create command:
```bash
npm run qawolf:create
```

## Test Configuration

Tests are configured to run against `http://localhost:5173` by default. You can change this by setting the `BASE_URL` environment variable:

```bash
BASE_URL=http://localhost:3000 npm test
```

## Test Structure

Tests follow QA Wolf patterns and are stored in the `tests/` directory:

- `tests/auth.test.js` - Authentication tests (login, register)
- `tests/todos.test.js` - Todo list functionality tests
- `tests/test1.spec.js` - Example recorded test
- `tests/example.spec.js` - Template for new tests

## Writing Tests

### QA Wolf Test Pattern

Tests use Playwright's test framework with QA Wolf best practices:

```javascript
const { test, expect } = require('@playwright/test');

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="emailOrUsername"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL('/');
});
```

### QA Wolf Best Practices

1. **Use semantic selectors**: Prefer `data-testid` attributes or role-based selectors over CSS classes
2. **Wait for elements**: Use `await expect(page.locator(...))` instead of hard waits
3. **Isolate tests**: Each test should be independent - use `beforeEach` for setup
4. **Use helpers**: Create reusable functions for common actions (login, etc.)
5. **Record then refine**: Start with recorded tests, then add assertions and clean up

### Recording Best Practices

- **Name your test clearly**: Use descriptive names like `login-flow.spec.js`
- **Complete user flows**: Record complete user journeys, not just individual actions
- **Add assertions**: After recording, add `expect()` statements to verify expected behavior
- **Clean up**: Remove unnecessary waits or duplicate actions
- **Use data attributes**: Add `data-testid` attributes to your components for more reliable selectors

## Troubleshooting

### Tests failing because app is not running
Make sure your frontend is running at `http://localhost:5173` before running tests.

### Element not found
- Check that selectors match your actual UI
- Use Playwright Inspector (`npm run test:debug`) to debug
- Consider adding `data-testid` attributes to your components for easier testing

### Tests timing out
- Increase timeout in test: `test.setTimeout(60000)`
- Check that your app is responding correctly
- Verify network requests are completing

### Recorded tests are flaky
- Add explicit waits with `expect()` instead of `waitForTimeout()`
- Use more specific selectors (role-based or data-testid)
- Wait for navigation explicitly: `await page.waitForURL('/expected-path')`

## CI/CD Integration

Tests can be integrated into CI/CD pipelines. The configuration already includes:
- Retry logic for CI
- Screenshot on failure
- Video recording on failure
- HTML report generation

Run tests in CI:
```bash
CI=true npm test
```

## QA Wolf Configuration

QA Wolf configuration is stored in `.qawolf/config.json`. This file defines:
- Browser to use for recording
- Test and code paths
- Base host URL
- Other QA Wolf settings

## Resources

- [Playwright Documentation](https://playwright.dev)
- [QA Wolf Documentation](https://docs.qawolf.com)
- [QA Wolf Platform](https://qawolf.com)
- [Test Examples](./tests/)
