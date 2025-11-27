# Chat API

Complete API reference for AI assistant endpoints.

## Send Message

Send a message to the AI financial assistant.

### Endpoint

```
POST /api/chat
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
  "message": "How much did I spend on food last month?"
}
```

### Response

**Success (200 OK) - Information Only:**
```json
{
  "success": true,
  "response": "You spent $450 on food last month, which is 15% more than the previous month. Your biggest food expense was dining out at $200.",
  "action": null,
  "data": null
}
```

**Success (200 OK) - With Action:**
```json
{
  "success": true,
  "response": "I've added your grocery expense of $50.",
  "action": "create_transaction",
  "data": {
    "transactionId": "507f191e810c19729de860ea",
    "amount": 50.00,
    "type": "expense",
    "category": "Groceries"
  }
}
```

### Supported Actions

**create_transaction:**
```json
{
  "action": "create_transaction",
  "data": {
    "amount": 50,
    "type": "expense",
    "category": "Groceries",
    "description": "Weekly groceries"
  }
}
```

**create_goal:**
```json
{
  "action": "create_goal",
  "data": {
    "name": "Vacation",
    "targetAmount": 5000,
    "deadline": "2025-06-01"
  }
}
```

### Error Response

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Message is required"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "AI service unavailable"
}
```

---

## Rate Limiting

- **Maximum:** 20 requests per minute per user
- **Cooldown:** 3 seconds between requests

---

[[05-API-Reference/Portfolio-API|← Previous: Portfolio API]] | [[05-API-Reference|Back to API Reference]] | [[05-API-Reference/Plaid-API|Next: Plaid API →]]
