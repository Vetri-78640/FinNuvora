# Bank Integration

Complete guide to FinNuvora's automatic bank account integration powered by Plaid.

## Overview

Bank integration allows users to securely connect their bank accounts and automatically import transactions. This eliminates manual entry and ensures accurate, up-to-date financial data.

## Powered by Plaid

FinNuvora uses [Plaid](https://plaid.com/) for bank connectivity:

- **11,000+ institutions** supported
- **Bank-level security** with encryption
- **OAuth authentication** for secure access
- **Read-only access** (cannot move money)
- **Automatic syncing** of transactions

## How It Works

### Connection Flow

```
1. User clicks "Connect Bank"
   ↓
2. Plaid Link modal opens
   ↓
3. User searches for their bank
   ↓
4. User enters bank credentials
   ↓
5. Bank authenticates user
   ↓
6. Plaid returns public token
   ↓
7. Backend exchanges for access token
   ↓
8. Access token stored securely
   ↓
9. Transactions synced automatically
```

### Security Model

**User Credentials:**
- Never stored by FinNuvora
- Sent directly to bank via Plaid
- Encrypted in transit

**Access Tokens:**
- Encrypted in database
- Used only for transaction sync
- Can be revoked anytime

**Permissions:**
- Read-only access
- Cannot initiate transfers
- Cannot modify account settings

## Connecting a Bank Account

### Step 1: Initiate Connection

Click "Connect Bank" button on dashboard:

```javascript
// Frontend initiates connection
const handleConnect = async () => {
  const { data } = await plaidAPI.createLinkToken();
  setLinkToken(data.link_token);
  // Plaid Link opens
};
```

### Step 2: Select Institution

Search for your bank in Plaid Link:

- Search by name
- Browse popular banks
- Filter by country/region

### Step 3: Authenticate

Enter your bank credentials:

- Username/email
- Password
- Multi-factor authentication (if required)

**Note:** Credentials go directly to your bank, not FinNuvora.

### Step 4: Select Accounts

Choose which accounts to connect:

- Checking accounts
- Savings accounts
- Credit cards
- Investment accounts

### Step 5: Confirm

Review permissions and confirm:

- Read transaction history
- Read account balances
- Read account details

### Step 6: Complete

Connection established:

```javascript
// Backend receives public token
POST /api/plaid/set_access_token

Body:
{
  "public_token": "public-sandbox-xxx"
}

// Backend exchanges for access token
const response = await plaidClient.itemPublicTokenExchange({
  public_token: publicToken
});

// Store access token
user.plaidAccessToken = response.data.access_token;
user.plaidItemId = response.data.item_id;
await user.save();
```

## Transaction Syncing

### Automatic Sync

Transactions sync automatically when:

- Bank account first connected
- User clicks "Sync Now"
- Scheduled sync runs (planned feature)

### Sync Process

```javascript
POST /api/plaid/sync_transactions

Process:
1. Fetch transactions from Plaid (last 90 days)
2. Check for duplicates
3. AI categorizes each transaction
4. Convert currency if needed
5. Create transactions in database
6. Update account balance
7. Return sync summary
```

### Sync Response

```javascript
{
  "success": true,
  "added": 15,
  "updated": 2,
  "removed": 0,
  "message": "Synced 15 new transactions"
}
```

### Duplicate Detection

Prevents duplicate transactions:

```javascript
// Check if transaction already exists
const exists = await Transaction.findOne({
  user: userId,
  date: plaidTransaction.date,
  amount: Math.abs(plaidTransaction.amount),
  description: plaidTransaction.name
});

if (exists) {
  // Skip duplicate
  continue;
}
```

## Transaction Processing

### Data Mapping

Plaid transaction → FinNuvora transaction:

```javascript
{
  // Plaid data
  amount: -50.00,           // Negative = expense
  name: "Starbucks",
  date: "2024-11-25",
  category: ["Food and Drink", "Restaurants"],
  iso_currency_code: "USD"
}

// Mapped to FinNuvora
{
  amount: 50.00,            // Stored as positive
  type: "expense",          // Derived from sign
  description: "Starbucks",
  date: "2024-11-25",
  category: "Food & Dining" // AI categorized
}
```

### AI Categorization

Each imported transaction is categorized by AI:

```javascript
const categorizeTransaction = async (description) => {
  const prompt = `
    Categorize this transaction: "${description}"
    
    Available categories:
    - Food & Dining
    - Transportation
    - Shopping
    - Entertainment
    - Bills & Utilities
    - Healthcare
    - Education
    
    Return only the category name.
  `;
  
  const category = await geminiAPI.generate(prompt);
  return category;
};
```

### Currency Conversion

If bank account is in different currency:

```javascript
// Transaction from Indian bank account
{
  amount: 5000,
  iso_currency_code: "INR"
}

// Convert to USD for storage
const amountUSD = convertToUSD(5000, "INR");
// Result: ~$60.12

// Store in database
transaction.amount = amountUSD;

// Display to user in their currency
const displayAmount = convertFromUSD(amountUSD, user.currency);
// Result: ₹5,000 (if user currency is INR)
```

## Supported Institutions

**Important:** Plaid currently supports banks in **North America and Europe only**.

### United States

- Chase
- Bank of America
- Wells Fargo
- Citibank
- Capital One
- US Bank
- PNC Bank
- TD Bank
- And thousands more

### Canada

- Royal Bank of Canada (RBC)
- TD Canada Trust
- Scotiabank
- Bank of Montreal (BMO)
- CIBC
- And more

### United Kingdom

- HSBC
- Barclays
- Lloyds
- NatWest
- Santander UK
- And more

### Europe

- Deutsche Bank (Germany)
- BNP Paribas (France)
- ING (Netherlands)
- And more European banks

### Account Types

- Checking accounts
- Savings accounts
- Credit cards
- Money market accounts
- Investment accounts (limited)

**Note:** Indian banks and other Asian/African/South American banks are not currently supported. Alternative solutions for these regions are being explored for future updates.

## Managing Connected Accounts

### View Connected Accounts

```javascript
GET /api/user/profile

Response:
{
  "user": {
    "plaidAccessToken": "access-sandbox-xxx",
    "plaidItemId": "item-xxx",
    "connectedBank": "Chase",
    "lastSync": "2024-11-26T10:30:00.000Z"
  }
}
```

### Disconnect Account

```javascript
POST /api/plaid/disconnect

Process:
1. Remove access token from database
2. Optionally delete imported transactions
3. Update user profile
```

### Reconnect Account

If connection expires or fails:

1. Click "Reconnect Bank"
2. Re-authenticate with bank
3. New access token issued
4. Syncing resumes

## Sandbox Testing

### Test Credentials

For development and testing, use Plaid Sandbox:

**Institution:** Any bank  
**Username:** `user_good`  
**Password:** `pass_good`

**Test Scenarios:**

```
user_good / pass_good    → Successful connection
user_bad / pass_bad      → Invalid credentials
user_locked / pass_good  → Account locked
```

### Test Data

Sandbox provides fake transactions:

- Consistent test data
- Various transaction types
- Different categories
- Multiple date ranges

## API Reference

### Create Link Token

```javascript
POST /api/plaid/create_link_token

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "link_token": "link-sandbox-xxx",
  "expiration": "2024-11-26T11:00:00.000Z"
}
```

### Exchange Public Token

```javascript
POST /api/plaid/set_access_token

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "public_token": "public-sandbox-xxx"
}

Response:
{
  "success": true,
  "message": "Bank account connected successfully"
}
```

### Sync Transactions

```javascript
POST /api/plaid/sync_transactions

Headers:
Authorization: Bearer {token}

Response:
{
  "success": true,
  "added": 15,
  "updated": 2,
  "removed": 0,
  "message": "Synced 15 new transactions"
}
```

## Best Practices

### Security

- Never share Plaid credentials
- Use strong bank passwords
- Enable 2FA on bank account
- Review connected apps regularly
- Disconnect unused connections

### Syncing

- Sync regularly (weekly recommended)
- Review imported transactions
- Verify categorization
- Check for duplicates
- Reconcile with bank statements

### Troubleshooting

- Reconnect if sync fails
- Check bank account status
- Verify credentials are current
- Contact support if issues persist

## Common Issues

### "Connection failed"

**Cause:** Invalid credentials or bank issues

**Solution:**
- Verify username and password
- Check if bank account is locked
- Try reconnecting
- Contact bank if problem persists

### "Sync failed"

**Cause:** Expired access token or bank changes

**Solution:**
- Click "Reconnect Bank"
- Re-authenticate with bank
- New access token will be issued

### "Duplicate transactions"

**Cause:** Manual entry before sync

**Solution:**
- Delete manual duplicates
- Let Plaid handle future transactions
- Use filters to identify duplicates

### "Wrong currency"

**Cause:** Bank account in different currency

**Solution:**
- Transactions automatically converted
- Verify user currency setting is correct
- Check exchange rates in settings

## Limitations

### Current Limitations

- Manual sync only (no automatic scheduling)
- 90-day transaction history
- No real-time balance updates
- Limited investment account support
- Sandbox mode only (production pending)

### Planned Improvements

- Automatic daily syncing
- Real-time balance updates
- Extended transaction history
- Multiple bank account support
- Investment account integration
- Bill payment detection
- Recurring transaction detection

## Privacy & Data

### What Plaid Accesses

- Transaction history
- Account balances
- Account details (name, type, number)
- Routing numbers

### What Plaid Cannot Do

- Initiate transfers
- Modify account settings
- Access personal information beyond financial data
- Share data without permission

### Data Retention

- Access tokens stored encrypted
- Transactions stored indefinitely
- Can delete all data anytime
- Disconnecting removes access token

## Support

### Plaid Support

For Plaid-specific issues:
- [Plaid Help Center](https://support.plaid.com/)
- [Plaid Status](https://status.plaid.com/)

### FinNuvora Support

For integration issues:
- Check documentation
- Review error messages
- Contact support team

---

[[04-Features/AI-Assistant|← Previous: AI Assistant]] | [[README|Back to Index]] | [[04-Features/Multi-Currency|Next: Multi-Currency →]]
