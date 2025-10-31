const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = { ...err };
  error.message = err.message;

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

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = { errorHandler };
