const Joi = require('joi');

function handleValidation(schema, payload) {
  const { error, value } = schema.validate(payload, { abortEarly: false, stripUnknown: true });
  return { error, value };
}

function validateRegister(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_]+$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional()
  });
  const { error } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  return next();
}

function validateLogin(req, res, next) {
  const schema = Joi.object({
    emailOrUsername: Joi.string().required(),
    password: Joi.string().required()
  });
  const { error } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  return next();
}

function validateTodo(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).allow('').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    dueDate: Joi.date().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    category: Joi.string().max(50).optional()
  });
  const { error } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  return next();
}

function validateTodoUpdate(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    completed: Joi.boolean().optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    dueDate: Joi.date().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    category: Joi.string().max(50).optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled', 'on-hold').optional()
  });
  const { error, value } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  // Overwrite body with validated, stripped value for downstream handlers
  req.body = value;
  return next();
}

// New validation functions for enhanced endpoints
function validateSubtask(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required()
  });
  const { error } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  return next();
}

function validateSubtaskUpdate(req, res, next) {
  const schema = Joi.object({
    completed: Joi.boolean().required()
  });
  const { error, value } = handleValidation(schema, req.body || {});
  if (error) {
    return res.status(400).json({ message: error.details.map(d => d.message).join(', ') });
  }
  req.body = value;
  return next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTodo,
  validateTodoUpdate,
  validateSubtask,
  validateSubtaskUpdate
};


