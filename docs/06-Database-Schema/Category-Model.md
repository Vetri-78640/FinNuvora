# Category Model

Complete schema documentation for the Category collection.

## Schema Definition

```javascript
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'investment'],
    required: true
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
}, {
  timestamps: true
});
```

## Fields

### name
- **Type:** String
- **Required:** Yes
- **Unique:** Yes
- **Description:** Category name
- **Validation:** 2-50 characters, trimmed
- **Example:** "Food & Dining"

### type
- **Type:** String
- **Required:** Yes
- **Enum:** ['income', 'expense', 'investment']
- **Description:** Type of transactions this category is for
- **Example:** "expense"

### icon
- **Type:** String
- **Required:** No
- **Default:** "folder"
- **Description:** Icon name (Lucide React icon)
- **Example:** "utensils" (for food category)

### color
- **Type:** String
- **Required:** No
- **Default:** "#3b82f6" (blue)
- **Description:** Hex color code for category badge
- **Example:** "#ef4444" (red for expenses)

## Timestamps

- **createdAt:** Date when category was created
- **updatedAt:** Date when category was last modified

## Indexes

```javascript
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ type: 1 });
```

## Default Categories

### Income Categories

```json
[
  { "name": "Salary", "type": "income", "icon": "briefcase", "color": "#10b981" },
  { "name": "Freelance", "type": "income", "icon": "laptop", "color": "#10b981" },
  { "name": "Investments", "type": "income", "icon": "trending-up", "color": "#10b981" },
  { "name": "Gifts", "type": "income", "icon": "gift", "color": "#10b981" },
  { "name": "Other Income", "type": "income", "icon": "plus-circle", "color": "#10b981" }
]
```

### Expense Categories

```json
[
  { "name": "Food & Dining", "type": "expense", "icon": "utensils", "color": "#ef4444" },
  { "name": "Transportation", "type": "expense", "icon": "car", "color": "#f59e0b" },
  { "name": "Shopping", "type": "expense", "icon": "shopping-bag", "color": "#8b5cf6" },
  { "name": "Entertainment", "type": "expense", "icon": "film", "color": "#ec4899" },
  { "name": "Bills & Utilities", "type": "expense", "icon": "file-text", "color": "#6366f1" },
  { "name": "Healthcare", "type": "expense", "icon": "heart", "color": "#14b8a6" },
  { "name": "Education", "type": "expense", "icon": "book", "color": "#3b82f6" },
  { "name": "Other Expense", "type": "expense", "icon": "more-horizontal", "color": "#64748b" }
]
```

### Investment Categories

```json
[
  { "name": "Stocks", "type": "investment", "icon": "trending-up", "color": "#3b82f6" },
  { "name": "Cryptocurrency", "type": "investment", "icon": "bitcoin", "color": "#f59e0b" },
  { "name": "Real Estate", "type": "investment", "icon": "home", "color": "#10b981" },
  { "name": "Mutual Funds", "type": "investment", "icon": "pie-chart", "color": "#8b5cf6" },
  { "name": "Other Investment", "type": "investment", "icon": "dollar-sign", "color": "#64748b" }
]
```

## Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Food & Dining",
  "type": "expense",
  "icon": "utensils",
  "color": "#ef4444",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Relationships

- **One-to-Many** with Transactions

## Usage

Categories are used to:
- Organize transactions
- Generate spending reports
- Create budget allocations
- Provide AI categorization
- Display color-coded badges

## Custom Categories

Users can create custom categories:

```javascript
POST /api/categories

{
  "name": "Pet Care",
  "type": "expense",
  "icon": "paw",
  "color": "#f59e0b"
}
```

## Validation

- Name must be unique
- Type must match transaction type
- Color must be valid hex code
- Icon should be valid Lucide icon name

---

[[06-Database-Schema/Transaction-Model|← Previous: Transaction Model]] | [[06-Database-Schema|Back to Database Schema]] | [[06-Database-Schema/Goal-Model|Next: Goal Model →]]
