/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
