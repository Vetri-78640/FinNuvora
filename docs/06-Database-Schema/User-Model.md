# User Model

Complete schema documentation for the User collection.

## Schema Definition

```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    default: 'USD'
  },
  plaidAccessToken: {
    type: String,
    default: null
  },
  plaidItemId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});
```

## Fields

### name
- **Type:** String
- **Required:** Yes
- **Description:** User's full name
- **Validation:** 2-50 characters, trimmed
- **Example:** "John Doe"

### email
- **Type:** String
- **Required:** Yes
- **Unique:** Yes
- **Description:** User's email address (used for login)
- **Validation:** Valid email format, lowercase, trimmed
- **Example:** "john@example.com"

### password
- **Type:** String
- **Required:** Yes
- **Description:** Hashed password (bcrypt with 10 salt rounds)
- **Security:** Never returned in API responses
- **Example:** "$2b$10$..."

### accountBalance
- **Type:** Number
- **Required:** No
- **Default:** 0
- **Description:** Current account balance in USD
- **Note:** Always stored in USD, converted for display
- **Example:** 1500.00

### currency
- **Type:** String
- **Required:** No
- **Default:** "USD"
- **Enum:** ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
- **Description:** User's preferred currency for display
- **Example:** "INR"

### plaidAccessToken
- **Type:** String
- **Required:** No
- **Default:** null
- **Description:** Encrypted Plaid access token for bank integration
- **Security:** Encrypted in database
- **Example:** "access-sandbox-xxx"

### plaidItemId
- **Type:** String
- **Required:** No
- **Default:** null
- **Description:** Plaid item ID for connected bank account
- **Example:** "item-xxx"

## Timestamps

Automatically managed by Mongoose:

- **createdAt:** Date when user registered
- **updatedAt:** Date when user was last modified

## Indexes

```javascript
UserSchema.index({ email: 1 }, { unique: true });
```

- **email:** Unique index for fast lookups and uniqueness constraint

## Methods

### Password Hashing (Pre-save Hook)

```javascript
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### Password Comparison

```javascript
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

## Relationships

- **One-to-Many** with Transactions
- **One-to-Many** with Goals
- **One-to-Many** with Portfolios

## Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$...",
  "accountBalance": 1500.00,
  "currency": "USD",
  "plaidAccessToken": "access-sandbox-xxx",
  "plaidItemId": "item-xxx",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-11-26T10:30:00.000Z"
}
```

## Security Considerations

- Password is hashed before storage
- Password never included in API responses
- Plaid tokens encrypted in database
- Email is unique and indexed
- JWT tokens expire after 7 days

---

[[06-Database-Schema|← Back to Database Schema]] | [[06-Database-Schema/Transaction-Model|Next: Transaction Model →]]
