# Goals

Complete guide to FinNuvora's financial goal tracking system.

## Overview

Goals help users save for specific targets like emergency funds, vacations, down payments, or any financial objective. Track progress, set deadlines, and receive AI-powered recommendations.

## Creating Goals

```javascript
POST /api/goals

Request Body:
{
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "deadline": "2025-12-31"
}

Response:
{
  "success": true,
  "goal": {
    "id": "507f191e810c19729de860ea",
    "name": "Emergency Fund",
    "targetAmount": 10000,
    "currentAmount": 0,
    "deadline": "2025-12-31T00:00:00.000Z",
    "progress": 0,
    "createdAt": "2024-11-26T10:30:00.000Z"
  }
}
```

## Tracking Progress

Update goal progress as you save:

```javascript
POST /api/goals/:id/progress

Request Body:
{
  "amount": 500
}

Response:
{
  "success": true,
  "goal": {
    "currentAmount": 500,
    "progress": 5,  // 5% of 10000
    "remaining": 9500
  }
}
```

## Viewing Goals

All goals displayed with:
- Progress bar
- Amount saved vs target
- Days remaining
- Completion percentage

---

[[04-Features/Multi-Currency|← Previous: Multi-Currency]] | [[README|Back to Index]] | [[04-Features/Portfolio|Next: Portfolio →]]
