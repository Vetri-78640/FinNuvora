# Transaction Model

Complete schema documentation for the Transaction collection.

## Schema Definition

```javascript
const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'investment'],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});
```

## Fields

### user
- **Type:** ObjectId (Reference to User)
- **Required:** Yes
- **Description:** ID of the user who owns this transaction
- **Relationship:** Many-to-One with User
- **Example:** "507f1f77bcf86cd799439011"

### amount
- **Type:** Number
- **Required:** Yes
- **Description:** Transaction amount in USD (base currency)
- **Note:** Always stored in USD, converted for display
- **Validation:** Must be positive number
- **Example:** 50.00

### type
- **Type:** String
- **Required:** Yes
- **Enum:** ['income', 'expense', 'investment']
- **Description:** Type of transaction
- **Example:** "expense"

**Types:**
- **income:** Money received (salary, freelance, gifts)
- **expense:** Money spent (groceries, bills, entertainment)
- **investment:** Money invested (stocks, crypto, real estate)

### category
- **Type:** ObjectId (Reference to Category)
- **Required:** Yes
- **Description:** Category this transaction belongs to
- **Relationship:** Many-to-One with Category
- **Example:** "507f1f77bcf86cd799439012"

### description
- **Type:** String
- **Required:** Yes
- **Description:** Description of the transaction
- **Validation:** 1-200 characters, trimmed
- **Example:** "Weekly groceries at Walmart"

### date
- **Type:** Date
- **Required:** Yes
- **Description:** Date when transaction occurred
- **Note:** Can be different from createdAt (when it was logged)
- **Example:** "2024-11-26T00:00:00.000Z"

## Timestamps

Automatically managed by Mongoose:

- **createdAt:** Date when transaction was created in system
- **updatedAt:** Date when transaction was last modified

## Indexes

```javascript
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });
```

- **user + date:** Fast queries for user's transactions by date
- **user + type:** Fast filtering by transaction type
- **user + category:** Fast filtering by category

## Population

When querying, typically populate:

```javascript
Transaction.find({ user: userId })
  .populate('category', 'name type')
  .populate('user', 'name email currency');
```

## Example Document

```json
{
  "_id": "507f191e810c19729de860ea",
  "user": "507f1f77bcf86cd799439011",
  "amount": 50.00,
  "type": "expense",
  "category": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Groceries",
    "type": "expense"
  },
  "description": "Weekly groceries at Walmart",
  "date": "2024-11-26T00:00:00.000Z",
  "createdAt": "2024-11-26T10:30:00.000Z",
  "updatedAt": "2024-11-26T10:30:00.000Z"
}
```

## Business Logic

### Account Balance Updates

When a transaction is created, updated, or deleted, the user's account balance is automatically updated:

**On Create:**
```javascript
if (type === 'income') {
  user.accountBalance += amount;
} else if (type === 'expense') {
  user.accountBalance -= amount;
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

## Currency Handling

All amounts stored in USD:

```javascript
// On create (convert from user currency to USD)
const amountUSD = convertToUSD(inputAmount, user.currency);
transaction.amount = amountUSD;

// On display (convert from USD to user currency)
const displayAmount = convertFromUSD(transaction.amount, user.currency);
```

## Validation

- Amount must be positive
- Type must be one of: income, expense, investment
- Category must exist and belong to correct type
- Date cannot be in future (optional validation)
- Description cannot be empty

---

[[06-Database-Schema/User-Model|← Previous: User Model]] | [[06-Database-Schema|Back to Database Schema]] | [[06-Database-Schema/Category-Model|Next: Category Model →]]
