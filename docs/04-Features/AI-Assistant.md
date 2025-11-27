# AI Financial Assistant

Complete guide to FinNuvora's intelligent AI assistant powered by Google Gemini.

## Overview

The AI Financial Assistant is FinNuvora's most powerful feature. It analyzes your financial data, provides personalized advice, and can execute actions automatically through natural language commands.

## Capabilities

### Conversational Interface

Chat naturally with the AI about your finances:

```
You: "How much did I spend on food last month?"
AI: "You spent $450 on food last month, which is 15% more than the previous month."

You: "Should I be worried?"
AI: "Your food spending is slightly elevated but still within a reasonable range..."
```

### Action Execution

The AI can perform tasks automatically:

**Create Transactions:**
```
You: "I spent 50 dollars on groceries"
AI: "I've added your grocery expense of $50."
```

**Set Goals:**
```
You: "I want to save 5000 dollars for a vacation by next summer"
AI: "I've created a vacation savings goal of $5,000 with a deadline of June 2025."
```

**Analyze Spending:**
```
You: "Where am I spending too much?"
AI: "Your top spending categories are: Entertainment ($300), Dining Out ($250)..."
```

### Personalized Advice

The AI provides context-aware financial guidance:

- Spending pattern analysis
- Budget recommendations
- Savings strategies
- Investment insights
- Debt management tips

## How It Works

### Request Flow

```
1. User sends message
   ↓
2. Frontend sends to /api/chat
   ↓
3. Backend constructs prompt with user context
   ↓
4. Gemini API generates response
   ↓
5. Response parsed for actions
   ↓
6. Actions executed (if any)
   ↓
7. Response sent to user
```

### Context Building

The AI receives comprehensive context about your finances:

```javascript
{
  user: {
    name: "John Doe",
    currency: "USD",
    accountBalance: 1500.00
  },
  recentTransactions: [
    { amount: 50, category: "Food", date: "2024-11-25" },
    // ... last 10 transactions
  ],
  monthlyStats: {
    income: 3000,
    expenses: 1800,
    topCategory: "Food"
  },
  goals: [
    { name: "Emergency Fund", target: 10000, current: 2500 }
  ]
}
```

### Prompt Engineering

The system prompt guides AI behavior:

```javascript
const systemPrompt = `
You are FinNuvora's AI financial advisor for ${user.name}.

CRITICAL RULES:
1. ALL amounts must be in ${user.currency}
2. Provide actionable, specific advice
3. Be professional but friendly
4. Focus on saving and investing strategies
5. Never output raw JSON to the user

CURRENT FINANCIAL CONTEXT:
- Balance: ${formatCurrency(balance, currency)}
- Monthly Income: ${formatCurrency(income, currency)}
- Monthly Expenses: ${formatCurrency(expenses, currency)}
- Top Spending: ${topCategory}

AVAILABLE ACTIONS:
- create_transaction: Add income/expense
- create_goal: Set financial goal
- update_budget: Modify budget

When executing actions, return:
{
  "response": "Human-readable message",
  "action": "action_name",
  "data": { /* action parameters */ }
}
`;
```

## Supported Actions

### Create Transaction

**User Input:**
```
"I spent 50 dollars on groceries"
"Add income of 3000 from salary"
"I bought stocks worth 500"
```

**AI Response:**
```json
{
  "response": "I've added your grocery expense of $50.",
  "action": "create_transaction",
  "data": {
    "amount": 50,
    "type": "expense",
    "category": "Groceries",
    "description": "Groceries"
  }
}
```

### Create Goal

**User Input:**
```
"I want to save 5000 for vacation"
"Help me save for a car, target 20000"
```

**AI Response:**
```json
{
  "response": "I've created a vacation savings goal of $5,000.",
  "action": "create_goal",
  "data": {
    "name": "Vacation",
    "targetAmount": 5000,
    "deadline": "2025-06-01"
  }
}
```

### Analyze Spending

**User Input:**
```
"How much did I spend on food?"
"What's my biggest expense category?"
"Am I spending too much?"
```

**AI Response:**
```json
{
  "response": "You spent $450 on food last month, which is 15% more than the previous month. Your biggest expense category is Entertainment at $300. Consider reducing dining out to improve your savings rate.",
  "action": null,
  "data": null
}
```

## Usage Examples

### Financial Analysis

```
User: "Give me a summary of my finances"

AI: "Here's your financial overview:

Current Balance: $1,500
Monthly Income: $3,000
Monthly Expenses: $1,800
Savings Rate: 40%

Top Spending Categories:
1. Food & Dining: $450
2. Transportation: $300
3. Entertainment: $250

You're doing well with a 40% savings rate! Consider setting up automatic transfers to a savings account to maintain this momentum."
```

### Budget Advice

