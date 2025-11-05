const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Add error to X-Ray segment if available
  try {
    const AWSXRay = require('aws-xray-sdk-core');
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addError(err);
    }
  } catch (xrayError) {
    // X-Ray not available or error accessing segment
  }

  // Default error
  let error = { ...err };
  error.message = err.message;

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 409 };
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    const message = 'Duplicate entry';
    error = { message, statusCode: 409 };
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    const message = 'Invalid reference';
    error = { message, statusCode: 400 };
  }

  // PostgreSQL invalid text representation
  if (err.code === '22P02') {
    const message = 'Invalid data format';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Bcrypt errors
  if (err.message && err.message.includes('bcrypt')) {
    const message = 'Authentication error';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = { errorHandler };
