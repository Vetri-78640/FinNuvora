// Client-side cookie utilities
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  // Note: HttpOnly and Secure flags should be set by backend
  // Frontend can only set SameSite policy indirectly
  const sameSite = 'SameSite=Strict';
  document.cookie = `${name}=${value}; ${expires}; path=/; ${sameSite}`;
}

export function removeCookie(name) {
  setCookie(name, '', -1);
}
