# API Reference Overview

Complete API documentation for FinNuvora backend.

## Base URL

```
Development: http://localhost:4000
Production: https://api.finnuvora.com (planned)
```

## Authentication

All protected endpoints require JWT authentication:

```javascript
Headers:
Authorization: Bearer {your_jwt_token}
```

## Response Format

All API responses follow this structure:

```javascript
{
  "success": true | false,
  "data": { /* response data */ },
  "message": "Success message",
  "error": "Error message (if failed)"
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Rate Limiting

- **Auth endpoints:** 5 requests per 15 minutes
- **Other endpoints:** 100 requests per 15 minutes

## API Sections

- [[05-API-Reference/Auth-API|Authentication API]]
- [[05-API-Reference/Transaction-API|Transaction API]]
- [[05-API-Reference/User-API|User API]]
- [[05-API-Reference/Goal-API|Goal API]]
- [[05-API-Reference/Portfolio-API|Portfolio API]]
- [[05-API-Reference/Chat-API|Chat API]]
- [[05-API-Reference/Plaid-API|Plaid API]]

---

[[04-Features/Portfolio|← Previous: Portfolio]] | [[README|Back to Index]]
