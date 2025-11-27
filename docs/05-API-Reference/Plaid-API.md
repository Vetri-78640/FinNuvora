# Plaid API

Complete API reference for Plaid bank integration endpoints.

## Create Link Token

Generate a link token to initialize Plaid Link.

### Endpoint

```
POST /api/plaid/create_link_token
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
  "link_token": "link-sandbox-xxx-xxx-xxx",
  "expiration": "2024-11-26T11:00:00.000Z"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to create link token"
}
```

---

## Exchange Public Token

Exchange public token for access token after successful bank connection.

### Endpoint

```
POST /api/plaid/set_access_token
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
  "public_token": "public-sandbox-xxx-xxx-xxx"
}
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Bank account connected successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Public token is required"
}
```

---

## Sync Transactions

Synchronize transactions from connected bank account.

### Endpoint

```
POST /api/plaid/sync_transactions
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
  "added": 15,
  "updated": 2,
  "removed": 0,
  "message": "Synced 15 new transactions"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "No bank account connected"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to sync transactions"
}
```

---

## Disconnect Bank

Remove bank connection and access token.

### Endpoint

```
POST /api/plaid/disconnect
```

### Authentication

**Required:** Yes (JWT token)

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Bank account disconnected successfully"
}
```

---

## Supported Regions

**Important:** Plaid currently supports banks in **North America and Europe only**.

- United States
- Canada
- United Kingdom
- Europe (select countries)

Indian banks and other Asian/African/South American banks are not currently supported.

---

[[05-API-Reference/Chat-API|← Previous: Chat API]] | [[05-API-Reference|Back to API Reference]]
