# QA Wolf Testing Guide

This guide covers setting up and using QA Wolf for end-to-end testing in your golden path project.

## What is QA Wolf?

QA Wolf is an end-to-end testing platform that:
- Records browser interactions
- Generates Playwright test code
- Runs tests in CI/CD pipelines
- Provides visual regression testing
- Supports cross-browser testing

## Benefits

- **Easy Test Creation**: Record tests by interacting with your app
- **Reliable Tests**: Playwright-based, reliable and fast
- **CI/CD Integration**: Run tests automatically in pipelines
- **Visual Testing**: Catch visual regressions automatically
- **Cross-Browser**: Test across Chrome, Firefox, Safari, Edge

## Installation

### QA Wolf CLI

```bash
npm install -g @qawolf/cli
```

### Playwright Installation

QA Wolf uses Playwright. Install it:

```bash
npm install -D @playwright/test playwright
npx playwright install
```

## Configuration

### Playwright Configuration

QA Wolf tests use Playwright configuration:

**Location**: `/golden-path/templates/fullstack-todo/tests/e2e/playwright.config.js`

```javascript
module.exports = {
  testDir: './tests',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
};
```

## Writing E2E Tests

### Test Structure

E2E tests follow this structure:

**Location**: `/golden-path/templates/fullstack-todo/tests/e2e/auth.test.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/todos');
  });
});
```

### Todo Tests Example

**Location**: `/golden-path/templates/fullstack-todo/tests/e2e/todos.test.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Todos', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('user can create a todo', async ({ page }) => {
    await page.goto('/todos');
    await page.fill('[name="title"]', 'New Todo');
    await page.click('button:has-text("Add Todo")');
    await expect(page.locator('text=New Todo')).toBeVisible();
  });

  test('user can complete a todo', async ({ page }) => {
    await page.goto('/todos');
    await page.click('.todo-item:first-child input[type="checkbox"]');
    await expect(page.locator('.todo-item:first-child')).toHaveClass(/completed/);
  });
});
```

## Running Tests

### Local Testing

Run tests locally:

```bash
cd tests/e2e
npm test
```

### Specific Test File

```bash
npx playwright test auth.test.js
```

### Headed Mode

Run tests with browser visible:

```bash
npx playwright test --headed
```

### Debug Mode

Debug tests:

```bash
npx playwright test --debug
```

## CI/CD Integration

### GitHub Actions

Add E2E tests to CI pipeline:

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd tests/e2e
          npm install
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: |
          cd tests/e2e
          npm test
        env:
          BASE_URL: ${{ secrets.E2E_BASE_URL }}
```

### CodePipeline Integration

Add E2E test stage to CodePipeline:

```yaml
- Name: E2ETests
  Actions:
    - Name: RunE2ETests
      ActionTypeId:
        Category: Test
        Owner: AWS
        Provider: CodeBuild
        Version: '1'
      Configuration:
        ProjectName: todoapp-e2e-tests
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `test.describe()` blocks
2. **Use Helpers**: Create reusable helper functions
3. **Clean Setup**: Use `beforeEach` and `afterEach` hooks
4. **Isolated Tests**: Each test should be independent

### Selectors

Prefer stable selectors:

```javascript
// ❌ Bad: Fragile selectors
await page.click('.button-123');

// ✅ Good: Semantic selectors
await page.click('button[aria-label="Submit"]');
await page.click('[data-testid="submit-button"]');
```

### Waiting

Use proper waiting strategies:

```javascript
// ❌ Bad: Hard-coded waits
await page.waitForTimeout(5000);

// ✅ Good: Wait for elements
await page.waitForSelector('.todo-list');
await expect(page.locator('.todo-item')).toBeVisible();
```

### Test Data

Use test fixtures:

```javascript
const { test } = require('@playwright/test');

test.use({
  storageState: 'auth-state.json',
});
```

## Visual Regression Testing

### Screenshot Comparison

Capture and compare screenshots:

```javascript
test('todo list renders correctly', async ({ page }) => {
  await page.goto('/todos');
  await expect(page).toHaveScreenshot('todo-list.png');
});
```

### Visual Testing Best Practices

- Use consistent viewport sizes
- Disable animations for consistency
- Hide dynamic content (timestamps, etc.)
- Compare critical UI components

## Debugging Failed Tests

### Screenshots

Playwright automatically captures screenshots on failure:

```javascript
// Screenshots saved to test-results/
```

### Videos

Record videos of test runs:

```javascript
use: {
  video: 'retain-on-failure',
}
```

### Trace Files

Generate trace files:

```bash
npx playwright test --trace on
```

View traces:

```bash
npx playwright show-trace trace.zip
```

### Console Logs

Capture console logs:

```javascript
page.on('console', msg => console.log(msg.text()));
```

## Performance Testing

### Load Testing

Test application performance:

```javascript
test('page loads quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/todos');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```

### Network Conditions

Test under different network conditions:

```javascript
test.use({
  contextOptions: {
    ...devices['iPhone 12'],
  },
});

// Simulate slow network
await page.route('**/*', route => {
  setTimeout(() => route.continue(), 1000);
});
```

## Mobile Testing

Test mobile responsiveness:

```javascript
test.use({
  ...devices['iPhone 12'],
});

test('mobile layout works', async ({ page }) => {
  await page.goto('/todos');
  await expect(page.locator('.mobile-menu')).toBeVisible();
});
```

## Cross-Browser Testing

Configure multiple browsers:

```javascript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];
```

## Common Patterns

### Authentication Helper

```javascript
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/todos');
}
```

### Wait for API

```javascript
await page.waitForResponse(response => 
  response.url().includes('/api/todos') && response.status() === 200
);
```

### Form Submission

```javascript
await page.fill('[name="title"]', 'New Todo');
await page.press('[name="title"]', 'Enter');
// Or
await page.click('button[type="submit"]');
```

## Troubleshooting

### Tests Flaking

- Increase timeouts for slow operations
- Use proper waiting strategies
- Add retry logic for flaky operations
- Check for race conditions

### Element Not Found

- Verify selector is correct
- Check if element is visible
- Wait for element to appear
- Check for dynamic content loading

### Tests Too Slow

- Run tests in parallel
- Use test sharding
- Optimize selectors
- Reduce unnecessary waits

## Additional Resources

- [QA Wolf Documentation](https://docs.qawolf.com)
- [Playwright Documentation](https://playwright.dev)
- [Test Examples](../templates/fullstack-todo/tests/e2e/)
- [Playwright Config](../templates/fullstack-todo/tests/e2e/playwright.config.js)
