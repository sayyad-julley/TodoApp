# Quick Start Guide - Recording Tests with QA Wolf

## Prerequisites

✅ Make sure your Todo App is running at `http://localhost:5173`

## Step 1: Start Recording

Open a terminal in the `QAWolf-tests` directory and run:

```bash
npm run test:record
```

This will open:
- A browser window (Chromium)
- Playwright Codegen with code generator panel
- Navigation to `http://localhost:5173`

## Step 2: Record Your Test

1. **Interact with your app** in the browser window:
   - Navigate to pages
   - Click buttons
   - Fill forms
   - Complete user flows

2. **Watch the code generate** in the Codegen panel

3. **The code is generated in real-time** as you interact with the app

## Step 3: Save Your Test

1. When you're done recording, the code will be displayed in the Codegen panel

2. You can:
   - **Save directly**: The generated code can be saved to a file in the `tests/` directory
   - **Copy and paste**: Copy the generated code and paste it into a new test file
   - **Edit inline**: Modify the generated code before saving

3. Create a new file in `tests/` directory (if saving manually):
   ```bash
   # Example: tests/login-flow.spec.js
   ```

4. Wrap the code in a test (if needed):
   ```javascript
   const { test, expect } = require('@playwright/test');

   test('my recorded test', async ({ page }) => {
     // Paste your recorded code here
   });
   ```

## Step 4: Run Your Test

```bash
npm test
```

Or run a specific test:
```bash
npx playwright test tests/login-flow.spec.js
```

## Example: Recording a Login Flow

1. Run `npm run test:record`
2. In the browser, navigate to `/login`
3. Fill in email/username and password
4. Click "Sign in"
5. Verify you're logged in (check for todo list)
6. Copy/save the generated code
7. Save it to `tests/login-flow.spec.js`
8. Add assertions to verify the login was successful

## QA Wolf Tips

- **Complete flows**: Record complete user journeys, not just individual actions
- **Use data-testid**: Add `data-testid="login-button"` to your React components for more reliable selectors
- **Add assertions**: After recording, add `expect()` statements to verify expected behavior:
  ```javascript
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="todo-input"]')).toBeVisible();
  ```
- **Clean up**: Remove unnecessary waits or clicks that might have been recorded accidentally
- **Test isolation**: Each test should be independent - use `beforeEach` for setup if needed
- **Wait for navigation**: After actions that cause navigation, explicitly wait:
  ```javascript
  await Promise.all([
    page.waitForURL('/expected-path'),
    page.click('button:has-text("Submit")')
  ]);
  ```

## Next Steps

- **Run tests**: `npm test`
- **Debug tests**: `npm run test:debug` - Opens Playwright Inspector
- **View report**: `npm run test:report` - Opens HTML report
- **See tests run**: `npm run test:headed` - Watch tests execute in browser
- **Interactive mode**: `npm run test:ui` - Run tests with Playwright UI

## Troubleshooting

### Browser doesn't open
- Make sure Playwright browsers are installed: `npm run install-browsers`
- Check that port 5173 is not blocked

### Codegen panel doesn't show
- Try closing and reopening: `npm run test:record`
- Check your terminal for any error messages

### Generated code doesn't work
- Make sure you're waiting for elements properly
- Add explicit waits for navigation
- Use more specific selectors (prefer role-based or data-testid)

## Learn More

- See [README.md](./README.md) for detailed documentation
- Check [Playwright Documentation](https://playwright.dev/docs/codegen-intro) for Codegen features
- Visit [QA Wolf Documentation](https://docs.qawolf.com) for QA Wolf best practices