```
User: "How can I save more money?"

AI: "Based on your spending patterns, here are three ways to save more:

1. Reduce dining out: You spent $200 on restaurants last month. Cooking at home 2-3 more times per week could save you $80-100.

2. Review subscriptions: I notice recurring charges for streaming services ($45/month). Consider which ones you actually use.

3. Transportation: Your Uber spending is $150/month. Using public transit or carpooling could cut this in half.

Implementing these could save you $200-250 per month, or $2,400-3,000 annually!"
```

### Goal Planning

```
User: "I want to buy a house in 3 years"

AI: "Great goal! Let's plan this out:

For a typical down payment (20% of median home price in your area):
Target: $60,000
Timeline: 3 years (36 months)
Monthly savings needed: $1,667

Your current savings rate is $1,200/month, so you'll need to increase savings by $467/month.

Would you like me to create this as a goal and suggest ways to increase your monthly savings?"
```

### Investment Insights

```
User: "Should I invest in stocks?"

AI: "Investing in stocks can be a good way to build wealth, but let's consider your situation:

Pros for you:
- You have a stable income
- Your emergency fund is at $2,500 (good start)
- You're 28 years old (long time horizon)

Before investing:
1. Build emergency fund to 6 months expenses ($10,800)
2. Pay off any high-interest debt
3. Ensure you have stable income

Once ready, consider:
- Low-cost index funds (S&P 500)
- Diversified portfolio (stocks + bonds)
- Dollar-cost averaging (invest regularly)

Would you like me to create a goal for building your emergency fund first?"
```

## API Reference

### Send Message

```javascript
POST /api/chat

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "message": "How much did I spend on food last month?"
}

Response:
{
  "success": true,
  "response": "You spent $450 on food last month...",
  "action": null,
  "data": null
}
```

### With Action Execution

```javascript
POST /api/chat

Body:
{
  "message": "I spent 50 dollars on groceries"
}

Response:
{
  "success": true,
  "response": "I've added your grocery expense of $50.",
  "action": "create_transaction",
  "data": {
    "transactionId": "507f191e810c19729de860ea"
  }
}
```

## Chat Interface

### Message Display

**User Messages:**
- Right-aligned
- Blue background
- User avatar

**AI Messages:**
- Left-aligned
- Dark background
- AI avatar
- Markdown formatting
- Code syntax highlighting

### Features

**Markdown Support:**
- **Bold** and *italic* text
- Lists (numbered and bulleted)
- Code blocks with syntax highlighting
- Links

**Auto-scroll:**
- Automatically scrolls to latest message
- Smooth scrolling animation

**Loading States:**
- Typing indicator while AI responds
- Disabled input during processing

**Error Handling:**
- Clear error messages
- Retry functionality

## Best Practices

### Effective Prompts

**Be Specific:**
```
❌ "Tell me about my spending"
✅ "How much did I spend on food last month?"
```

**Provide Context:**
```
❌ "Should I invest?"
✅ "I have $5000 saved. Should I invest in stocks or keep saving?"
```

**Ask Follow-ups:**
```
"How can I reduce my food expenses?"
→ "Which specific changes would have the biggest impact?"
```

### Action Commands

**Clear Intent:**
```
✅ "I spent 50 dollars on groceries"
✅ "Add income of 3000 from salary"
✅ "Create a goal to save 5000 for vacation"
```

**Avoid Ambiguity:**
```
❌ "I bought something"
❌ "Add money"
```

## Limitations

### Current Limitations

- No memory of previous conversations (each message is independent)
- Cannot access external data (stock prices, news)
- Cannot modify existing transactions (only create new ones)
- Limited to predefined actions
- No image/file analysis in chat

### Planned Improvements

- Conversation history and context
- Multi-turn conversations
- More action types (edit, delete)
- Proactive insights and alerts
- Voice input/output
- Image analysis (receipts, bills)

## Privacy & Security

### Data Usage

- Messages are sent to Google Gemini API
- Financial data included in context
- No conversation history stored
- No data shared with third parties

### Security Measures

- All requests authenticated with JWT
- Rate limiting on chat endpoint
- Input sanitization
- Action validation before execution

## Troubleshooting

### AI Not Responding

**Cause:** API key issue or rate limiting

**Solution:**
- Check `GEMINI_API_KEY` in `.env`
- Verify API key is valid
- Check rate limits on Gemini dashboard

### Incorrect Currency

**Cause:** User currency not set

**Solution:**
- Update currency in profile settings
- AI will use correct currency in responses

### Action Not Executing

**Cause:** Invalid action data or permissions

**Solution:**
- Ensure action data is complete
- Check user has permission for action
- Review backend logs for errors

## Future Enhancements

- Predictive analytics and forecasting
- Anomaly detection (unusual spending)
- Automated budget adjustments
- Bill payment reminders
- Investment portfolio optimization
- Tax planning assistance
- Debt payoff strategies
- Retirement planning

---

[[04-Features/Transactions|← Previous: Transactions]] | [[README|Back to Index]] | [[04-Features/Bank-Integration|Next: Bank Integration →]]
