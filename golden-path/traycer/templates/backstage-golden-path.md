---
displayName: Backstage Golden Path Template
applicableFor: plan
---

# Development Plan for {{projectName}}

## Project Context
- **Template**: Golden Path Fullstack Todo
- **Tech Stack**: React 18 + Node.js + PostgreSQL + AWS
- **Architecture**: Follows golden path patterns in `/golden-path/templates/fullstack-todo/`

## Implementation Plan

{{planMarkdown}}

## Golden Path Compliance Checklist

### Backend Implementation
- [ ] Follow RESTful conventions from `/golden-path/templates/fullstack-todo/backend/src/routes/`
- [ ] Use authentication patterns from existing controllers
- [ ] Implement proper error handling with `/golden-path/templates/fullstack-todo/backend/src/middleware/errorHandler.js`
- [ ] Add validation using `/golden-path/templates/fullstack-todo/backend/src/middleware/validation.js`

### Frontend Implementation  
- [ ] Follow component patterns from `/golden-path/templates/fullstack-todo/frontend/src/components/`
- [ ] Use Tailwind CSS styling consistent with existing components
- [ ] Implement proper state management with React Context
- [ ] Add loading and error states

### Testing Requirements
- [ ] Unit tests for backend controllers and frontend components
- [ ] Integration tests for API endpoints
- [ ] E2E tests using QA Wolf patterns from `/golden-path/templates/fullstack-todo/tests/e2e/`

### Documentation
- [ ] Update API documentation in `/docs/api-reference/`
- [ ] Add component documentation with JSDoc
- [ ] Update architecture docs if new patterns introduced

## Post-Implementation
1. Run `npm test` to execute full test suite
2. Run `npm run test:e2e` for end-to-end testing
3. Ensure CodeRabbit review passes
4. Update changelog with new features

