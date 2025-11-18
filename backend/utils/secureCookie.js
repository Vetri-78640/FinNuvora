/**
 * Secure cookie utilities for backend
 */

function setSecureCookie(res, name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const cookieOptions = {
    expires: expires,
    path: '/',
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' // CSRF protection
  };
  
  res.cookie(name, value, cookieOptions);
}

function clearSecureCookie(res, name) {
  res.clearCookie(name, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}

module.exports = {
  setSecureCookie,
  clearSecureCookie
};
