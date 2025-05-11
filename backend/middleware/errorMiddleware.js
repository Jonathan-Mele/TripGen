const errorHandler = (err, req, res, next) => {
    // Check if headers are already sent
    if (res.headersSent) {
      return next(err); // Delegate to the default Express error handler
    }
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 for server errors
    res.status(statusCode);
  
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Hide stack in production
    });
  };
  
  module.exports = {
    errorHandler,
  };