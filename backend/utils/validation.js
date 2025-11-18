/**
 * Security utilities for input validation and sanitization
 */

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validate password strength
function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate name (prevent NoSQL injection)
function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.length < 2 || name.length > 100) return false;
  // Only allow alphanumeric, spaces, hyphens, and apostrophes
  return /^[a-zA-Z0-9\s\-']+$/.test(name);
}

// Sanitize string input (prevent XSS and injection)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
}

// Safe error message (don't expose internal errors)
function getSafeErrorMessage(error, isDevelopment = false) {
  if (isDevelopment && error && error.message) {
    return error.message;
  }
  return 'An error occurred. Please try again later.';
}

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  isValidName,
  sanitizeInput,
  getSafeErrorMessage
};
