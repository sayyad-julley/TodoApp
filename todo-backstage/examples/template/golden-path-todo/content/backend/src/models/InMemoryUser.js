const inMemoryDB = {
  users: new Map(),
  nextId: 1
};

// In-memory user operations for development fallback
const inMemoryUserOps = {
  async create(userData) {
    // Check for existing email or username
    const existingUser = await this.findByEmailOrUsername(userData.email);
    if (existingUser) {
      const error = new Error('Email already exists');
      error.statusCode = 409;
      throw error;
    }

    const existingUsername = await this.findByEmailOrUsername(userData.username);
    if (existingUsername) {
      const error = new Error('Username already exists');
      error.statusCode = 409;
      throw error;
    }

    const id = inMemoryDB.nextId++;
    const user = {
      id: id.toString(),
      username: userData.username,
      email: userData.email.toLowerCase(), // Store email in lowercase for consistency
      firstName: userData.firstName || userData.username,
      lastName: userData.lastName || '',
      password: require('bcryptjs').hashSync(userData.password, 12),
      created_at: new Date(),
      isActive: true,
      lastLogin: null,
      preferences: {
        theme: 'light',
        notifications: { email: true, push: true },
        defaultView: 'all'
      },
      statistics: {
        todosCreated: 0,
        todosCompleted: 0,
        streakDays: 0,
        longestStreak: 0
      }
    };

    inMemoryDB.users.set(id.toString(), user);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      created_at: user.created_at
    };
  },

  async findByEmailOrUsername(identifier) {
    const normalizedIdentifier = identifier.toLowerCase().trim();
    for (const user of inMemoryDB.users.values()) {
      if (user.email === normalizedIdentifier || user.username.toLowerCase() === normalizedIdentifier) {
        return {
          _id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          created_at: user.created_at,
          preferences: user.preferences,
          statistics: user.statistics,
          comparePassword: async function(candidatePassword) {
            return require('bcryptjs').compare(candidatePassword, this.password);
          },
          updateLastLogin: async function() {
            this.lastLogin = new Date();
            return this;
          }
        };
      }
    }
    return null;
  },

  async findById(id) {
    const user = inMemoryDB.users.get(id);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      created_at: user.created_at
    };
  },

  async updateUserStatistics(userId, action) {
    const user = inMemoryDB.users.get(userId);
    if (!user) return false;

    if (action === 'todosCompleted') {
      user.statistics.todosCompleted += 1;
    } else if (action === 'todosCreated') {
      user.statistics.todosCreated += 1;
    }

    return true;
  }
};

// In-memory Todo operations for development fallback
const inMemoryTodoDB = {
  todos: new Map(),
  nextId: 1
};

const inMemoryTodoOps = {
  async create(todoData) {
    const id = inMemoryTodoDB.nextId++;
    const todo = {
      id: id.toString(),
      _id: id.toString(),
      user_id: todoData.userId,
      userId: todoData.userId,
      user: todoData.userId,
      title: todoData.title,
      description: todoData.description || '',
      completed: todoData.completed || false,
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate || null,
      tags: todoData.tags || [],
      category: todoData.category || 'general',
      status: todoData.status || 'pending',
      completedAt: todoData.completedAt || null,
      subtasks: todoData.subtasks || [],
      created_at: new Date(),
      updated_at: new Date(),
      isOverdue: todoData.dueDate && new Date(todoData.dueDate) < new Date() && !todoData.completed,
      subtaskProgress: {
        total: (todoData.subtasks || []).length,
        completed: (todoData.subtasks || []).filter(st => st.completed).length,
        percentage: (todoData.subtasks || []).length > 0
          ? Math.round(((todoData.subtasks || []).filter(st => st.completed).length / (todoData.subtasks || []).length) * 100)
          : 0
      }
    };

    inMemoryTodoDB.todos.set(id.toString(), todo);
    return todo;
  },

  async findByUserId(userId, filter = 'all', options = {}) {
    let todos = Array.from(inMemoryTodoDB.todos.values()).filter(todo =>
      todo.user_id === userId || todo.userId === userId || todo.user === userId
    );

    // Apply filters
    if (filter === 'completed') {
      todos = todos.filter(todo => todo.completed);
    } else if (filter === 'pending') {
      todos = todos.filter(todo => !todo.completed);
    }

    // Apply additional filters from options
    if (options.priority && options.priority !== 'all') {
      todos = todos.filter(todo => todo.priority === options.priority);
    }

    if (options.category && options.category !== 'all') {
      todos = todos.filter(todo => todo.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      todos = todos.filter(todo =>
        options.tags.some(tag => todo.tags.includes(tag))
      );
    }

    if (options.status && options.status !== 'all') {
      todos = todos.filter(todo => todo.status === options.status);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    todos.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return -sortOrder;
      if (aVal > bVal) return sortOrder;
      return 0;
    });

    // Apply limit
    if (options.limit) {
      todos = todos.slice(0, options.limit);
    }

    return todos;
  },

  async findById(id) {
    const todo = inMemoryTodoDB.todos.get(id);
    return todo || null;
  },

  async findByIdAndUser(todoId, userId) {
    const todo = inMemoryTodoDB.todos.get(todoId);
    if (!todo) return null;

    if ((todo.user_id === userId || todo.userId === userId || todo.user === userId)) {
      return todo;
    }
    return null;
  },

  async update(id, updates) {
    const todo = inMemoryTodoDB.todos.get(id);
    if (!todo) return null;

    const updatedTodo = {
      ...todo,
      ...updates,
      updated_at: new Date(),
      // Recompute computed fields
      isOverdue: updates.dueDate && new Date(updates.dueDate) < new Date() && !updates.completed
    };

    inMemoryTodoDB.todos.set(id, updatedTodo);
    return updatedTodo;
  },

  async delete(id) {
    const todo = inMemoryTodoDB.todos.get(id);
    if (!todo) return false;
    inMemoryTodoDB.todos.delete(id);
    return true;
  },

  async getStatistics(userId) {
    const userTodos = Array.from(inMemoryTodoDB.todos.values()).filter(todo =>
      todo.user_id === userId || todo.userId === userId || todo.user === userId
    );

    const total = userTodos.length;
    const completed = userTodos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = userTodos.filter(todo => todo.isOverdue).length;

    const priorityCounts = {
      low: userTodos.filter(todo => todo.priority === 'low').length,
      medium: userTodos.filter(todo => todo.priority === 'medium').length,
      high: userTodos.filter(todo => todo.priority === 'high').length,
      urgent: userTodos.filter(todo => todo.priority === 'urgent').length
    };

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityCounts
    };
  }
};

module.exports = { inMemoryUserOps, inMemoryDB, inMemoryTodoOps, inMemoryTodoDB };