# User API

Complete API reference for user management endpoints.

## Get User Profile

Retrieve current user's profile information.

### Endpoint

```
GET /api/user/profile
```

### Authentication

**Required:** Yes (JWT token)

### Request

**Headers:**
```
Authorization: Bearer {token}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD",
    "accountBalance": 1500.00,
    "plaidAccessToken": "access-sandbox-xxx",
    "plaidItemId": "item-xxx",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Update User Profile

Update user profile information.

### Endpoint

```
PUT /api/user/profile
```

### Authentication

**Required:** Yes (JWT token)

### Request

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Smith",
  "currency": "EUR"
}
```

**Allowed Fields:**
- `name`: String, 2-50 characters
- `currency`: String, one of: USD, INR, EUR, GBP, JPY, CAD, AUD

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "currency": "EUR"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid currency code"
}
```

---

## Get Account Statistics

Retrieve user's financial statistics.

### Endpoint

```
GET /api/user/stats
```

### Authentication

**Required:** Yes (JWT token)

### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| period | string | Time period (month/year/all) | month |

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "stats": {
    "balance": 1500.00,
    "income": 3000.00,
    "expenses": 1800.00,
    "investments": 500.00,
    "net": 1200.00,
    "topCategory": {
      "name": "Food & Dining",
      "amount": 450.00
    },
    "transactionCount": 47
  }
}
```

---

[[05-API-Reference/Transaction-API|← Previous: Transaction API]] | [[05-API-Reference|Back to API Reference]] | [[05-API-Reference/Goal-API|Next: Goal API →]]
