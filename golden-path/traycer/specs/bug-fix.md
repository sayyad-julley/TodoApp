# Bug Fix Specification

This specification defines the AI-assisted workflow for identifying and fixing bugs in the golden path template projects.

## Overview

The bug fixing workflow ensures issues are:
- Properly diagnosed with root cause analysis
- Reproduced with test cases
- Fixed without introducing regressions
- Documented for future reference

## Workflow Steps

### 1. Bug Identification

Traycer should help identify bugs by:

- **Analyzing Error Logs**: Review application logs, CloudWatch logs, and error traces
- **Examining Stack Traces**: Identify where errors occur
- **Reviewing Recent Changes**: Check git history for recent modifications
- **Checking Error Patterns**: Identify similar issues in the codebase

### 2. Root Cause Analysis

#### Error Context Collection

- **Error Message**: Exact error message
- **Stack Trace**: Full stack trace
- **Environment**: Production, staging, development
- **Reproduction Steps**: How to reproduce the issue
- **Frequency**: How often it occurs
- **User Impact**: Who is affected

#### Error Handler Analysis

**Reference**: `/golden-path/templates/fullstack-todo/backend/src/middleware/errorHandler.js`

Traycer should review:
- How errors are caught and handled
- Error response formatting
- Logging patterns
- Error propagation

#### Code Flow Analysis

- **API Request Flow**: Trace request from frontend to backend
- **Database Interactions**: Check query patterns and transactions
- **State Management**: Review frontend state handling
- **Async Operations**: Check promise handling and error propagation

### 3. Bug Reproduction

#### Test Case Creation

Create a test case that reproduces the bug:

```javascript
test('reproduces bug: login fails with 500 error', async () => {
  // Arrange: Set up test conditions
  const invalidCredentials = { email: 'test@example.com', password: 'wrong' };
  
  // Act: Perform the action that causes the bug
  const response = await request(app)
    .post('/api/auth/login')
    .send(invalidCredentials);
  
  // Assert: Verify the bug occurs
  expect(response.status).toBe(500); // This should be 400 or 401
  expect(response.body.error).toBeDefined();
});
```

#### Manual Reproduction Steps

Document steps to reproduce:
1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Login"
4. Observe 500 error (should be 400/401)

### 4. Fix Implementation

#### Debugging Process

1. **Add Logging**: Add strategic logging to trace execution
   ```javascript
   logger.debug('Login attempt', { email, timestamp: Date.now() });
   ```

2. **Check Data Flow**: Verify data at each step
   ```javascript
   logger.debug('Database query result', { user, queryTime });
   ```

3. **Validate Assumptions**: Check all assumptions
   ```javascript
   if (!user) {
     logger.warn('User not found', { email });
     throw new Error('Invalid credentials');
   }
   ```

#### Fix Application

Apply the fix:
- **Fix Root Cause**: Address the underlying issue, not just symptoms
- **Follow Patterns**: Use existing code patterns
- **Error Handling**: Proper error handling
- **Validation**: Add validation if missing

#### Example Fix

```javascript
// Before (buggy)
async function login(email, password) {
  const user = await User.findByEmail(email);
  if (user.password === password) { // No hashing check!
    return generateToken(user);
  }
  throw new Error('Invalid credentials');
}

// After (fixed)
async function login(email, password) {
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  return generateToken(user);
}
```

### 5. Regression Testing

#### Test Updates

Update the reproduction test to verify the fix:

```javascript
test('login rejects invalid credentials with 401', async () => {
  const invalidCredentials = { email: 'test@example.com', password: 'wrong' };
  
  const response = await request(app)
    .post('/api/auth/login')
    .send(invalidCredentials);
  
  // Now expect correct behavior
  expect(response.status).toBe(401);
  expect(response.body.error).toBe('Invalid credentials');
});
```

#### Existing Test Verification

Run all existing tests to ensure no regressions:

```bash
npm run test
npm run test:e2e
```

#### Related Feature Testing

Test related features that might be affected:
- Similar authentication flows
- Related API endpoints
- Frontend components using the fixed code

### 6. Documentation

#### Bug Report Update

Document the bug and fix:
- **Bug Description**: What was wrong
- **Root Cause**: Why it happened
- **Fix Applied**: What was changed
- **Prevention**: How to prevent similar issues

#### Code Comments

Add comments explaining the fix:

```javascript
// Fixed: Added password hashing verification
// Previously compared plain text passwords
const isValid = await bcrypt.compare(password, user.password);
```

## Error Handler Reference

**Location**: `/golden-path/templates/fullstack-todo/backend/src/middleware/errorHandler.js`

Traycer should understand:
- How errors are caught
- Error response formatting
- Logging patterns
- Error types and handling

## Common Bug Patterns

### 1. Authentication Bugs

- Missing password hashing verification
- Token expiration not checked
- Session not properly invalidated

### 2. Database Bugs

- Race conditions in updates
- Missing transactions
- SQL injection vulnerabilities
- Connection pool exhaustion

### 3. Frontend Bugs

- State not properly updated
- Race conditions in async operations
- Memory leaks
- Stale closures

### 4. API Bugs

- Missing input validation
- Incorrect HTTP status codes
- Error messages exposing sensitive info
- CORS misconfiguration

## Prompt Templates for Traycer

### Bug Analysis Prompt

```
Analyze this bug following the golden path patterns:

Bug Report:
- Error: {error_message}
- Stack Trace: {stack_trace}
- Steps to Reproduce: {steps}
- Environment: {environment}

Reference files:
- Error Handler: backend/src/middleware/errorHandler.js
- Related Code: {file_paths}

Please:
1. Identify root cause
2. Create reproduction test
3. Propose fix
4. Verify fix doesn't break existing tests
```

### Fix Generation Prompt

```
Fix this bug following the golden path patterns:

Bug: {bug_description}
Root Cause: {root_cause}
Location: {file_path}:{line_number}

Requirements:
- Fix root cause, not symptoms
- Follow existing code patterns
- Add proper error handling
- Include tests

Generate:
1. Fixed code
2. Updated tests
3. Documentation updates
```

## Debugging Tools

### Logging

Use structured logging:

```javascript
logger.error('Login failed', {
  email,
  error: error.message,
  stack: error.stack,
  timestamp: Date.now()
});
```

### Error Tracking

- CloudWatch Logs for AWS deployments
- Error tracking services (Sentry, Rollbar)
- X-Ray traces for distributed systems

### Testing Tools

- Debugger (Node.js debugger, Chrome DevTools)
- Network inspection (Browser DevTools)
- Database query logging
- Performance profiling

## Success Criteria

A bug fix is considered complete when:

1. ✅ Root cause identified and documented
2. ✅ Reproduction test created
3. ✅ Fix implemented
4. ✅ Reproduction test passes
5. ✅ All existing tests pass
6. ✅ Related features tested
7. ✅ No regressions introduced
8. ✅ Documentation updated
9. ✅ Code review passed
10. ✅ Fix deployed and verified
