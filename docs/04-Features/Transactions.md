# Transaction Management

Complete guide to FinNuvora's transaction tracking system.

## Overview

Transactions are the core of FinNuvora. Users can manually create transactions or automatically import them from connected bank accounts. All transactions support multi-currency input and are intelligently categorized.

## Transaction Types

### Income
Money received (salary, freelance, gifts, etc.)
- Increases account balance
- Displayed in green
- Positive impact on financial health

### Expense
Money spent (groceries, rent, entertainment, etc.)
- Decreases account balance
- Displayed in red/orange
- Tracked for budgeting and analysis

### Investment
Money allocated to investments (stocks, crypto, etc.)
- Tracked separately in portfolio
- Neutral to account balance (asset transfer)
- Displayed in blue/purple

## Creating Transactions

### Manual Entry

Users can create transactions through the form:

```javascript
POST /api/transactions

Request Body:
{
  "amount": 50.00,
  "type": "expense",
  "category": "507f1f77bcf86cd799439011",  // Category ID
  "description": "Weekly groceries",
  "date": "2024-11-26"
}

Response:
{
  "success": true,
  "transaction": {
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
}
```

### Automatic Import (Plaid)

Transactions automatically imported from connected banks:

1. User connects bank account
2. Plaid syncs transaction history
3. AI categorizes each transaction
4. Transactions appear in dashboard
5. Account balance updates automatically

### AI-Powered Creation

Users can create transactions via natural language:

```
User: "I spent 50 dollars on groceries"

AI Response: "I've added your grocery expense of $50."

Action Executed:
{
  "action": "create_transaction",
  "data": {
    "amount": 50,
    "type": "expense",
    "category": "Groceries",
    "description": "Groceries"
  }
}
```

## Currency Handling

### Multi-Currency Input

Users can input amounts in their preferred currency:

**Example: User in India**
- Input: ₹5,000
- Stored: $60.12 (converted to USD)
- Displayed: ₹5,000 (converted back)

### Conversion Process

```javascript
// On transaction creation
const amountInUSD = convertToUSD(amount, user.currency);

// Store in database
transaction.amount = amountInUSD;

// On display
const displayAmount = convertFromUSD(
  transaction.amount, 
  user.currency
);
```

### Exchange Rates

Current supported currencies and rates (vs USD):

```javascript
{
  USD: 1.00,
  INR: 83.12,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.52
}
```

## Categories

### Default Categories

**Income:**
- Salary
- Freelance
- Investments
- Gifts
- Other Income

**Expense:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Other Expense

**Investment:**
- Stocks
- Cryptocurrency
- Real Estate
- Mutual Funds
- Other Investment

### Custom Categories

Users can create custom categories:

```javascript
POST /api/categories

Request Body:
{
  "name": "Pet Care",
  "type": "expense"
}
```

### AI Categorization

The AI automatically categorizes transactions based on description:

```javascript
// Examples
"Starbucks" → Food & Dining
"Uber" → Transportation
"Netflix" → Entertainment
"Rent payment" → Bills & Utilities
```

## Viewing Transactions

### Transaction List

