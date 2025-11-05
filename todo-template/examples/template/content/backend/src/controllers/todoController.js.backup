const {
  create: createTodoModel,
  findByUserId,
  update,
  delete: deleteTodoModel,
  getStatistics: getStatisticsModel,
  getOverdueTodos: getOverdueTodosModel,
  getUpcomingTodos: getUpcomingTodosModel,
  addSubtask: addSubtaskModel,
  updateSubtask: updateSubtaskModel,
  deleteSubtask: deleteSubtaskModel
} = require('../models/Todo');

async function getTodos(req, res) {
  try {
    const filter = (req.query && req.query.filter) || 'all';
    const { priority, category, tags, sortBy = 'created_at', sortOrder = 'desc', limit } = req.query || {};

    // Handle tags parameter - it could be a string or array
    let processedTags;
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim()).filter(Boolean);
      } else {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    const options = {
      priority,
      category,
      tags: processedTags,
      sortBy,
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      limit: limit ? parseInt(limit) : undefined
    };

    const todos = await findByUserId(req.user.id, filter, options);
    return res.status(200).json({ todos });
  } catch (error) {
    console.error('Error in getTodos:', error);
    return res.status(500).json({ message: 'Failed to fetch todos' });
  }
}

async function createTodo(req, res) {
  try {
    const { title, description, priority, dueDate, tags, category } = req.body || {};
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todoData = {
      user: req.user.id, // Use the new 'user' field
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      category: category || 'general'
    };

    const todo = await createTodoModel(todoData);
    return res.status(201).json({ todo });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create todo' });
  }
}

async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, description, completed, priority, dueDate, tags, category, status } = req.body || {};

    const hasUpdatable = (
      typeof title !== 'undefined' ||
      typeof description !== 'undefined' ||
      typeof completed !== 'undefined' ||
      typeof priority !== 'undefined' ||
      typeof dueDate !== 'undefined' ||
      typeof tags !== 'undefined' ||
      typeof category !== 'undefined' ||
      typeof status !== 'undefined'
    );
    if (!hasUpdatable) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof description !== 'undefined') updates.description = description;
    if (typeof completed !== 'undefined') updates.completed = completed;
    if (typeof priority !== 'undefined') updates.priority = priority;
    if (typeof dueDate !== 'undefined') updates.dueDate = dueDate;
    if (typeof tags !== 'undefined') updates.tags = tags;
    if (typeof category !== 'undefined') updates.category = category;
    if (typeof status !== 'undefined') updates.status = status;

    const updated = await update(id, req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    return res.status(200).json({ todo: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update todo' });
  }
}

async function deleteTodo(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteTodoModel(id, req.user.id);
    if (!ok) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete todo' });
  }
}

// New enhanced endpoints
async function getTodoStatistics(req, res) {
  try {
    const stats = await getStatisticsModel(req.user.id);
    return res.status(200).json({ statistics: stats });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
}

async function getOverdueTodos(req, res) {
  try {
    const overdueTodos = await getOverdueTodosModel(req.user.id);
    return res.status(200).json({ todos: overdueTodos });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch overdue todos' });
  }
}

async function getUpcomingTodos(req, res) {
  try {
    const { days = 7 } = req.query || {};
    const upcomingTodos = await getUpcomingTodosModel(req.user.id, parseInt(days));
    return res.status(200).json({ todos: upcomingTodos });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch upcoming todos' });
  }
}

async function addTodoSubtask(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body || {};
    if (!title) {
      return res.status(400).json({ message: 'Subtask title is required' });
    }

    const updatedTodo = await addSubtaskModel(id, req.user.id, title);
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    return res.status(200).json({ todo: updatedTodo });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add subtask' });
  }
}

async function updateTodoSubtask(req, res) {
  try {
    const { id, subtaskId } = req.params;
    const { completed } = req.body || {};

    if (typeof completed !== 'undefined') {
      const updatedTodo = await updateSubtaskModel(id, req.user.id, subtaskId, { completed });
      if (!updatedTodo) {
        return res.status(404).json({ message: 'Todo or subtask not found' });
      }
      return res.status(200).json({ todo: updatedTodo });
    } else {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update subtask' });
  }
}

async function deleteTodoSubtask(req, res) {
  try {
    const { id, subtaskId } = req.params;
    const updatedTodo = await deleteSubtaskModel(id, req.user.id, subtaskId);
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo or subtask not found' });
    }
    return res.status(200).json({ todo: updatedTodo });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete subtask' });
  }
}

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  // Enhanced endpoints
  getTodoStatistics,
  getOverdueTodos,
  getUpcomingTodos,
  addTodoSubtask,
  updateTodoSubtask,
  deleteTodoSubtask
};


