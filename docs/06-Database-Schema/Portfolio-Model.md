# Portfolio Model

Complete schema documentation for the Portfolio collection.

## Schema Definition

```javascript
const PortfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
```

## Fields

### user
- **Type:** ObjectId (Reference to User)
- **Required:** Yes
- **Description:** ID of the user who owns this investment
- **Relationship:** Many-to-One with User
- **Example:** "507f1f77bcf86cd799439011"

### symbol
- **Type:** String
- **Required:** Yes
- **Description:** Stock ticker symbol or cryptocurrency code
- **Validation:** Uppercase, trimmed
- **Example:** "AAPL", "BTC", "TSLA"

### quantity
- **Type:** Number
- **Required:** Yes
- **Description:** Number of shares/units owned
- **Validation:** Must be positive number
- **Example:** 10

### purchasePrice
- **Type:** Number
- **Required:** Yes
- **Description:** Price per share/unit at purchase (in USD)
- **Example:** 150.00

### currentPrice
- **Type:** Number
- **Required:** No
- **Default:** 0
- **Description:** Current market price per share/unit (in USD)
- **Note:** Updated via Alpha Vantage API
- **Example:** 175.00

### lastUpdated
- **Type:** Date
- **Required:** No
- **Default:** Current date/time
- **Description:** When current price was last updated
- **Example:** "2024-11-26T10:30:00.000Z"

## Timestamps

- **createdAt:** Date when investment was added
- **updatedAt:** Date when investment was last modified

## Virtual Fields

### totalValue
Calculated total current value:

```javascript
PortfolioSchema.virtual('totalValue').get(function() {
  return this.quantity * this.currentPrice;
});
```

### totalCost
Calculated total purchase cost:

```javascript
PortfolioSchema.virtual('totalCost').get(function() {
  return this.quantity * this.purchasePrice;
});
```

### gain
Calculated gain/loss amount:

```javascript
PortfolioSchema.virtual('gain').get(function() {
  return this.totalValue - this.totalCost;
});
```

### gainPercent
Calculated gain/loss percentage:

```javascript
PortfolioSchema.virtual('gainPercent').get(function() {
  return ((this.gain / this.totalCost) * 100).toFixed(2);
});
```

## Indexes

```javascript
PortfolioSchema.index({ user: 1 });
PortfolioSchema.index({ user: 1, symbol: 1 }, { unique: true });
```

- **user:** Fast queries for user's portfolio
- **user + symbol:** Prevent duplicate symbols per user

## Example Document

```json
{
  "_id": "507f191e810c19729de860ea",
  "user": "507f1f77bcf86cd799439011",
  "symbol": "AAPL",
  "quantity": 10,
  "purchasePrice": 150.00,
  "currentPrice": 175.00,
  "lastUpdated": "2024-11-26T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-11-26T10:30:00.000Z",
  "totalValue": 1750.00,
  "totalCost": 1500.00,
  "gain": 250.00,
  "gainPercent": "16.67"
}
```

## Price Updates

### Alpha Vantage Integration

Prices updated via Alpha Vantage API:

```javascript
const updatePrice = async (symbol) => {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
  );
  
  const data = await response.json();
  const price = parseFloat(data['Global Quote']['05. price']);
  
  await Portfolio.updateMany(
    { symbol },
    { 
      currentPrice: price,
      lastUpdated: new Date()
    }
  );
};
```

### Refresh All Prices

```javascript
POST /api/portfolios/refresh

// Updates all portfolio items with latest prices
```

## Business Logic

### Add Investment

```javascript
POST /api/portfolios

{
  "symbol": "AAPL",
  "quantity": 10,
  "purchasePrice": 150.00
}

// Fetches current price from API
// Creates portfolio entry
```

### Update Quantity

```javascript
PUT /api/portfolios/:id

{
  "quantity": 15
}

// Updates quantity
// Recalculates totals
```

### Calculate Portfolio Value

```javascript
const totalValue = await Portfolio.aggregate([
  { $match: { user: userId } },
  { 
    $group: {
      _id: null,
      total: { 
        $sum: { 
          $multiply: ['$quantity', '$currentPrice'] 
        } 
      }
    }
  }
]);
```

## Validation

- Symbol must be valid ticker
- Quantity must be positive
- Purchase price must be positive
- Cannot have duplicate symbols per user

## Common Queries

### Get User's Portfolio

```javascript
Portfolio.find({ user: userId })
  .sort({ totalValue: -1 });
```

### Get Top Performers

```javascript
Portfolio.find({ user: userId })
  .sort({ gainPercent: -1 })
  .limit(5);
```

### Get Total Portfolio Value

```javascript
const portfolios = await Portfolio.find({ user: userId });
const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
```

## Future Enhancements

- Support for multiple asset types (stocks, crypto, bonds)
- Historical price tracking
- Dividend tracking
- Portfolio rebalancing suggestions
- Risk analysis

---

[[06-Database-Schema/Goal-Model|← Previous: Goal Model]] | [[06-Database-Schema|Back to Database Schema]]
