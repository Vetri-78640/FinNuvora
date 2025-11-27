# Authentication

Complete guide to FinNuvora's authentication system.

## Overview

FinNuvora uses JWT (JSON Web Tokens) for secure, stateless authentication. This allows users to register, log in, and access protected resources across the application.

## Features

- User registration with email and password
- Secure login with JWT token generation
- Password hashing with bcrypt
- Protected routes and API endpoints
- Automatic token validation
- Session persistence

## User Registration

### Frontend Flow

1. User fills out registration form
2. Form validates input (email format, password strength)
3. Request sent to `/api/auth/register`
4. Success: User redirected to login
5. Error: Validation messages displayed

### Backend Process

```javascript
POST /api/auth/register

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (Success):
{
  "success": true,
  "message": "User registered successfully"
}

Response (Error):
{
  "success": false,
  "message": "Email already exists"
}
```

### Implementation Details

**Password Requirements:**
- Minimum 6 characters
- Hashed using bcrypt with 10 salt rounds
- Never stored in plain text

**Email Validation:**
- Must be unique
- Checked against existing users
- Case-insensitive comparison

**Account Initialization:**
- Initial balance: 0
- Default currency: USD (auto-detected on first login)
- Created timestamp recorded

## User Login

### Frontend Flow

1. User enters email and password
2. Credentials sent to `/api/auth/login`
3. JWT token received and stored
4. User redirected to dashboard
5. Token included in subsequent requests

### Backend Process

```javascript
POST /api/auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (Success):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD",
    "accountBalance": 0
  }
}

Response (Error):
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Token Structure

The JWT token contains:

```javascript
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1640000000,  // Issued at
  "exp": 1640604800   // Expires (7 days)
}
```

**Token Expiration:** 7 days  
**Storage:** Cookie named `authToken`  
**Transmission:** Included in request headers

## Protected Routes

### Frontend Protection

The `useProtectedRoute` hook ensures users are authenticated:

```javascript
// In any protected page
const { user, loading } = useProtectedRoute();

if (loading) return <div>Loading...</div>;
if (!user) return null; // Redirects to login
```

**Protected Pages:**
- `/dashboard`
- `/dashboard/transactions`
- `/dashboard/goals`
- `/dashboard/portfolios`
- `/dashboard/chat`

### Backend Protection

The `auth` middleware validates JWT tokens:

```javascript
// Applied to protected routes
router.get('/api/transactions', auth, getTransactions);
```

**Validation Process:**
1. Extract token from cookie
2. Verify token signature
3. Check expiration
4. Extract user ID
5. Attach user to request object
6. Proceed to route handler

## Authentication Context

The `AuthContext` provides authentication state globally:

```javascript
const { user, setUser, loading } = useAuth();

// User object structure
{
  id: "507f1f77bcf86cd799439011",
  name: "John Doe",
  email: "john@example.com",
  currency: "USD",
  accountBalance: 1500.00
}
```

**Context Methods:**
- `checkAuth()` - Validates current session
- `setUser(userData)` - Updates user state
- `logout()` - Clears authentication

## Logout

### Process

1. User clicks logout button
2. `authToken` cookie removed
3. User state cleared
4. Redirect to login page

```javascript
const logout = () => {
  removeCookie('authToken');
  setUser(null);
  router.push('/auth/login');
};
```

## Security Measures

### Password Security

- **Hashing:** Bcrypt with 10 salt rounds
- **Comparison:** Constant-time comparison to prevent timing attacks
- **Storage:** Only hashed passwords stored in database

### Token Security

- **Signing:** HMAC SHA256 algorithm
- **Secret:** Stored in environment variables
- **Expiration:** 7-day automatic expiration
- **Validation:** Every request validates token

### Rate Limiting

Authentication endpoints are rate-limited:

```javascript
// Maximum 5 requests per 15 minutes per IP
POST /api/auth/login
POST /api/auth/register
```

### Input Validation

All inputs are validated and sanitized:

- Email format validation
- Password strength requirements
- XSS prevention
- SQL injection prevention (via Mongoose)

## Common Issues

### "Invalid credentials"

**Cause:** Incorrect email or password

**Solution:**
- Verify email is correct
- Check password (case-sensitive)
- Ensure account exists

### "Token expired"

**Cause:** JWT token has expired (>7 days old)

**Solution:**
- Log in again to get new token
- Token automatically refreshes on login

### "Unauthorized"

**Cause:** Missing or invalid token

**Solution:**
- Ensure you're logged in
- Clear cookies and log in again
- Check if token is being sent in requests

## API Reference

### Register User

```javascript
POST /api/auth/register

Headers:
Content-Type: application/json

Body:
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login User

```javascript
POST /api/auth/login

Headers:
Content-Type: application/json

Body:
{
  "email": "string (required)",
  "password": "string (required)"
}

Response: 200 OK
{
  "success": true,
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "currency": "string",
    "accountBalance": "number"
  }
}
```

## Code Examples

### Frontend: Login Component

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await authAPI.login(email, password);
    
    if (response.data.success) {
      setCookie('authToken', response.data.token);
      setUser(response.data.user);
      router.push('/dashboard');
    }
  } catch (error) {
    setError(error.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### Backend: Auth Controller

```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      accountBalance: user.accountBalance
    }
  });
};
```

## Testing

### Test User Credentials

For development and testing:

```
Email: test@example.com
Password: Test123!
```

Create test user:
```bash
cd backend
node scripts/createTestUser.js
```

## Future Enhancements

- Two-factor authentication (2FA)
- OAuth integration (Google, GitHub)
- Password reset via email
- Email verification
- Session management dashboard
- Remember me functionality
- Biometric authentication (mobile)

---

[[03-Architecture|← Previous: Architecture]] | [[README|Back to Index]] | [[04-Features/Transactions|Next: Transactions →]]
