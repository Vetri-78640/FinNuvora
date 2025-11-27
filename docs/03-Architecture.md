# Architecture Overview

FinNuvora follows a modern full-stack architecture with clear separation between frontend and backend.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js + React)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Contexts   │     │
│  │              │  │              │  │              │     │
│  │ - Dashboard  │  │ - Card       │  │ - Auth       │     │
│  │ - Trans...   │  │ - Button     │  │ - Currency   │     │
│  │ - Goals      │  │ - Charts     │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│                    ↓ HTTP/REST API ↓                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                    (Node.js + Express)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │ Controllers  │  │  Middleware  │     │
│  │              │  │              │  │              │     │
│  │ - Auth       │  │ - Auth       │  │ - JWT Auth   │     │
│  │ - Trans...   │  │ - Trans...   │  │ - Rate Limit │     │
│  │ - Plaid      │  │ - AI Chat    │  │ - Error      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │   Utils      │  │  External    │     │
│  │              │  │              │  │    APIs      │     │
│  │ - User       │  │ - Currency   │  │              │     │
│  │ - Trans...   │  │ - AI Parser  │  │ - Gemini     │     │
│  │ - Goal       │  │              │  │ - Plaid      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│                    ↓ Mongoose ODM ↓                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Users      │  │ Transactions │  │   Goals      │     │
│  │              │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Choices

**Next.js 16**
- Server-side rendering for better SEO
- File-based routing
- API routes (not currently used)
- Built-in optimization

**React 18**
- Component-based architecture
- Hooks for state management
- Context API for global state

**Tailwind CSS**
- Utility-first styling
- Custom design system
- Responsive by default

### Directory Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Main app pages
│   │   ├── page.jsx       # Dashboard home
│   │   ├── transactions/
│   │   ├── goals/
│   │   ├── portfolios/
│   │   └── chat/
│   ├── layout.jsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   └── PageHeader.jsx
│   ├── BankConnect.jsx
│   └── FinancialAdvisor.jsx
├── lib/                   # Utilities and configs
│   ├── api.js            # API client
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.js
│   │   └── CurrencyContext.js
│   └── hooks/            # Custom hooks
│       └── useProtectedRoute.js
└── public/               # Static assets
```

### State Management

**Context API**
- `AuthContext`: User authentication state
- `CurrencyContext`: Currency preferences and conversion

**Local State**
- Component-level state with `useState`
- Form state management
- UI state (loading, errors)

### Data Flow

1. User interacts with UI component
2. Component calls API function from `lib/api.js`
3. API function makes HTTP request to backend
4. Response updates component state
5. UI re-renders with new data

## Backend Architecture

### Technology Choices

**Express.js**
- Minimal and flexible
- Robust middleware ecosystem
- Easy to understand and maintain

**MongoDB + Mongoose**
- Flexible schema for evolving requirements
- JSON-like documents match JavaScript objects
- Powerful query capabilities

### Directory Structure

```
backend/
├── config/                # Configuration
│   └── mongodb.js        # Database connection
├── controllers/          # Business logic
│   ├── authController.js
│   ├── transactionController.js
│   ├── goalController.js
│   ├── portfolioController.js
│   ├── chatController.js
│   ├── plaidController.js
│   └── userController.js
├── models/               # Data models
│   ├── User.js
│   ├── Transaction.js
│   ├── Category.js
│   ├── Goal.js
│   └── Portfolio.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   ├── goalRoutes.js
│   ├── portfolioRoutes.js
│   ├── chatRoutes.js
│   ├── plaidRoutes.js
│   └── userRoutes.js
├── middleware/           # Custom middleware
│   └── auth.js          # JWT authentication
├── utils/               # Utility functions
│   ├── currencyUtils.js
│   └── aiParser.js
├── scripts/             # Utility scripts
│   ├── createTestUser.js
│   └── cleanTestUser.js
└── server.js            # Entry point
```

### Request Flow

1. Client sends HTTP request
2. Express receives request
3. Route handler matches URL pattern
4. Middleware runs (auth, rate limiting)
5. Controller executes business logic
6. Model interacts with database
7. Response sent back to client

### Authentication Flow

```
1. User submits credentials
   ↓
