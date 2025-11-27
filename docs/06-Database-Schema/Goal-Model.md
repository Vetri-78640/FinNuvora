# Goal Model

Complete schema documentation for the Goal collection.

## Schema Definition

```javascript
const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: {
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
- **Description:** ID of the user who owns this goal
- **Relationship:** Many-to-One with User
- **Example:** "507f1f77bcf86cd799439011"

### name
- **Type:** String
- **Required:** Yes
- **Description:** Name/description of the financial goal
- **Validation:** 2-100 characters, trimmed
- **Example:** "Emergency Fund"

### targetAmount
- **Type:** Number
- **Required:** Yes
- **Description:** Target amount to save (in USD)
- **Note:** Always stored in USD, converted for display
- **Validation:** Must be positive number
- **Example:** 10000.00

### currentAmount
- **Type:** Number
- **Required:** No
- **Default:** 0
- **Description:** Current amount saved towards goal (in USD)
- **Note:** Always stored in USD, converted for display
- **Example:** 2500.00

### deadline
- **Type:** Date
- **Required:** Yes
- **Description:** Target date to achieve the goal
- **Validation:** Must be in the future
- **Example:** "2025-12-31T00:00:00.000Z"

## Timestamps

- **createdAt:** Date when goal was created
- **updatedAt:** Date when goal was last modified

## Virtual Fields

### progress
Calculated percentage of goal completion:

```javascript
GoalSchema.virtual('progress').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});
```

### remaining
Calculated remaining amount:

```javascript
GoalSchema.virtual('remaining').get(function() {
  return this.targetAmount - this.currentAmount;
});
```

### daysRemaining
Calculated days until deadline:

```javascript
GoalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
```

## Indexes

```javascript
GoalSchema.index({ user: 1 });
GoalSchema.index({ user: 1, deadline: 1 });
```

## Example Document

```json
{
  "_id": "507f191e810c19729de860ea",
  "user": "507f1f77bcf86cd799439011",
  "name": "Emergency Fund",
  "targetAmount": 10000.00,
  "currentAmount": 2500.00,
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-11-26T10:30:00.000Z",
  "progress": 25,
  "remaining": 7500.00,
  "daysRemaining": 400
}
```

## Currency Handling

All amounts stored in USD:

```javascript
// On create (convert from user currency to USD)
const targetUSD = convertToUSD(inputTarget, user.currency);
goal.targetAmount = targetUSD;

// On display (convert from USD to user currency)
const displayTarget = convertFromUSD(goal.targetAmount, user.currency);
const displayCurrent = convertFromUSD(goal.currentAmount, user.currency);
```

## Business Logic

### Update Progress

```javascript
POST /api/goals/:id/progress

{
  "amount": 500  // In user's currency
}

// Convert to USD and add to current amount
const amountUSD = convertToUSD(500, user.currency);
goal.currentAmount += amountUSD;
```

### Completion Check

```javascript
GoalSchema.methods.isCompleted = function() {
  return this.currentAmount >= this.targetAmount;
};
```

### Status

```javascript
GoalSchema.methods.getStatus = function() {
  if (this.currentAmount >= this.targetAmount) {
    return 'completed';
  } else if (new Date() > this.deadline) {
    return 'overdue';
  } else {
    return 'in_progress';
  }
};
```

## Validation

- Target amount must be positive
- Current amount cannot exceed target amount
- Deadline must be in the future (on creation)
- Name cannot be empty

## Common Queries

### Get Active Goals

```javascript
Goal.find({
  user: userId,
  currentAmount: { $lt: '$targetAmount' },
  deadline: { $gte: new Date() }
});
```

### Get Completed Goals

```javascript
Goal.find({
  user: userId,
  currentAmount: { $gte: '$targetAmount' }
});
```

### Get Overdue Goals

```javascript
Goal.find({
  user: userId,
  currentAmount: { $lt: '$targetAmount' },
  deadline: { $lt: new Date() }
});
```

---

[[06-Database-Schema/Category-Model|← Previous: Category Model]] | [[06-Database-Schema|Back to Database Schema]] | [[06-Database-Schema/Portfolio-Model|Next: Portfolio Model →]]
