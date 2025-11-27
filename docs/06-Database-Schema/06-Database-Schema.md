# Database Schema Overview

FinNuvora uses MongoDB with Mongoose ODM for data modeling.

## Collections

- **users** - User accounts and authentication
- **transactions** - Financial transactions
- **categories** - Transaction categories
- **goals** - Financial goals
- **portfolios** - Investment holdings

## Relationships

```
User (1) ──→ (Many) Transactions
User (1) ──→ (Many) Goals
User (1) ──→ (Many) Portfolios
Transaction (Many) ──→ (1) Category
```

## Data Storage Principles

**Currency:**
- All monetary values stored in USD
- Converted to user currency on display

**Timestamps:**
- All documents have `createdAt` and `updatedAt`
- Automatic via Mongoose timestamps

**Indexing:**
- User email (unique)
- Transaction user + date
- Goal user
- Portfolio user + symbol

## Schema Details

- [[06-Database-Schema/User-Model|User Model]]
- [[06-Database-Schema/Transaction-Model|Transaction Model]]
- [[06-Database-Schema/Category-Model|Category Model]]
- [[06-Database-Schema/Goal-Model|Goal Model]]
- [[06-Database-Schema/Portfolio-Model|Portfolio Model]]

---

[[05-API-Reference|← Previous: API Reference]] | [[README|Back to Index]]
