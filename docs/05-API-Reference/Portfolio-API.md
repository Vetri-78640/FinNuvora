# Portfolio API

Complete API reference for investment portfolio management endpoints.

## Get All Investments

Retrieve all user's investment holdings.

### Endpoint

```
GET /api/portfolios
```

### Authentication

**Required:** Yes (JWT token)

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "portfolios": [
    {
      "id": "507f191e810c19729de860ea",
      "symbol": "AAPL",
      "quantity": 10,
      "purchasePrice": 150.00,
      "currentPrice": 175.00,
      "totalValue": 1750.00,
      "gain": 250.00,
      "gainPercent": 16.67,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalValue": 1750.00,
  "totalGain": 250.00
}
```

---

## Add Investment

Add a new investment to portfolio.

### Endpoint

```
POST /api/portfolios
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
  "symbol": "AAPL",
  "quantity": 10,
  "purchasePrice": 150.00
}
```

### Response

**Success (201 Created):**
```json
{
  "success": true,
  "portfolio": {
    "id": "507f191e810c19729de860ea",
    "symbol": "AAPL",
    "quantity": 10,
    "purchasePrice": 150.00,
    "currentPrice": 175.00,
    "totalValue": 1750.00
  }
}
```

---

## Update Investment

Update investment quantity or purchase price.

### Endpoint

```
PUT /api/portfolios/:id
```

### Request

**Body:**
```json
{
  "quantity": 15,
  "purchasePrice": 160.00
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "portfolio": {
    "quantity": 15,
    "purchasePrice": 160.00
  }
}
```

---

## Delete Investment

Remove an investment from portfolio.

### Endpoint

```
DELETE /api/portfolios/:id
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Investment deleted successfully"
}
```

---

## Refresh Prices

Update current prices for all investments.

### Endpoint

```
POST /api/portfolios/refresh
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "updated": 5
}
```

---

[[05-API-Reference/Goal-API|← Previous: Goal API]] | [[05-API-Reference|Back to API Reference]] | [[05-API-Reference/Chat-API|Next: Chat API →]]
