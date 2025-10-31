const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/todoController');

const { authenticate } = require('../middleware/auth');
const { validateTodo, validateTodoUpdate, validateSubtask, validateSubtaskUpdate } = require('../middleware/validation');

router.use(authenticate);

// Basic CRUD operations
router.get('/', getTodos);
router.post('/', validateTodo, createTodo);
router.put('/:id', validateTodoUpdate, updateTodo);
router.delete('/:id', deleteTodo);

// Enhanced endpoints
router.get('/statistics', getTodoStatistics);
router.get('/overdue', getOverdueTodos);
router.get('/upcoming', getUpcomingTodos);

// Subtask management
router.post('/:id/subtasks', validateSubtask, addTodoSubtask);
router.put('/:id/subtasks/:subtaskId', validateSubtaskUpdate, updateTodoSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteTodoSubtask);

module.exports = router;
