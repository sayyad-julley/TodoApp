const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  // Keep userId for backward compatibility
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add 'user' field as the standard reference
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    minlength: 1
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },

  // Enhanced fields
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  category: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
    default: 'pending'
  },
  completedAt: {
    type: Date,
    default: null
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for performance
todoSchema.index({ user: 1, created_at: -1 });
todoSchema.index({ user: 1, completed: 1 });
todoSchema.index({ user: 1, status: 1 });
todoSchema.index({ userId: 1, created_at: -1 }); // Backward compatibility

// Pre-save middleware to sync userId and user fields
todoSchema.pre('save', function(next) {
  // Ensure userId and user fields are always in sync
  if (this.userId && !this.user) {
    this.user = this.userId;
  } else if (this.user && !this.userId) {
    this.userId = this.user;
  }

  // Update completion status based on completed field
  if (this.completed && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (!this.completed && this.status === 'completed') {
    this.status = 'pending';
    this.completedAt = null;
  }

  next();
});

// Pre-update middleware to handle completion status
todoSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  const update = this.getUpdate();

  if (update.completed === true && update.status !== 'completed') {
    update.status = 'completed';
    update.completedAt = new Date();
  } else if (update.completed === false && update.status === 'completed') {
    update.status = 'pending';
    update.completedAt = null;
  }

  next();
});

// Virtual for subtask progress
todoSchema.virtual('subtaskProgress').get(function() {
  if (this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

const TodoModel = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

async function create(todoData) {
  const { userId, user, title, description, priority, dueDate, tags, category } = todoData;

  // Ensure we have both userId and user fields
  const finalUserId = userId || user;
  if (!finalUserId) {
    throw new Error('User ID is required');
  }

  const doc = await TodoModel.create({
    userId: finalUserId,
    user: finalUserId,
    title,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: tags || [],
    category: category || 'general'
  });

  // Update user statistics (handle cases where statistics field might not exist)
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(finalUserId, {
      $inc: { 'statistics.todosCreated': 1 }
    });
  } catch (statError) {
    console.warn('Could not update user statistics:', statError.message);
    // Continue without failing the todo creation
  }

  return normalize(doc);
}

// Backward compatibility
async function createLegacy(userId, title, description = '') {
  return create({ userId, title, description });
}

async function findByUserId(userId, filter = 'all', options = {}) {
  const query = { userId };

  if (filter === 'completed') {
    query.completed = true;
  } else if (filter === 'pending') {
    query.completed = false;
  } else if (filter === 'overdue') {
    query.completed = false;
    query.dueDate = { $lt: new Date() };
  }

  // Additional filters
  if (options.priority) query.priority = options.priority;
  if (options.category) query.category = options.category;
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  let queryBuilder = TodoModel.find(query);

  // Sorting
  const sortBy = options.sortBy || 'created_at';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  queryBuilder = queryBuilder.sort({ [sortBy]: sortOrder });

  // Limit
  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }

  const docs = await queryBuilder.lean();
  return docs.map(normalize);
}

async function findById(id) {
  const doc = await TodoModel.findById(id).lean();
  return doc ? normalize(doc) : null;
}

async function findByIdAndUser(todoId, userId) {
  const doc = await TodoModel.findOne({ _id: todoId, userId }).lean();
  return doc ? normalize(doc) : null;
}

function normalize(doc) {
  return {
    id: doc._id.toString(),
    user_id: doc.userId ? doc.userId.toString() : doc.user.toString(),
    title: doc.title,
    description: doc.description || '',
    completed: !!doc.completed,
    priority: doc.priority || 'medium',
    dueDate: doc.dueDate,
    tags: doc.tags || [],
    category: doc.category || 'general',
    status: doc.status || 'pending',
    completedAt: doc.completedAt,
    subtasks: doc.subtasks || [],
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    // Computed fields
    isOverdue: doc.isOverdue,
    subtaskProgress: doc.subtaskProgress
  };
}

async function update(id, userId, updates) {
  const toSet = {};

  if (Object.prototype.hasOwnProperty.call(updates, 'title')) toSet.title = updates.title;
  if (Object.prototype.hasOwnProperty.call(updates, 'description')) toSet.description = updates.description;
  if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
    toSet.completed = normalizeBoolean(updates.completed);
    // Update user statistics when completing a todo
    if (toSet.completed) {
      try {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(userId, {
          $inc: { 'statistics.todosCompleted': 1 }
        });
      } catch (statError) {
        console.warn('Could not update user completion statistics:', statError.message);
        // Continue without failing the todo update
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'priority')) toSet.priority = updates.priority;
  if (Object.prototype.hasOwnProperty.call(updates, 'dueDate')) toSet.dueDate = updates.dueDate;
  if (Object.prototype.hasOwnProperty.call(updates, 'tags')) toSet.tags = updates.tags;
  if (Object.prototype.hasOwnProperty.call(updates, 'category')) toSet.category = updates.category;
  if (Object.prototype.hasOwnProperty.call(updates, 'status')) toSet.status = updates.status;

  const doc = await TodoModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: toSet },
    { new: true, runValidators: true }
  ).lean();

  return doc ? normalize(doc) : null;
}

function normalizeBoolean(input) {
  if (input === true || input === false) return input;
  if (typeof input === 'string') {
    const lowered = input.toLowerCase();
    if (lowered === 'true') return true;
    if (lowered === 'false') return false;
  }
  const err = new Error('Invalid completed value');
  err.statusCode = 400;
  throw err;
}

async function remove(id, userId) {
  const res = await TodoModel.deleteOne({ _id: id, userId });
  return res.deletedCount > 0;
}

// New enhanced functions
async function getStatistics(userId) {
  const stats = await TodoModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$completed', false] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$dueDate', null] }
                ]
              },
              1,
              0
            ]
          }
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    highPriority: 0
  };
}

async function getOverdueTodos(userId) {
  const docs = await TodoModel.find({
    userId,
    completed: false,
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 }).lean();

  return docs.map(normalize);
}

async function getUpcomingTodos(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const docs = await TodoModel.find({
    userId,
    completed: false,
    dueDate: { $gte: new Date(), $lte: futureDate }
  }).sort({ dueDate: 1 }).lean();

  return docs.map(normalize);
}

async function addSubtask(todoId, userId, title) {
  const doc = await TodoModel.findOneAndUpdate(
    { _id: todoId, userId },
    { $push: { subtasks: { title, completed: false, createdAt: new Date() } } },
    { new: true }
  ).lean();

  return doc ? normalize(doc) : null;
}

async function updateSubtask(todoId, userId, subtaskId, updates) {
  const doc = await TodoModel.findOneAndUpdate(
    { _id: todoId, userId, 'subtasks._id': subtaskId },
    { $set: { 'subtasks.$': updates } },
    { new: true }
  ).lean();

  return doc ? normalize(doc) : null;
}

async function deleteSubtask(todoId, userId, subtaskId) {
  const doc = await TodoModel.findOneAndUpdate(
    { _id: todoId, userId },
    { $pull: { subtasks: { _id: subtaskId } } },
    { new: true }
  ).lean();

  return doc ? normalize(doc) : null;
}

module.exports = {
  create,
  createLegacy,
  findByUserId,
  findById,
  findByIdAndUser,
  update,
  delete: remove,
  TodoModel,
  // Enhanced functions
  getStatistics,
  getOverdueTodos,
  getUpcomingTodos,
  addSubtask,
  updateSubtask,
  deleteSubtask
};


