# Authentication API

Complete API reference for authentication endpoints.

## Register User

Create a new user account.

### Endpoint

```
POST /api/auth/register
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
- `name`: Required, string, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

---

## Login User

Authenticate user and receive JWT token.

### Endpoint

```
POST /api/auth/login
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Response

**Success (200 OK):**
```json
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
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

---

## Rate Limiting

Authentication endpoints are rate-limited:

- **Maximum:** 5 requests per 15 minutes per IP address
- **Headers:** Rate limit info included in response headers

---

[[05-API-Reference|← Back to API Reference]] | [[05-API-Reference/Transaction-API|Next: Transaction API →]]