All transactions displayed in a table with:
- Date
- Description
- Category (with badge)
- Type (income/expense/investment)
- Amount (in user's currency)
- Actions (edit, delete)

### Filtering

**By Type:**
- All types
- Income only
- Expenses only
- Investments only

**By Category:**
- All categories
- Specific category

**By Date Range:**
- Start date
- End date
- Custom range

**By Search:**
- Search by description
- Real-time filtering

### Sorting

- By date (ascending/descending)
- By amount (ascending/descending)
- By category
- By type

### Pagination

- 10 transactions per page
- Page navigation
- Adjustable page size

## Editing Transactions

Users can edit any transaction field:

```javascript
PUT /api/transactions/:id

Request Body:
{
  "amount": 75.00,
  "type": "expense",
  "category": "507f1f77bcf86cd799439011",
  "description": "Updated description",
  "date": "2024-11-26"
}
```

**Account Balance Update:**
- Old transaction reversed
- New transaction applied
- Balance recalculated

## Deleting Transactions

```javascript
DELETE /api/transactions/:id

Response:
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Account Balance Update:**
- Transaction amount reversed
- Balance updated automatically

## Account Balance Tracking

### Automatic Updates

Balance updates automatically on every transaction operation:

**On Create:**
```javascript
if (type === 'income') {
  user.accountBalance += amountInUSD;
} else if (type === 'expense') {
  user.accountBalance -= amountInUSD;
}
```

**On Update:**
```javascript
// Reverse old transaction
if (oldType === 'income') {
  user.accountBalance -= oldAmount;
} else {
  user.accountBalance += oldAmount;
}

// Apply new transaction
if (newType === 'income') {
  user.accountBalance += newAmount;
} else {
  user.accountBalance -= newAmount;
}
```

**On Delete:**
```javascript
if (type === 'income') {
  user.accountBalance -= amount;
} else {
  user.accountBalance += amount;
}
```

### Balance Display

Balance shown in user's preferred currency:

```javascript
const displayBalance = convertFromUSD(
  user.accountBalance,
  user.currency
);

// Example for Indian user
// Stored: $1,500
// Displayed: ₹1,24,680
```

## Analytics

### Statistics Cards

**Current Balance**
- Total account balance
- Color-coded (green if positive, red if negative)

**Income**
- Total income for selected period
- Percentage change from previous period

**Expenses**
- Total expenses for selected period
- Percentage change from previous period

**Investments**
- Total invested amount
- Portfolio value

**Net**
- Income minus expenses
- Financial health indicator

### Charts

**Spending by Category**
- Pie chart showing expense distribution
- Top spending categories highlighted

**Income vs Expenses**
- Line chart showing trends over time
- Monthly comparison

**Transaction Timeline**
- Bar chart showing daily/weekly/monthly activity

## PDF Receipt Scanner

### Upload Receipt

Users can upload PDF receipts for automatic extraction:

1. Click "Upload Receipt"
2. Select PDF file
3. AI extracts transaction details
4. Review and confirm
5. Transaction created

### AI Extraction

The AI extracts:
- Amount
- Date
- Merchant name
- Category (inferred)

```javascript
POST /api/transactions/upload-receipt

Request: multipart/form-data
- file: PDF receipt

Response:
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

## Bank Statement Import

### Upload Statement

Users can upload bank statements (PDF):

1. Click "Import Bank Statement"
2. Upload PDF statement
3. AI extracts all transactions
4. Review extracted transactions
5. Confirm to import

### Bulk Import

Multiple transactions imported at once:

```javascript
POST /api/transactions/import-statement

Request: multipart/form-data
- file: Bank statement PDF

Response:
{
  "success": true,
  "transactions": [
    {
      "amount": 50.00,
      "description": "Grocery Store",
      "date": "2024-11-20"
    },
    // ... more transactions
  ],
  "count": 15
}
```

## API Reference

### Get All Transactions

```javascript
GET /api/transactions?page=1&limit=10&type=expense&category=507f&startDate=2024-01-01&endDate=2024-12-31&search=grocery&sortBy=date&sortOrder=desc

Response:
{
  "success": true,
  "transactions": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTransactions": 47,
    "limit": 10
  }
}
```

### Get Single Transaction

```javascript
GET /api/transactions/:id

Response:
{
  "success": true,
  "transaction": {
    "id": "507f191e810c19729de860ea",
    "amount": 50.00,
    "type": "expense",
    "category": {...},
    "description": "Weekly groceries",
    "date": "2024-11-26T00:00:00.000Z"
  }
}
```

### Create Transaction

```javascript
POST /api/transactions

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "amount": 50.00,
  "type": "expense",
  "category": "507f1f77bcf86cd799439011",
  "description": "Weekly groceries",
  "date": "2024-11-26"
}
```

### Update Transaction

```javascript
PUT /api/transactions/:id

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "amount": 75.00,
  "description": "Updated description"
}
```

### Delete Transaction

```javascript
DELETE /api/transactions/:id

Headers:
Authorization: Bearer {token}
```

## Best Practices

### Categorization

- Be consistent with category usage
- Use specific categories for better insights
- Create custom categories for unique expenses

### Descriptions

- Use clear, descriptive names
- Include merchant name when relevant
- Add notes for unusual transactions

### Regular Updates

- Log transactions daily for accuracy
- Review and categorize imported transactions
- Reconcile with bank statements monthly

## Common Issues

### "Transaction not found"

**Cause:** Invalid transaction ID or deleted transaction

**Solution:** Verify the transaction exists and ID is correct

### "Category not found"

**Cause:** Invalid category ID

**Solution:** Use a valid category ID from `/api/categories`

### Balance mismatch

**Cause:** Manual database changes or sync issues

**Solution:** Contact support or recalculate balance

## Future Enhancements

- Recurring transactions
- Transaction templates
- Bulk edit/delete
- Advanced search with filters
- Transaction attachments (images)
- Split transactions
- Transaction tags
- Export to CSV/Excel
- Transaction rules and automation

---

[[04-Features/Authentication|← Previous: Authentication]] | [[README|Back to Index]] | [[04-Features/AI-Assistant|Next: AI Assistant →]]
