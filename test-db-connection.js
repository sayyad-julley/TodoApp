// Test script to verify database connection and create sample data
require('dotenv').config({ path: './golden-path/templates/fullstack-todo/backend/.env' });
const { connectToDatabase } = require('./golden-path/templates/fullstack-todo/backend/src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 Environment variables:');
    console.log('  - AWS_REGION:', process.env.AWS_REGION);
    console.log('  - DB_SECRET_ARN:', process.env.DB_SECRET_ARN);
    console.log('  - JWT_SECRET_ARN:', process.env.JWT_SECRET_ARN);

    const connection = await connectToDatabase();
    console.log('✅ Database connection successful!');

    // Test database operations
    const Todo = connection.model('Todo', new connection.Schema({
      title: String,
      completed: Boolean,
      createdAt: { type: Date, default: Date.now }
    }, { collection: 'todos' }));

    // Check if collection exists and has data
    const count = await Todo.countDocuments();
    console.log(`📝 Current todos count: ${count}`);

    if (count === 0) {
      // Create sample todos
      const sampleTodos = [
        { title: 'Welcome to your Todo App!', completed: false },
        { title: 'Test AWS Secrets Manager integration', completed: true },
        { title: 'Set up CI/CD pipeline', completed: false },
        { title: 'Deploy to production', completed: false }
      ];

      await Todo.insertMany(sampleTodos);
      console.log('🎉 Created sample todos!');

      const newCount = await Todo.countDocuments();
      console.log(`📝 New todos count: ${newCount}`);
    } else {
      // Display existing todos
      const todos = await Todo.find().limit(5);
      console.log('📋 Recent todos:');
      todos.forEach((todo, index) => {
        console.log(`  ${index + 1}. ${todo.title} (${todo.completed ? '✅' : '⏳'})`);
      });
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('ENOTCONN')) {
      console.log('💡 Possible solutions:');
      console.log('  1. Check your MongoDB Atlas connection string');
      console.log('  2. Verify your IP address is whitelisted in MongoDB Atlas');
      console.log('  3. Check if database user has correct permissions');
    }

    if (error.message.includes('Authentication failed')) {
      console.log('💡 Possible solutions:');
      console.log('  1. Verify username and password in MongoDB Atlas');
      console.log('  2. Check if the database user is active');
    }
  } finally {
    process.exit(0);
  }
}

testDatabaseConnection();