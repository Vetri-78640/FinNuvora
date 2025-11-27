# Portfolio Management

Complete guide to FinNuvora's investment portfolio tracking.

## Overview

Track your investments including stocks, cryptocurrencies, and other assets. Monitor performance, view allocation, and analyze returns.

## Adding Investments

```javascript
POST /api/portfolios

Request Body:
{
  "symbol": "AAPL",
  "quantity": 10,
  "purchasePrice": 150.00
}

Response:
{
  "success": true,
  "portfolio": {
    "symbol": "AAPL",
    "quantity": 10,
    "purchasePrice": 150.00,
    "currentPrice": 175.00,
    "totalValue": 1750.00,
    "gain": 250.00,
    "gainPercent": 16.67
  }
}
```

## Features

- Real-time stock prices (Alpha Vantage API)
- Performance tracking
- Asset allocation charts
- Gain/loss calculations

---

[[04-Features/Goals|← Previous: Goals]] | [[README|Back to Index]] | [[05-API-Reference/Auth-API|Next: API Reference →]]
