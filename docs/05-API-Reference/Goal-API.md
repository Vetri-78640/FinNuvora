# Goal API

Complete API reference for financial goal management endpoints.

## Get All Goals

Retrieve all user's financial goals.

### Endpoint

```
GET /api/goals
```

### Authentication

**Required:** Yes (JWT token)

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "goals": [
    {
      "id": "507f191e810c19729de860ea",
      "name": "Emergency Fund",
      "targetAmount": 10000.00,
      "currentAmount": 2500.00,
      "deadline": "2025-12-31T00:00:00.000Z",
      "progress": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Create Goal

Create a new financial goal.

### Endpoint

```
POST /api/goals
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
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "deadline": "2025-12-31"
}
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "goal": {
    "id": "507f191e810c19729de860ea",
    "name": "Emergency Fund",
    "targetAmount": 10000.00,
    "currentAmount": 0,
    "deadline": "2025-12-31T00:00:00.000Z",
    "progress": 0
  }
}
```

---

## Update Goal Progress

Add amount to goal progress.

### Endpoint

```
POST /api/goals/:id/progress
```

### Request

**Body:**
```json
{
  "amount": 500
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "goal": {
    "currentAmount": 500,
    "progress": 5,
    "remaining": 9500
  }
}
```

---

## Delete Goal

Delete a financial goal.

### Endpoint

```
DELETE /api/goals/:id
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

---

[[05-API-Reference/User-API|← Previous: User API]] | [[05-API-Reference|Back to API Reference]] | [[05-API-Reference/Portfolio-API|Next: Portfolio API →]]
