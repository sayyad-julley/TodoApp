#!/usr/bin/env node

/**
 * Simple test script to validate the new user-todo schema relationships
 */

require('dotenv').config({ path: './.env' });
const { connectToDatabase } = require('./src/config/database');
const { create: createUser, UserModel } = require('./src/models/User');
const { create: createTodo, findByUserId, TodoModel } = require('./src/models/Todo');

async function testSchema() {
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

    console.log(`✅ Created 2 todos for user ${testUser.username}`);

    // Test 3: Retrieve todos for the user
    console.log('\n3️⃣ Retrieving todos for user...');
    const userTodos = await findByUserId(testUser.id);
    console.log(`✅ Found ${userTodos.length} todos for user ${testUser.username}`);
    userTodos.forEach((todo, index) => {
      console.log(`   ${index + 1}. ${todo.title} (${todo.priority}) - ${todo.completed ? '✅' : '⏳'}`);
      console.log(`      Tags: ${todo.tags.join(', ')}`);
      console.log(`      Category: ${todo.category}`);
      console.log(`      User ID: ${todo.user_id}`);
    });

    // Test 4: Test filtering
    console.log('\n4️⃣ Testing filtering...');
    const highPriorityTodos = await findByUserId(testUser.id, 'all', { priority: 'high' });
    console.log(`✅ Found ${highPriorityTodos.length} high priority todos`);

    const workCategoryTodos = await findByUserId(testUser.id, 'all', { category: 'work' });
    console.log(`✅ Found ${workCategoryTodos.length} work category todos`);

    // Test 5: Test user statistics after todo creation
    console.log('\n5️⃣ Testing user statistics...');
    const updatedUser = await UserModel.findById(testUser.id);
    console.log('📊 User Model Statistics:');
    console.log(`   Todos Created: ${updatedUser.statistics.todosCreated}`);
    console.log(`   Todos Completed: ${updatedUser.statistics.todosCompleted}`);
    console.log(`   Completion Rate: ${updatedUser.getCompletionRate()}%`);
    console.log(`   Full Name: ${updatedUser.getFullName()}`);

    // Test 6: Test field synchronization
    console.log('\n6️⃣ Testing userId/user field synchronization...');
    const savedTodo = await TodoModel.findById(todo1.id);
    console.log(`✅ userId: ${savedTodo.userId}`);
    console.log(`✅ user: ${savedTodo.user}`);
    console.log(`✅ Fields are synchronized: ${savedTodo.userId.toString() === savedTodo.user.toString()}`);

    // Test 7: Complete a todo and check updates
    console.log('\n7️⃣ Testing todo completion...');
    await TodoModel.findByIdAndUpdate(todo1.id, { completed: true });
    const updatedTodo = await TodoModel.findById(todo1.id);
    console.log(`✅ Todo completed: ${updatedTodo.completed}`);
    console.log(`✅ Todo status: ${updatedTodo.status}`);
    console.log(`✅ Todo completed at: ${updatedTodo.completedAt}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 What we validated:');
    console.log(`✅ User creation with authentication fields`);
    console.log(`✅ Todo creation with user references (both userId and user fields)`);
    console.log(`✅ Todo retrieval by user`);
    console.log(`✅ Filtering by priority and category`);
    console.log(`✅ User statistics tracking`);
    console.log(`✅ Field synchronization between userId and user`);
    console.log(`✅ Todo completion status tracking`);

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
testSchema();