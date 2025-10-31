const { test, expect } = require('@playwright/test');

test('login and create todo with filters', async ({ page }) => {
  test.setTimeout(60000); // Increase timeout for this test to handle rate limiting
  
  // Add a small delay to stagger requests when running in parallel
  await page.waitForTimeout(Math.random() * 1000);
  
  await page.goto('/login');
  
  // Wait for the form to be ready
  await page.waitForSelector('button:has-text("Sign in")');
  
  // Fill in login form
  await page.getByRole('textbox', { name: '* Email or Username' }).fill('sayyad.mukthumsa@gmail.com');
  await page.getByRole('textbox', { name: '* Password' }).fill('Msa@662003');
  
  // Retry logic for handling rate limiting
  let loginSuccessful = false;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (!loginSuccessful && attempts < maxAttempts) {
    attempts++;
    
    try {
      // Set up promises to catch both response and navigation
      const loginResponsePromise = page.waitForResponse(response => 
        response.url().includes('/auth/login'), 
        { timeout: 12000 }
      );
      
      const navigationPromise = page.waitForURL('/', { timeout: 8000 });
      
      // Click sign in button
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Race between response and navigation
      const result = await Promise.race([
        loginResponsePromise.then(response => ({ type: 'response', value: response })),
        navigationPromise.then(() => ({ type: 'navigation', value: true }))
      ]);
      
      // If navigation happened, login was successful
      if (result.type === 'navigation') {
        loginSuccessful = true;
        break;
      }
      
      // If we got a response, check the status
      const loginResponse = result.value;
      if (loginResponse.status() === 200) {
        // Success - wait for navigation
        try {
          await page.waitForURL('/', { timeout: 10000 });
        } catch {
          // Navigation might have already happened, check current URL
          if (!page.url().includes('/login')) {
            loginSuccessful = true;
            break;
          }
        }
        // Double check we're on home page
        if (!page.url().includes('/login')) {
          loginSuccessful = true;
          break;
        }
      } else if (loginResponse.status() === 429) {
        // Rate limited - wait and retry
        const errorBody = await loginResponse.json().catch(() => ({}));
        const retryAfter = errorBody.retryAfter || (attempts * 2000); // Default exponential backoff
        console.log(`Rate limited (429). Retrying after ${retryAfter}ms (attempt ${attempts}/${maxAttempts})`);
        await page.waitForTimeout(retryAfter);
        
        // Refresh the page and refill the form
        await page.reload();
        await page.waitForSelector('button:has-text("Sign in")');
        await page.getByRole('textbox', { name: '* Email or Username' }).fill('sayyad.mukthumsa@gmail.com');
        await page.getByRole('textbox', { name: '* Password' }).fill('Msa@662003');
        continue;
      } else {
        // Other error - throw immediately
        const errorBody = await loginResponse.json().catch(() => ({}));
        throw new Error(`Login failed with status ${loginResponse.status()}: ${errorBody.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Check if we actually navigated (login might have succeeded despite error)
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        loginSuccessful = true;
        break;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error(`Login failed after ${maxAttempts} attempts: ${error.message}`);
      }
      
      // Wait before retry with exponential backoff
      await page.waitForTimeout(attempts * 2000);
      await page.reload();
      await page.waitForSelector('button:has-text("Sign in")');
      await page.getByRole('textbox', { name: '* Email or Username' }).fill('sayyad.mukthumsa@gmail.com');
      await page.getByRole('textbox', { name: '* Password' }).fill('Msa@662003');
    }
  }
  
  if (!loginSuccessful) {
    throw new Error(`Login failed after ${maxAttempts} attempts`);
  }
  
  // Ensure we're on the home page
  await page.waitForURL('/', { timeout: 5000 });
  
  // Verify we're on the home page
  await expect(page).toHaveURL('/');
  
  // Wait for the page to be fully loaded and ready
  await page.waitForLoadState('networkidle');
  
  // Create a new todo
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Traycer');
  await page.locator('.ant-select-selection-item').first().click();
  await page.getByText('Urgent', { exact: true }).click();
  await page.locator('div:nth-child(2) > .ant-select-selector > .ant-select-selection-wrap > .ant-select-selection-item').click();
  await page.getByText('Work', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Tags (comma separated)' }).click();
  await page.getByRole('textbox', { name: 'Tags (comma separated)' }).fill('tool');
  await page.locator('.ant-picker-input').click();
  await page.getByText('31', { exact: true }).click();
  await page.getByRole('button', { name: 'plus Add Task' }).click();
  
  // Test filter functionality
  await page.getByText('Pending').click();
  await page.getByTitle('Completed').click();
  await page.getByText('All').click();
});