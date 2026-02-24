const errorHandler = (err, _req, res, _next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const message = isDevelopment 
    ? err.message 
    : 'An error occurred. Please try again later.';
  
  const status = err.status || err.statusCode || 500;
  

  if (status === 500) {
    console.error('Internal Server Error:', err);
  } else {
    console.error('Request Error:', message);
  }
  

  res.status(status).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;