2. authController.login validates credentials
   ↓
3. JWT token generated and signed
   ↓
4. Token sent to client in response
   ↓
5. Client stores token (cookie/localStorage)
   ↓
6. Client includes token in subsequent requests
   ↓
7. auth middleware validates token
   ↓
8. Request proceeds if valid, rejected if invalid
```

## Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  accountBalance: Number,
  currency: String,
  plaidAccessToken: String,
  plaidItemId: String,
  createdAt: Date
}
```

### Transaction Model

```javascript
{
  user: ObjectId (ref: User),
  amount: Number (in USD),
  type: String (income/expense/investment),
  category: ObjectId (ref: Category),
  description: String,
  date: Date,
  createdAt: Date
}
```

### Goal Model

```javascript
{
  user: ObjectId (ref: User),
  name: String,
  targetAmount: Number (in USD),
  currentAmount: Number (in USD),
  deadline: Date,
  createdAt: Date
}
```

See [[06-Database-Schema/User-Model|Database Schema]] for complete details.

## External Integrations

### Google Gemini AI

**Purpose:** Intelligent financial assistant

**Flow:**
1. User sends message to `/api/chat`
2. chatController constructs prompt with user context
3. Gemini API generates response
4. Response parsed for actions
5. Actions executed (create transaction, set goal, etc.)
6. Response sent to user

### Plaid

**Purpose:** Bank account integration

**Flow:**
1. User clicks "Connect Bank"
2. Frontend requests link token from `/api/plaid/create_link_token`
3. Plaid Link modal opens
4. User authenticates with bank
5. Plaid returns public token
6. Frontend exchanges for access token via `/api/plaid/set_access_token`
7. Backend stores access token
8. Transactions synced via `/api/plaid/sync_transactions`

### Alpha Vantage

**Purpose:** Stock market data

**Flow:**
1. User adds stock to portfolio
2. Backend requests stock data from Alpha Vantage
3. Current price and performance data retrieved
4. Portfolio value calculated
5. Data displayed to user

## Security Architecture

### Authentication

- JWT tokens with 7-day expiration
- Bcrypt password hashing (10 rounds)
- HTTP-only cookies (planned)

### Authorization

- Middleware validates JWT on protected routes
- User ID extracted from token
- Resources filtered by user ownership

### Data Protection

- Environment variables for sensitive keys
- Encrypted Plaid access tokens
- HTTPS in production
- Rate limiting on all endpoints

### Input Validation

- Mongoose schema validation
- Controller-level validation
- Sanitization of user inputs

## Performance Considerations

### Frontend

- Next.js automatic code splitting
- Image optimization
- Lazy loading for charts
- Debounced search inputs

### Backend

- MongoDB indexing on frequently queried fields
- Pagination for large datasets
- Caching for currency rates (planned)
- Connection pooling for database

### API Optimization

- Selective field projection in queries
- Aggregation pipelines for complex queries
- Batch operations where possible

## Scalability Considerations

### Current Limitations

- Single server deployment
- No caching layer
- No load balancing
- Limited to MongoDB Atlas free tier

### Future Improvements

- Redis for caching
- Horizontal scaling with load balancer
- CDN for static assets
- Database sharding for large datasets
- Microservices architecture (if needed)

## Development Workflow

1. **Local Development**
   - Run backend and frontend separately
   - Hot reload for rapid iteration
   - MongoDB Atlas for database

2. **Version Control**
   - Git for source control
   - Feature branches for new features
   - Pull requests for code review

3. **Testing** (Planned)
   - Unit tests for utilities
   - Integration tests for API endpoints
   - E2E tests for critical flows

4. **Deployment** (Planned)
   - Frontend on Vercel
   - Backend on Railway/Render
   - MongoDB Atlas for production database

---

[[02-Getting-Started|← Previous: Getting Started]] | [[README|Back to Index]] | [[04-Features/Authentication|Next: Features →]]
