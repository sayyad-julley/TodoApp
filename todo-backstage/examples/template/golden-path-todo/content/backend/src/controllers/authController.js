const { create: createUser, findByEmail, findById, findByIdentifier, UserModel } = require('../models/User');
const { inMemoryUserOps } = require('../models/InMemoryUser');
const { generateToken } = require('../utils/jwt');

// Check if MongoDB is connected
const isMongoConnected = () => {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

async function register(req, res) {
  const { username, email, password, firstName, lastName } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }

  try {
    let user;
    const useInMemory = !isMongoConnected();

    if (useInMemory) {
      console.log('Using in-memory user storage (MongoDB not connected)');
      user = await inMemoryUserOps.create({
        username,
        email,
        password,
        firstName: firstName || username,
        lastName: lastName || ''
      });
    } else {
      user = await createUser({
        username,
        email,
        password,
        firstName: firstName || username,
        lastName: lastName || ''
      });

      // Update last login
      await UserModel.findByIdAndUpdate(user.id, { lastLogin: new Date() });
    }

    const token = await generateToken({ id: user.id, email: user.email });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        created_at: user.created_at
      }
    });
  } catch (err) {
    if (err && (err.statusCode === 409 || err.code === '23505')) {
      return res.status(409).json({ message: 'Duplicate entry' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
}

async function login(req, res) {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: 'email/username and password are required' });
  }

  try {
    let userDoc;
    const useInMemory = !isMongoConnected();

    if (useInMemory) {
      console.log('Using in-memory user storage for login (MongoDB not connected)');
      userDoc = await inMemoryUserOps.findByEmailOrUsername(emailOrUsername);
    } else {
      userDoc = await findByIdentifier(emailOrUsername);
    }

    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await userDoc.updateLastLogin();

    const user = {
      id: userDoc._id || userDoc.id,
      username: userDoc.username,
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      created_at: userDoc.created_at,
      preferences: userDoc.preferences || {
        theme: 'light',
        notifications: { email: true, push: true },
        defaultView: 'all'
      },
      statistics: userDoc.statistics || {
        todosCreated: 0,
        todosCompleted: 0,
        streakDays: 0,
        longestStreak: 0
      }
    };

    const token = await generateToken({ id: user.id, email: user.email });
    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
}

module.exports = { register, login };


