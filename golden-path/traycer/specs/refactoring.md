# Refactoring Specification

This specification defines the AI-assisted workflow for refactoring code in the golden path template projects.

## Overview

The refactoring workflow ensures code improvements are:
- Safe and non-breaking
- Properly tested
- Performance-aware
- Maintainable

## Workflow Steps

### 1. Code Smell Detection

Traycer should identify common code smells:

#### Backend Code Smells

**Reference**: `/golden-path/templates/fullstack-todo/backend/src/controllers/todoController.js`

- **Long Functions**: Functions exceeding 50 lines
- **Duplicated Code**: Repeated logic across files
- **Complex Conditionals**: Nested if/else statements
- **God Objects**: Classes/functions doing too much
- **Primitive Obsession**: Using primitives instead of value objects
- **Magic Numbers**: Hardcoded values without constants

#### Frontend Code Smells

**Reference**: `/golden-path/templates/fullstack-todo/frontend/src/components/TodoItem.jsx`

- **Large Components**: Components with too many responsibilities
- **Prop Drilling**: Passing props through many levels
- **Duplicate Logic**: Same logic in multiple components
- **Complex State**: Overly complex state management
- **Inline Styles**: Styles that should be Tailwind classes
- **Unused Code**: Dead code and unused imports

### 2. Refactoring Pattern Selection

#### Extract Function

Split large functions into smaller, focused functions:

```javascript
// Before
async function createTodo(req, res) {
  const { title, description, userId } = req.body;
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (title.length > 255) {
    return res.status(400).json({ error: 'Title too long' });
  }
  // ... rest of function
}

// After
function validateTodoTitle(title) {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('Title is required');
  }
  if (title.length > 255) {
    throw new ValidationError('Title too long');
  }
}

async function createTodo(req, res) {
  try {
    const { title, description, userId } = req.body;
    validateTodoTitle(title);
    // ... rest of function
  } catch (error) {
    handleError(error, res);
  }
}
```

#### Extract Component

Split large components into smaller, reusable components:

```javascript
// Before
export const TodoList = ({ todos }) => {
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.title}</span>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

// After
export const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
};

export const TodoList = ({ todos, onToggle, onDelete }) => {
  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```

#### Simplify Conditionals

Replace complex conditionals with clearer logic:

```javascript
// Before
if (user && user.role === 'admin' || user && user.role === 'moderator' && post.author === user.id) {
  // ...
}

// After
const canEdit = user && (
  user.role === 'admin' ||
  (user.role === 'moderator' && post.author === user.id)
);

if (canEdit) {
  // ...
}
```

### 3. Refactoring Execution

#### Backend Refactoring

**Reference**: `/golden-path/templates/fullstack-todo/backend/src/controllers/`

Steps:
1. Identify refactoring target
2. Create tests for current behavior
3. Apply refactoring
4. Verify tests still pass
5. Update related code

Example: Extract validation logic:

```javascript
// Extract to separate file: validators/todoValidator.js
function validateTodoInput(data) {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Use in controller
const validation = validateTodoInput(req.body);
if (!validation.isValid) {
  return res.status(400).json({ errors: validation.errors });
}
```

#### Frontend Refactoring

**Reference**: `/golden-path/templates/fullstack-todo/frontend/src/components/`

Steps:
1. Identify component to refactor
2. Write tests for component behavior
3. Extract sub-components or hooks
4. Update parent components
5. Verify tests and UI

Example: Extract custom hook:

```javascript
// Extract to hooks/useTodos.js
export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return { todos, loading, error, refetch: fetchTodos };
}

// Use in component
export const TodoList = () => {
  const { todos, loading, error } = useTodos();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* render todos */}</div>;
};
```

### 4. Testing Requirements

#### Before Refactoring

Create comprehensive tests:

```javascript
describe('TodoController', () => {
  describe('createTodo', () => {
    it('should create a todo with valid data', async () => {
      // Test current behavior
    });
    
    it('should reject invalid title', async () => {
      // Test validation
    });
  });
});
```

#### After Refactoring

Verify all tests pass:

```bash
npm run test
npm run test:integration
npm run test:e2e
```

#### Regression Testing

Test related functionality:
- API endpoints using refactored code
- Components using refactored hooks
- Integration points
- Edge cases

### 5. Performance Optimization

#### Backend Optimization

- **Database Queries**: Optimize N+1 queries
  ```javascript
  // Before: N+1 queries
  const todos = await Todo.findAll();
  for (const todo of todos) {
    const user = await User.findById(todo.userId);
  }

  // After: Single query with join
  const todos = await Todo.findAll({
    include: [{ model: User }]
  });
  ```

- **Caching**: Add caching for expensive operations
- **Pagination**: Implement pagination for large datasets

#### Frontend Optimization

- **Memoization**: Use React.memo and useMemo
  ```javascript
  const MemoizedTodoItem = React.memo(TodoItem);
  ```

- **Code Splitting**: Lazy load components
  ```javascript
  const TodoList = lazy(() => import('./TodoList'));
  ```

- **Bundle Size**: Remove unused dependencies
- **Re-renders**: Optimize re-render triggers

### 6. Documentation Updates

- **Code Comments**: Update comments to reflect changes
- **API Docs**: Update if API changes
- **Architecture Docs**: Document new patterns
- **Changelog**: Record refactoring in changelog

## Prompt Templates for Traycer

### Refactoring Analysis Prompt

```
Analyze this code for refactoring opportunities:

File: {file_path}
Code: {code_snippet}

Reference files:
- Controllers: backend/src/controllers/{similar_file}.js
- Components: frontend/src/components/{similar_component}.jsx

Please:
1. Identify code smells
2. Suggest refactoring patterns
3. Propose refactored code
4. Ensure tests remain passing
```

### Refactoring Execution Prompt

```
Refactor this code following the golden path patterns:

File: {file_path}
Issue: {code_smell}
Pattern: {refactoring_pattern}

Requirements:
- Maintain existing functionality
- Improve readability
- Follow existing patterns
- Add/update tests

Generate:
1. Refactored code
2. Updated tests
3. Documentation updates
```

## Common Refactoring Patterns

### Backend Patterns

1. **Extract Service Layer**: Move business logic from controllers
2. **Extract Repository**: Abstract database access
3. **Extract Validators**: Separate validation logic
4. **Extract Middleware**: Reusable request processing

### Frontend Patterns

1. **Extract Custom Hooks**: Reusable stateful logic
2. **Extract Components**: Smaller, focused components
3. **Extract Utilities**: Reusable functions
4. **Extract Constants**: Configuration values

## Success Criteria

A refactoring is considered complete when:

1. ✅ Code smells identified and addressed
2. ✅ Refactoring pattern applied
3. ✅ All existing tests pass
4. ✅ New tests added for extracted code
5. ✅ No performance regression
6. ✅ Code readability improved
7. ✅ Documentation updated
8. ✅ Code review passed
9. ✅ No functionality changes (unless intentional)
10. ✅ Deployment verified
