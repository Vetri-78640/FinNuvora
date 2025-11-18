const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Don't expose internal error details in production
  const message = isDevelopment 
    ? err.message 
    : 'An error occurred. Please try again later.';
  
  const status = err.status || err.statusCode || 500;
  
  // Log actual error for debugging
  if (status === 500) {
    console.error('Internal Server Error:', err);
  } else {
    console.error('Request Error:', message);
  }
  
  // Don't expose stack traces or internal error details
  res.status(status).json({
    success: false,
    error: message,
    // Only include status code in production for debugging, don't include in response
  });
};

module.exports = errorHandler;

