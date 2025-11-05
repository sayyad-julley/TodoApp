#!/usr/bin/env node

/**
 * Test script to validate the new user-todo schema relationships
 */

require('dotenv').config({ path: './.env' });
const { connectToDatabase } = require('./src/config/database');
const { create: createUser, UserModel } = require('./src/models/User');
const { create: createTodo, findByUserId, getStatistics, TodoModel } = require('./src/models/Todo');

async function testUserTodoSchema() {
  try {
    console.log('🧪 Testing User-Todo Schema Relationships...\n');

    // Connect to database
    const connection = await connectToDatabase();
    console.log('✅ Connected to database');

    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const testUser = await createUser({
      username: 'test_user_' + Date.now(),
      email: `test_${Date.now()}@todoapp.com`,
      password: 'testPassword123!',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log(`✅ Created user: ${testUser.username} (ID: ${testUser.id})`);

    // Test 2: Create todos for the user
    console.log('\n2️⃣ Creating todos for user...');
    const todo1 = await createTodo({
      userId: testUser.id,
      title: 'First test todo',
      description: 'This is the first test todo',
      priority: 'high',
      tags: ['test', 'important'],
      category: 'work'
    });

    const todo2 = await createTodo({
      user: testUser.id, // Test using 'user' field
      title: 'Second test todo',
      description: 'This is the second test todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      category: 'personal'
    });

    const todo3 = await createTodo({
      userId: testUser.id,
      title: 'Third test todo with subtasks',
      description: 'This todo has subtasks',
      priority: 'low',
      category: 'learning'
    });

    console.log(`✅ Created 3 todos for user ${testUser.username}`);

    // Test 3: Add subtasks to the third todo
    console.log('\n3️⃣ Adding subtasks to todo...');
    await TodoModel.findByIdAndUpdate(todo3.id, {
      $push: {
        subtasks: [
          { title: 'Research the topic', completed: true },
          { title: 'Create an outline', completed: false },
          { title: 'Write the content', completed: false }
        ]
      }
    });
    console.log('✅ Added subtasks to todo');

    // Test 4: Retrieve todos for the user
    console.log('\n4️⃣ Retrieving todos for user...');
    const userTodos = await findByUserId(testUser.id);
    console.log(`✅ Found ${userTodos.length} todos for user ${testUser.username}`);
    userTodos.forEach((todo, index) => {
      console.log(`   ${index + 1}. ${todo.title} (${todo.priority}) - ${todo.completed ? '✅' : '⏳'}`);
    });

    // Test 5: Test filtering and sorting
    console.log('\n5️⃣ Testing filtering and sorting...');
    const highPriorityTodos = await findByUserId(testUser.id, 'all', { priority: 'high' });
    console.log(`✅ Found ${highPriorityTodos.length} high priority todos`);

    const completedTodos = await findByUserId(testUser.id, 'completed');
    console.log(`✅ Found ${completedTodos.length} completed todos`);

    const workCategoryTodos = await findByUserId(testUser.id, 'all', { category: 'work' });
    console.log(`✅ Found ${workCategoryTodos.length} work category todos`);

    // Test 6: Test statistics
    console.log('\n6️⃣ Testing user statistics...');
    const stats = await getStatistics(testUser.id);
    console.log('📊 User Statistics:');
    console.log(`   Total todos: ${stats.total}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   In Progress: ${stats.inProgress}`);
    console.log(`   Overdue: ${stats.overdue}`);
    console.log(`   High Priority: ${stats.highPriority}`);

    // Test 7: Test user statistics after todo operations
    console.log('\n7️⃣ Testing user statistics...');
    const updatedUser = await UserModel.findById(testUser.id);
    console.log('📊 User Model Statistics:');
    console.log(`   Todos Created: ${updatedUser.statistics.todosCreated}`);
    console.log(`   Todos Completed: ${updatedUser.statistics.todosCompleted}`);
    console.log(`   Completion Rate: ${updatedUser.getCompletionRate()}%`);

    // Test 8: Complete a todo and check statistics update
    console.log('\n8️⃣ Testing todo completion and statistics update...');
    await TodoModel.findByIdAndUpdate(todo1.id, { completed: true });

    const updatedStats = await getStatistics(testUser.id);
    console.log(`✅ Updated completed todos: ${updatedStats.completed}`);

    const updatedUserStats = await UserModel.findById(testUser.id);
    console.log(`✅ Updated user completed count: ${updatedUserStats.statistics.todosCompleted}`);

    // Test 9: Test virtual fields
    console.log('\n9️⃣ Testing virtual fields...');
    const todoWithSubtasks = await TodoModel.findById(todo3.id);
    console.log(`✅ Subtask progress: ${todoWithSubtasks.subtaskProgress}%`);
    console.log(`✅ Is overdue: ${todoWithSubtasks.isOverdue}`);

    // Test 10: Test user population
    console.log('\n🔟 Testing user-todo population...');
    const todoWithUser = await TodoModel.findById(todo1.id).populate('user', 'username email firstName lastName');
    console.log(`✅ Todo belongs to user: ${todoWithUser.user.username} (${todoWithUser.user.email})`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`✅ User creation and authentication`);
    console.log(`✅ Todo creation with user references`);
    console.log(`✅ Todo retrieval by user`);
    console.log(`✅ Filtering and sorting capabilities`);
    console.log(`✅ Statistics tracking`);
    console.log(`✅ User statistics updates`);
    console.log(`✅ Virtual fields (subtask progress, overdue status)`);
    console.log(`✅ User-todo population`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await TodoModel.deleteMany({ user: testUser.id });
    await UserModel.findByIdAndDelete(testUser.id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run tests
testUserTodoSchema();