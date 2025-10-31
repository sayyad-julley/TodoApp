#!/usr/bin/env node

/**
 * Migration script to update existing data for the new user-todo schema relationship
 * This script will:
 * 1. Create a default user if no users exist
 * 2. Assign existing todos to the default user
 * 3. Update any missing user references
 */

require('dotenv').config({ path: '../.env' });
const { connectToDatabase } = require('../src/config/database');
const { create: createUser, UserModel } = require('../src/models/User');
const { TodoModel } = require('../src/models/Todo');

async function migrateUserTodoSchema() {
  try {
    console.log('🔄 Starting user-todo schema migration...');

    // Connect to database
    const connection = await connectToDatabase();
    console.log('✅ Connected to database');

    // Step 1: Check if users exist
    const userCount = await UserModel.countDocuments();
    console.log(`📊 Found ${userCount} existing users`);

    let defaultUser;
    if (userCount === 0) {
      // Create a default user
      console.log('👤 Creating default user...');
      defaultUser = await createUser({
        username: 'demo_user',
        email: 'demo@todoapp.com',
        password: 'demoPassword123!',
        firstName: 'Demo',
        lastName: 'User'
      });
      console.log(`✅ Created default user: ${defaultUser.username} (ID: ${defaultUser.id})`);
    } else {
      // Get the first user as default
      defaultUser = await UserModel.findOne().lean();
      console.log(`✅ Using existing user as default: ${defaultUser.username} (ID: ${defaultUser._id})`);
    }

    // Step 2: Update todos without user references
    const orphanTodos = await TodoModel.find({
      $or: [
        { userId: { $exists: false } },
        { user: { $exists: false } },
        { userId: null },
        { user: null }
      ]
    });

    console.log(`📝 Found ${orphanTodos.length} todos without user references`);

    if (orphanTodos.length > 0) {
      const updateResult = await TodoModel.updateMany(
        {
          $or: [
            { userId: { $exists: false } },
            { user: { $exists: false } },
            { userId: null },
            { user: null }
          ]
        },
        {
          $set: {
            userId: defaultUser._id,
            user: defaultUser._id
          }
        }
      );
      console.log(`✅ Updated ${updateResult.modifiedCount} todos with default user reference`);
    }

    // Step 3: Sync userId and user fields for existing todos
    const unsyncedTodos = await TodoModel.find({
      $or: [
        { userId: { $ne: null }, user: null },
        { user: { $ne: null }, userId: null }
      ]
    });

    console.log(`🔄 Found ${unsyncedTodos.length} todos with unsynced user references`);

    for (const todo of unsyncedTodos) {
      const userId = todo.userId || todo.user;
      await TodoModel.updateOne(
        { _id: todo._id },
        { $set: { userId: userId, user: userId } }
      );
    }

    if (unsyncedTodos.length > 0) {
      console.log(`✅ Synced user references for ${unsyncedTodos.length} todos`);
    }

    // Step 4: Validate the migration
    const finalUserCount = await UserModel.countDocuments();
    const finalTodoCount = await TodoModel.countDocuments();
    const todosWithUser = await TodoModel.countDocuments({
      $and: [
        { userId: { $exists: true, $ne: null } },
        { user: { $exists: true, $ne: null } }
      ]
    });

    console.log('\n📊 Migration Summary:');
    console.log(`  Total Users: ${finalUserCount}`);
    console.log(`  Total Todos: ${finalTodoCount}`);
    console.log(`  Todos with User References: ${todosWithUser}`);
    console.log(`  Orphaned Todos: ${finalTodoCount - todosWithUser}`);

    if (finalTodoCount === todosWithUser) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('✅ All todos now have proper user references');
    } else {
      console.log('\n⚠️  Migration completed with warnings:');
      console.log(`   ${finalTodoCount - todosWithUser} todos still lack user references`);
    }

    // Step 5: Show sample data
    console.log('\n📋 Sample Data:');
    const sampleUser = await UserModel.findOne().lean();
    const sampleTodos = await TodoModel.find({ user: sampleUser._id })
      .limit(3)
      .lean();

    console.log(`  User: ${sampleUser.username} (${sampleUser.email})`);
    console.log('  Sample Todos:');
    sampleTodos.forEach((todo, index) => {
      console.log(`    ${index + 1}. ${todo.title} - ${todo.completed ? '✅' : '⏳'}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateUserTodoSchema();