# Transaction API

Complete API reference for transaction management endpoints.

## Get All Transactions

Retrieve user's transactions with filtering and pagination.

### Endpoint

```
GET /api/transactions
```

### Authentication

**Required:** Yes (JWT token)

### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page | 10 |
| type | string | Filter by type (income/expense/investment) | all |
| category | string | Filter by category ID | all |
| startDate | string | Filter from date (YYYY-MM-DD) | - |
| endDate | string | Filter to date (YYYY-MM-DD) | - |
| search | string | Search in description | - |
| sortBy | string | Sort field (date/amount) | date |
| sortOrder | string | Sort order (asc/desc) | desc |

### Request Example

```
GET /api/transactions?page=1&limit=10&type=expense&sortBy=date&sortOrder=desc
```

**Headers:**
```
Authorization: Bearer {token}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "507f191e810c19729de860ea",
      "amount": 50.00,
      "type": "expense",
      "category": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Groceries",
        "type": "expense"
      },
      "description": "Weekly groceries",
      "date": "2024-11-26T00:00:00.000Z",
      "createdAt": "2024-11-26T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTransactions": 47,
    "limit": 10
  }
}
```

---

## Get Single Transaction

Retrieve a specific transaction by ID.

### Endpoint

```
GET /api/transactions/:id
```

### Authentication

**Required:** Yes (JWT token)

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Transaction ID |

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "transaction": {
    "id": "507f191e810c19729de860ea",
    "amount": 50.00,
    "type": "expense",
    "category": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Groceries"
    },
    "description": "Weekly groceries",
    "date": "2024-11-26T00:00:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## Create Transaction

Create a new transaction.

### Endpoint

```
POST /api/transactions
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
  "amount": 50.00,
  "type": "expense",
  "category": "507f1f77bcf86cd799439011",
  "description": "Weekly groceries",
  "date": "2024-11-26"
}
```

**Validation:**
- `amount`: Required, positive number
- `type`: Required, one of: income, expense, investment
- `category`: Required, valid category ID
- `description`: Required, string, 1-200 characters
- `date`: Required, valid date (YYYY-MM-DD)

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "transaction": {
    "id": "507f191e810c19729de860ea",
    "amount": 50.00,
    "type": "expense",
    "category": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Groceries"
    },
    "description": "Weekly groceries",
    "date": "2024-11-26T00:00:00.000Z",
    "createdAt": "2024-11-26T10:30:00.000Z"
  }
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

## Update Transaction

Update an existing transaction.

### Endpoint

```
PUT /api/transactions/:id
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
  "amount": 75.00,
  "type": "expense",
  "category": "507f1f77bcf86cd799439011",
  "description": "Updated description",
  "date": "2024-11-26"
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "transaction": {
    "id": "507f191e810c19729de860ea",
    "amount": 75.00,
    "description": "Updated description"
  }
}
```

---

## Delete Transaction

Delete a transaction.

### Endpoint

```
DELETE /api/transactions/:id
```

### Authentication

**Required:** Yes (JWT token)

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## Upload Receipt (PDF)

Extract transaction details from PDF receipt.

### Endpoint

```
POST /api/transactions/upload-receipt
```

### Authentication

**Required:** Yes (JWT token)

### Request

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
file: [PDF file]
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "extractedData": {
    "amount": 45.99,
    "description": "Amazon Purchase",
    "category": "Shopping",
    "date": "2024-11-25"
  }
}
```

---

[[05-API-Reference/Auth-API|← Previous: Auth API]] | [[05-API-Reference|Back to API Reference]] | [[05-API-Reference/User-API|Next: User API →]]
