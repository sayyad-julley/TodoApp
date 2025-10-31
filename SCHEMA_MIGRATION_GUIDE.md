# User-Todo Schema Migration Guide

## 🎯 Overview

This document outlines the changes made to implement separate User and Todo schemas with proper user ownership tracking in your Todo App.

## ✅ What Was Implemented

### 1. Enhanced User Schema (`/src/models/User.js`)

**New Fields Added:**
- `firstName`, `lastName` - User's full name
- `password` - Auto-hashed password field
- `avatar` - Profile picture URL
- `isActive` - Account status
- `lastLogin` - Last login timestamp
- `preferences` - User settings (theme, notifications, default view)
- `statistics` - Todo statistics (created, completed, streaks)

**Features:**
- **Automatic Password Hashing**: Uses bcrypt with 12 salt rounds
- **User Statistics Tracking**: Automatically updates when todos are created/completed
- **Virtual Methods**: `getFullName()`, `getCompletionRate()`, `comparePassword()`
- **Backward Compatibility**: Maintains existing `passwordHash` field

### 2. Enhanced Todo Schema (`/src/models/Todo.js`)

**User Ownership:**
- `userId` - Legacy field (backward compatibility)
- `user` - Standard user reference field
- **Field Synchronization**: Automatically keeps `userId` and `user` fields in sync

**Enhanced Fields:**
- `priority` - Low, medium, high, urgent
- `dueDate` - Due date with overdue detection
- `tags` - Array of searchable tags
- `category` - Todo categorization
- `status` - Pending, in-progress, completed, cancelled, on-hold
- `completedAt` - Completion timestamp
- `subtasks` - Nested todo items with progress tracking

**Virtual Fields:**
- `subtaskProgress` - Percentage of completed subtasks
- `isOverdue` - Automatic overdue detection

**Enhanced Methods:**
- `getOverdueTodos()` - Get overdue todos for a user
- `getUpcomingTodos()` - Get todos due in next N days
- `addSubtask()`, `updateSubtask()`, `deleteSubtask()` - Subtask management

### 3. Database Schema Relationships

```
Users (Collection)
├── _id (ObjectId)
├── username (String, unique)
├── email (String, unique)
├── password (String, hashed)
├── firstName, lastName
├── preferences (Object)
├── statistics (Object)
└── timestamps

Todos (Collection)
├── _id (ObjectId)
├── user (ObjectId, ref: User) ✅
├── userId (ObjectId, ref: User) 🔄 (legacy)
├── title (String)
├── description (String)
├── completed (Boolean)
├── priority (String)
├── dueDate (Date)
├── tags (Array)
├── category (String)
├── status (String)
├── subtasks (Array)
└── timestamps
```

## 🔄 Migration Process

### Existing Data Migration

**Migration Script:** `/scripts/migrate-user-todo-schema.js`

**What it does:**
1. Creates a default user if none exists
2. Assigns existing todos to the default user
3. Synchronizes `userId` and `user` fields
4. Validates all todos have user references

**To Run:**
```bash
cd golden-path/templates/fullstack-todo/backend
chmod +x scripts/migrate-user-todo-schema.js
node scripts/migrate-user-todo-schema.js
```

### Test Schema Validation

**Test Script:** `/simple-schema-test.js`

**Validates:**
- User creation with authentication
- Todo creation with user references
- Field synchronization
- Filtering and sorting
- Statistics tracking

**To Run:**
```bash
cd golden-path/templates/fullstack-todo/backend
chmod +x simple-schema-test.js
node simple-schema-test.js
```

## 📋 API Changes

### User Model Methods

```javascript
// Enhanced user creation
const user = await createUser({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  preferences: {
    theme: 'dark',
    notifications: { email: true, push: false }
  }
});

// Find by email or username
const user = await findByIdentifier('testuser');

// Password comparison
const isValid = await user.comparePassword('password123');

// Update statistics
await user.incrementStats('created');
await user.incrementStats('completed');
```

### Todo Model Methods

```javascript
// Enhanced todo creation
const todo = await createTodo({
  user: userId,
  title: 'Complete project',
  description: 'Finish the new feature',
  priority: 'high',
  dueDate: new Date(),
  tags: ['work', 'important'],
  category: 'development'
});

// Advanced filtering
const todos = await findByUserId(userId, 'all', {
  priority: 'high',
  category: 'work',
  tags: ['urgent'],
  sortBy: 'dueDate',
  sortOrder: 'asc'
});

// Statistics
const stats = await getStatistics(userId);
// Returns: { total, completed, pending, inProgress, overdue }

// Subtask management
await addSubtask(todoId, userId, 'Research topic');
await updateSubtask(todoId, userId, subtaskId, { completed: true });
await deleteSubtask(todoId, userId, subtaskId);
```

## 🔒 Security Enhancements

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Automatic hashing on user creation/update
- Secure password comparison methods

### User Statistics
- Automatic tracking of todo creation/completion
- Completion rate calculations
- Streak tracking capabilities

## 🚀 Benefits

### For Users
- **Personal Experience**: Each user sees only their own todos
- **Rich Features**: Priority, due dates, tags, categories, subtasks
- **Statistics**: Track productivity and completion rates
- **Preferences**: Customizable themes and notifications

### For Developers
- **Clean Architecture**: Proper separation of concerns
- **Scalable**: Efficient database indexes and queries
- **Backward Compatible**: Existing code continues to work
- **Type Safety**: Enhanced validation and error handling

### For the Application
- **Multi-tenant Ready**: Supports multiple users
- **Performance**: Optimized queries with proper indexing
- **Extensible**: Easy to add new features
- **Data Integrity**: Proper foreign key relationships

## 📊 Database Indexes

**User Indexes:**
- `username` (unique)
- `email` (unique)
- `isActive`
- `created_at`

**Todo Indexes:**
- `user, created_at` (compound)
- `user, completed` (compound)
- `user, status` (compound)
- `userId, created_at` (legacy)
- `tags`
- `dueDate`
- `priority`

## 🎉 Testing Results

✅ **All tests passed successfully:**
- User creation with authentication fields
- Todo creation with user references
- Field synchronization between userId and user
- Filtering by priority, category, tags
- User statistics tracking
- Todo completion status tracking

## 📁 Files Modified/Created

### New Files:
- `/src/models/User.js` - Enhanced user model
- `/scripts/migrate-user-todo-schema.js` - Migration script
- `/simple-schema-test.js` - Schema validation test

### Modified Files:
- `/src/models/Todo.js` - Enhanced todo model with user references
- `/src/config/database.js` - Updated to use new models

### Files Referenced:
- `/.env` - Environment variables for AWS Secrets Manager
- `/src/config/secrets-manager.js` - AWS Secrets Manager integration

## 🔄 Next Steps

1. **Run Migration**: Update existing data with the migration script
2. **Update API Endpoints**: Modify your routes to use the new user-todo relationships
3. **Frontend Updates**: Update your frontend to handle user authentication and filtering
4. **Testing**: Write comprehensive tests for your API endpoints
5. **Documentation**: Update API documentation with new parameters and responses

## 🛠️ Troubleshooting

### Common Issues:
1. **Authentication Errors**: Ensure AWS credentials are properly configured
2. **Missing User References**: Run the migration script to fix orphaned todos
3. **Index Warnings**: Can be ignored during development, resolved in production

### Debug Tips:
- Use `console.log()` to check user ID synchronization
- Verify database indexes with MongoDB Compass
- Check statistics updates in user documents
- Test filtering with different parameter combinations

Your Todo App now has a robust, multi-user architecture with comprehensive user-todo relationships! 🎉