const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Keep passwordHash for backward compatibility
  passwordHash: {
    type: String,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    defaultView: {
      type: String,
      enum: ['all', 'active', 'completed'],
      default: 'all'
    }
  },
  statistics: {
    todosCreated: { type: Number, default: 0 },
    todosCompleted: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ created_at: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // Also set passwordHash for backward compatibility
    this.passwordHash = this.password;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  const passwordToCompare = this.password || this.passwordHash;
  return bcrypt.compare(candidatePassword, passwordToCompare);
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.incrementStats = function(action) {
  if (action === 'created') {
    this.statistics.todosCreated += 1;
  } else if (action === 'completed') {
    this.statistics.todosCompleted += 1;
  }
  return this.save();
};

userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.getCompletionRate = function() {
  if (this.statistics.todosCreated === 0) return 0;
  return Math.round((this.statistics.todosCompleted / this.statistics.todosCreated) * 100);
};

// Static methods
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true });
};

// Virtual for user's todos (population required)
userSchema.virtual('todos', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'user'
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

async function create(userData) {
  try {
    const { username, email, password, firstName, lastName, ...rest } = userData;
    const doc = await UserModel.create({
      username,
      email,
      password,
      firstName: firstName || username,
      lastName: lastName || '',
      ...rest
    });

    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      created_at: doc.created_at
    };
  } catch (err) {
    if (err && err.code === 11000) { // duplicate key
      const error = new Error('Duplicate entry');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

// Backward compatibility function
async function createWithHashedPassword(username, email, hashedPassword) {
  try {
    const doc = await UserModel.create({ username, email, passwordHash: hashedPassword, password: hashedPassword });
    return { id: doc._id.toString(), username: doc.username, email: doc.email, created_at: doc.created_at };
  } catch (err) {
    if (err && err.code === 11000) { // duplicate key
      const error = new Error('Duplicate entry');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

async function findByEmail(email) {
  const doc = await UserModel.findOne({ email }).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    firstName: doc.firstName || '',
    lastName: doc.lastName || '',
    password_hash: doc.passwordHash,
    created_at: doc.created_at
  };
}

async function findById(id) {
  const doc = await UserModel.findById(id).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    firstName: doc.firstName || '',
    lastName: doc.lastName || '',
    created_at: doc.created_at
  };
}

async function findByIdentifier(identifier) {
  return await UserModel.findByEmailOrUsername(identifier);
}

module.exports = {
  create,
  createWithHashedPassword,
  findByEmail,
  findById,
  findByIdentifier,
  UserModel,
  // Additional exports for model methods
  comparePassword: (user, candidatePassword) => user.comparePassword(candidatePassword),
  updateLastLogin: (user) => user.updateLastLogin(),
  incrementStats: (user, action) => user.incrementStats(action)
};


