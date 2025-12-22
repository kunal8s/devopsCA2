const ApiResponse = require('../utils/helpers/apiResponse.js');

exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);

    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production error response
  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new Error('Invalid token');
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error = new Error('Token expired');
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json(
    new ApiResponse(error.statusCode || 500, null, error.message || 'Internal Server Error')
  );
};