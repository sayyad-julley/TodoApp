# Feature Development Specification

This specification defines the AI-assisted workflow for adding new features to the golden path template projects.

## Overview

The feature development workflow ensures new features are:
- Consistent with existing codebase patterns
- Properly tested (unit, integration, E2E)
- Well-documented
- Reviewed for security and performance

## Workflow Steps

### 1. Understanding Existing Codebase

Before implementing a new feature, Traycer should:

- **Analyze Backend Routes**: Review existing route patterns in `/golden-path/templates/fullstack-todo/backend/src/routes/`
  - Understand RESTful conventions
  - Identify authentication patterns
  - Review middleware usage
  - Check validation approaches

- **Analyze Frontend Components**: Review existing component patterns in `/golden-path/templates/fullstack-todo/frontend/src/components/`
  - Understand component structure
  - Review state management patterns
  - Check styling approaches (Tailwind CSS)
  - Identify reusable patterns

- **Review Database Schema**: Understand existing table structures and relationships
- **Check API Patterns**: Review existing API endpoints for consistency

### 2. Feature Planning

Traycer should generate:

- **Feature Overview**: Clear description of the feature
- **API Design**: New endpoints/routes needed
  - HTTP methods (GET, POST, PUT, DELETE)
  - Request/response schemas
  - Authentication requirements
  - Error handling approach

- **Frontend Components**: New components needed
  - Component hierarchy
  - Props and state management
  - User interactions
  - Styling requirements

- **Database Changes**: Migrations needed
  - New tables
  - Schema modifications
  - Indexes and constraints

### 3. Implementation Steps

#### Backend Implementation

1. **Create Route Handler** (`/golden-path/templates/fullstack-todo/backend/src/routes/`)
   - Follow RESTful conventions
   - Use existing route structure as template
   - Include proper error handling
   - Add input validation

2. **Create Controller** (`/golden-path/templates/fullstack-todo/backend/src/controllers/`)
   - Business logic separation
   - Database interaction
   - Error handling
   - Response formatting

3. **Add Validation** (`/golden-path/templates/fullstack-todo/backend/src/middleware/validation.js`)
   - Request validation
   - Input sanitization
   - Schema validation

4. **Update Models** (if needed)
   - Database queries
   - Data transformations

#### Frontend Implementation

1. **Create Components** (`/golden-path/templates/fullstack-todo/frontend/src/components/`)
   - Follow existing component patterns
   - Use functional components with hooks
   - Implement proper prop types
   - Add loading and error states

2. **Update Routes** (`/golden-path/templates/fullstack-todo/frontend/src/pages/`)
   - Add new pages if needed
   - Update routing configuration

3. **API Integration** (`/golden-path/templates/fullstack-todo/frontend/src/utils/api.js`)
   - Add API functions
   - Handle errors properly
   - Include loading states

4. **Styling** (Tailwind CSS)
   - Follow existing design patterns
   - Responsive design
   - Accessibility considerations

### 4. Testing Requirements

#### Unit Tests

- **Backend**: Test controllers and utilities
  - Input validation
  - Business logic
  - Error handling
  - Edge cases

- **Frontend**: Test components
  - Rendering
  - User interactions
  - State changes
  - Props handling

#### Integration Tests

- **API Endpoints**: Test full request/response cycle
  - Authentication
  - Authorization
  - Data persistence
  - Error responses

#### E2E Tests

- **User Flows**: Test complete user journeys
  - Feature accessibility
  - User interactions
  - Data flow
  - Error scenarios

**Reference**: `/golden-path/templates/fullstack-todo/tests/e2e/playwright.config.js`

### 5. Documentation Updates

- **API Documentation**: Update OpenAPI/Swagger specs
- **Component Documentation**: Add JSDoc comments
- **User Guide**: Update user-facing documentation
- **Architecture Docs**: Document new patterns if introduced

### 6. Code Review Checklist

Before submitting for CodeRabbit review:

- [ ] Code follows existing patterns
- [ ] All tests pass
- [ ] Linting passes
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Authentication/authorization checked
- [ ] Performance considerations addressed
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Security best practices followed

## Code Generation Guidelines

### Backend Code Examples

```javascript
// Route structure
router.get('/api/todos', authenticate, async (req, res) => {
  try {
    const todos = await todoController.getAll(req.user.id);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Controller structure
async function getAll(userId) {
  validateUserId(userId);
  const todos = await Todo.findByUserId(userId);
  return todos;
}
```

### Frontend Code Examples

```javascript
// Component structure
export const TodoList = ({ todos, onToggle, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (id) => {
    setLoading(true);
    try {
      await onToggle(id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```

## Prompt Templates for Traycer

### Feature Generation Prompt

```
Generate a new feature following the golden path patterns:

Feature: {feature_name}
Description: {feature_description}

Requirements:
- {requirement_1}
- {requirement_2}

Reference files:
- Routes: backend/src/routes/{similar_route}.js
- Components: frontend/src/components/{similar_component}.jsx

Generate:
1. Backend route, controller, and validation
2. Frontend components and API integration
3. Unit tests for backend and frontend
4. Integration tests
5. E2E test scenarios
6. Documentation updates
```

## Common Patterns

### CRUD Operations

- **Create**: POST endpoint, form component, validation
- **Read**: GET endpoint, list component, filtering
- **Update**: PUT/PATCH endpoint, edit form, optimistic updates
- **Delete**: DELETE endpoint, confirmation dialog, optimistic updates

### Authentication Required

- Use `authenticate` middleware
- Check user permissions
- Include user context in requests

### Error Handling

- Consistent error response format
- Proper HTTP status codes
- User-friendly error messages
- Logging for debugging

## Success Criteria

A feature is considered complete when:

1. ✅ Backend endpoints implemented and tested
2. ✅ Frontend components implemented and tested
3. ✅ Integration tests passing
4. ✅ E2E tests passing
5. ✅ Documentation updated
6. ✅ Code review passed (CodeRabbit)
7. ✅ Linting and formatting checks pass
8. ✅ No security vulnerabilities
9. ✅ Performance acceptable
10. ✅ Accessibility standards met
