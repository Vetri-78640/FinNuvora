# Multi-Currency Support

Complete guide to FinNuvora's global multi-currency system.

## Overview

FinNuvora supports users worldwide with seamless multi-currency functionality. Input amounts in your local currency, and the app handles all conversions automatically while maintaining data consistency.

## Supported Currencies

Currently supported currencies:

| Currency | Code | Symbol | Rate (vs USD) |
|----------|------|--------|---------------|
| US Dollar | USD | $ | 1.00 |
| Indian Rupee | INR | ₹ | 83.12 |
| Euro | EUR | € | 0.92 |
| British Pound | GBP | £ | 0.79 |
| Japanese Yen | JPY | ¥ | 149.50 |
| Canadian Dollar | CAD | C$ | 1.36 |
| Australian Dollar | AUD | A$ | 1.52 |

## Architecture: Store Base, Convert on View

### The Principle

All monetary values are stored in USD (base currency) in the database, but displayed in the user's preferred currency.

**Benefits:**
- Consistent data storage
- Easy aggregation and calculations
- Historical accuracy (rates change, stored values don't)
- Simple currency switching

### How It Works

```
User Input (₹5,000)
    ↓
Convert to USD ($60.12)
    ↓
Store in Database ($60.12)
    ↓
Retrieve from Database ($60.12)
    ↓
Convert to User Currency (₹5,000)
    ↓
Display to User (₹5,000)
```

## Currency Selection

### Auto-Detection

On first login, currency is automatically detected:

**Method 1: Geolocation (Primary)**

```javascript
// Request browser location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  // Reverse geocode to get country
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
  );
  
  const { countryCode } = await response.json();
  
  // Map country to currency
  const currencyMap = {
    'IN': 'INR',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'JP': 'JPY',
    'CA': 'CAD',
    'AU': 'AUD',
    'US': 'USD'
  };
  
  const currency = currencyMap[countryCode] || 'USD';
});
```

**Method 2: Timezone (Fallback)**

```javascript
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (timeZone.includes('Kolkata') || timeZone.includes('India')) {
  currency = 'INR';
} else if (timeZone.includes('London')) {
  currency = 'GBP';
} else if (timeZone.includes('Europe')) {
  currency = 'EUR';
}
// ... etc
```

### Manual Selection

Users can change currency anytime in settings:

```javascript
PUT /api/user/profile

Body:
{
  "currency": "INR"
}

Response:
{
  "success": true,
  "user": {
    "currency": "INR"
  }
}
```

## Conversion Functions

### Convert to USD (Storage)

```javascript
// currencyUtils.js
const RATES = {
  USD: 1.00,
  INR: 83.12,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.52
};

export const convertToUSD = (amount, fromCurrency) => {
  if (fromCurrency === 'USD') return amount;
  return amount / RATES[fromCurrency];
};

// Example
convertToUSD(5000, 'INR')  // Returns ~60.12
convertToUSD(100, 'EUR')   // Returns ~108.70
```

### Convert from USD (Display)

```javascript
export const convertFromUSD = (amount, toCurrency) => {
  if (toCurrency === 'USD') return amount;
  return amount * RATES[toCurrency];
};

// Example
convertFromUSD(60.12, 'INR')  // Returns ~5000
convertFromUSD(100, 'EUR')    // Returns ~92
```

### Format Currency

```javascript
export const formatCurrency = (amount, currency) => {
  const symbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  };
  
  return `${symbols[currency]}${amount.toFixed(2)}`;
};

// Example
formatCurrency(5000, 'INR')  // Returns "₹5000.00"
formatCurrency(100, 'USD')   // Returns "$100.00"
```

## Implementation Across Features

### Transactions

**Creating Transaction:**

```javascript
// Frontend: User inputs in their currency
const form = {
  amount: 5000,  // User in India enters ₹5,000
  type: 'expense',
  category: 'Food'
};

// Backend: Convert to USD before storing
const amountInUSD = convertToUSD(form.amount, user.currency);
// amountInUSD = 60.12

const transaction = await Transaction.create({
  user: userId,
  amount: amountInUSD,  // Stored as $60.12
  type: form.type,
  category: form.category
});
```

**Displaying Transaction:**

```javascript
// Backend: Retrieve from database
const transaction = await Transaction.findById(id);
// transaction.amount = 60.12 (USD)

// Frontend: Convert to user currency
const displayAmount = convertFromUSD(
  transaction.amount,
  user.currency
);
// displayAmount = 5000 (INR)

// Display
<div>{formatCurrency(displayAmount, user.currency)}</div>
// Renders: ₹5000.00
```

### Goals

**Creating Goal:**

```javascript
// User sets goal in their currency
const goalData = {
  name: 'Emergency Fund',
  targetAmount: 100000  // ₹1,00,000 for Indian user
};

// Convert to USD for storage
const targetInUSD = convertToUSD(goalData.targetAmount, user.currency);
// targetInUSD = 1202.88

await Goal.create({
  user: userId,
  name: goalData.name,
  targetAmount: targetInUSD,  // Stored as $1,202.88
  currentAmount: 0
});
```

**Displaying Goal:**

```javascript
// Retrieve goal
const goal = await Goal.findById(id);
// goal.targetAmount = 1202.88 (USD)

// Convert for display
const displayTarget = convertFromUSD(goal.targetAmount, user.currency);
// displayTarget = 100000 (INR)

// Calculate progress
const progress = (goal.currentAmount / goal.targetAmount) * 100;
```

### Account Balance

**Updating Balance:**

```javascript
// Transaction in user's currency
const transactionAmount = 5000;  // ₹5,000

// Convert to USD
const amountUSD = convertToUSD(transactionAmount, user.currency);

// Update balance (stored in USD)
if (type === 'income') {
  user.accountBalance += amountUSD;
} else {
  user.accountBalance -= amountUSD;
}
```

**Displaying Balance:**

```javascript
// Balance stored in USD
user.accountBalance = 1500.00

// Convert to user currency
const displayBalance = convertFromUSD(
  user.accountBalance,
  user.currency
);
// displayBalance = 124,680 (for INR user)

// Display
<div>Balance: {formatCurrency(displayBalance, user.currency)}</div>
// Renders: Balance: ₹124,680.00
```

### AI Assistant

The AI receives and responds in user's currency:

```javascript
const prompt = `
You are a financial advisor for ${user.name}.

CRITICAL: ALL amounts must be in ${user.currency}.

Current Balance: ${formatCurrency(balance, user.currency)}
Monthly Income: ${formatCurrency(income, user.currency)}
Monthly Expenses: ${formatCurrency(expenses, user.currency)}

User Question: ${userMessage}
`;
```

**Example:**

```
User (in India): "How much did I spend on food?"

AI: "You spent ₹15,000 on food last month, which is 20% of your monthly expenses."
```

## Currency Context

### Frontend Context

```javascript
// CurrencyContext.js
export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  
  const convertToDisplay = (amountUSD) => {
    return convertFromUSD(amountUSD, currency);
  };
  
  const formatAmount = (amount) => {
    return formatCurrency(amount, currency);
  };
  
  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      convertToDisplay, 
      formatAmount 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Usage in components
const { currency, formatAmount } = useCurrency();
```

## Exchange Rates

### Current Implementation

Exchange rates are automatically fetched from **ExchangeRate-API** (free service):

```javascript
// Fetch latest rates from API
const fetchExchangeRates = async () => {
  const response = await fetch(
    'https://api.exchangerate-api.com/v4/latest/USD'
  );
  const { rates } = await response.json();
  
  RATES = {
    USD: 1,
    INR: rates.INR,
    EUR: rates.EUR,
    GBP: rates.GBP,
    JPY: rates.JPY,
    CAD: rates.CAD,
    AUD: rates.AUD
  };
};
```

**Update Frequency:** Automatic every 24 hours

**Caching:** Rates cached for 24 hours to minimize API calls

**Fallback:** If API fails, uses last cached rates

### API Service

**Provider:** [ExchangeRate-API](https://www.exchangerate-api.com/)

**Features:**
- Free tier available
- No API key required for basic usage
- Updated daily
- Reliable and fast
- Supports 160+ currencies

### Future Improvements

**Historical Rates:**

Store exchange rates with timestamps for accurate historical conversions and trend analysis.

**Premium API:**

Upgrade to premium API for:
- Real-time updates
- Higher rate limits
- Historical data access
- More currencies

## User Experience

### Seamless Switching

Users can switch currencies anytime:

1. Go to Settings
2. Select new currency
3. All amounts update instantly
4. No data loss or conversion issues

### Consistent Display

All monetary values show in user's currency:

- Dashboard balance
- Transaction amounts
- Goal targets
- Chart values
- AI responses
- Export files

### Input Flexibility

Users always input in their currency:

- Transaction forms
- Goal creation
- Budget settings
- Search filters

## Best Practices

### For Users

**Consistent Currency:**
- Choose your primary currency
- Stick with it for consistency
- Only change if relocating

**Verify Conversions:**
- Check converted amounts
- Understand exchange rates
- Review imported transactions

### For Developers

**Always Convert:**
- Convert to USD before storing
- Convert from USD before displaying
- Never store in multiple currencies

**Use Utilities:**
- Use `convertToUSD()` for storage
- Use `convertFromUSD()` for display
- Use `formatCurrency()` for formatting

**Validate Currency:**
- Check currency is supported
- Default to USD if invalid
- Handle missing currency gracefully

## API Reference

### Update User Currency

```javascript
PUT /api/user/profile

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "currency": "INR"
}

Response:
{
  "success": true,
  "user": {
    "currency": "INR"
  }
}
```

### Get Supported Currencies

```javascript
GET /api/currencies

Response:
{
  "success": true,
  "currencies": [
    { "code": "USD", "name": "US Dollar", "symbol": "$" },
    { "code": "INR", "name": "Indian Rupee", "symbol": "₹" },
    // ... more currencies
  ]
}
```

## Common Issues

### "Wrong currency displayed"

**Cause:** User currency not set

**Solution:**
- Update currency in settings
- Refresh page
- Currency auto-detected on next login

### "Conversion seems incorrect"

**Cause:** Outdated exchange rates

**Solution:**
- Exchange rates updated periodically
- Check current rates online
- Contact support if significantly off

### "Can't change currency"

**Cause:** API error or validation issue

**Solution:**
- Ensure currency code is valid
- Check network connection
- Try again later

## Future Enhancements

- Real-time exchange rate API integration
- Historical exchange rate tracking
- Custom exchange rate overrides
- More currency support (50+ currencies)
- Cryptocurrency support
- Multi-currency accounts
- Currency conversion history
- Exchange rate alerts

---

[[04-Features/Bank-Integration|← Previous: Bank Integration]] | [[README|Back to Index]] | [[04-Features/Goals|Next: Goals →]]
