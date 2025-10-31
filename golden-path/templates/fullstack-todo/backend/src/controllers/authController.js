const { create: createUser, findByEmail, findById, findByIdentifier, UserModel } = require('../models/User');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  const { username, email, password, firstName, lastName } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }

  try {
    const user = await createUser({
      username,
      email,
      password,
      firstName: firstName || username,
      lastName: lastName || ''
    });

    const token = await generateToken({ id: user.id, email: user.email });

    // Update last login
    await UserModel.findByIdAndUpdate(user.id, { lastLogin: new Date() });

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
    // Support login with either email or username
    const userDoc = await findByIdentifier(emailOrUsername);
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
      id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      created_at: userDoc.created_at,
      preferences: userDoc.preferences,
      statistics: userDoc.statistics
    };

    const token = await generateToken({ id: user.id, email: user.email });
    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
}

module.exports = { register, login };


