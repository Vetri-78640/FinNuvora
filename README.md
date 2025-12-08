# FinNuvora - Complete Project Description

## Project Overview
FinNuvora is a full-stack personal finance management platform designed for sophisticated investors and wealth managers. It combines portfolio tracking, transaction management, AI-powered insights, and PDF document processing into a unified dashboard. The application targets users who manage multiple asset classes and need intelligent analysis of their financial positions.

## Architecture Overview

### Tech Stack

**Frontend:**
*   Next.js 16.0+ (App Router)
*   React 19.2.0
*   Tailwind CSS 3.4.1
*   Axios with interceptors
*   Inter & Fira Code fonts (modern, professional typography)

**Backend:**
*   Express.js 5.1.0
*   Node.js with Nodemon (development)
*   Mongoose 8.19.3 (MongoDB ODM)
*   Bcryptjs 3.0.3 (password hashing)
*   JWT 9.0.2 (authentication)
*   express-rate-limit 8.2.1 (email-based rate limiting)
*   @google/generative-ai (Gemini 2.0 Flash for AI insights)
*   express-fileupload (PDF processing)
*   pdf-parse 1.1.4 (PDF extraction)
*   Axios (external API calls)

**Database:**
*   MongoDB Atlas (cloud) - All financial data & authentication
*   *Note:* Originally had MySQL/Prisma for auth but consolidated to MongoDB-only for simplicity.

**Deployment:**
*   **Frontend:** Vercel (auto-deploys from GitHub)
*   **Backend:** Render (Node.js with environment variables)
*   **Database:** MongoDB Atlas (free tier, 512MB)

### Database Schema & Models

**Core MongoDB Collections (Mongoose Models)**

*   **User**
    *   `name`: String (required, trimmed)
    *   `email`: String (required, unique, lowercase)
    *   `password`: String (bcrypt hashed)
    *   `timestamps`: Auto-created/updated

*   **Portfolio**
    *   User reference
    *   `name`: String
    *   `description`: String
    *   `visibility`: Public/Private
    *   `holdingIds`: Array of references to Holdings
    *   Aggregated metrics (total value, returns, etc.)

*   **Holding**
    *   Portfolio reference
    *   `symbol`: Stock ticker (e.g., AAPL)
    *   `quantity`: Number
    *   `averageCost`: Number
    *   `currentPrice`: Number
    *   `sector`: String
    *   `currency`: String
    *   Timestamps

*   **PriceHistory**
    *   Holding reference
    *   `date`: Date
    *   `price`: Number
    *   `volume`: Number
    *   Historical data for charting

*   **Transaction**
    *   User reference
    *   `type`: "income" | "expense" | "investment"
    *   `amount`: Number
    *   `category`: Category reference
    *   `date`: Date
    *   `description`: String
    *   PDF metadata if uploaded

*   **Category**
    *   User reference
    *   `name`: String (e.g., "Utilities", "Stocks", "Dividends")
    *   `type`: "income" | "expense" | "investment"
    *   `color`: Hex color for UI

*   **UserPreferences**
    *   User reference
    *   `theme`: "dark" | "light"
    *   `currency`: String (default USD)
    *   `notifications`: Boolean flags
    *   `privacySettings`: Object

*   **Goal** (Future feature)
    *   User reference
    *   `targetAmount`: Number
    *   `currentAmount`: Number
    *   `deadline`: Date
    *   `priority`: String
    *   `category`: String

## API Endpoints Structure

### Authentication Routes (`/api/auth`)
*   `POST /register` - User registration with password strength validation
*   `POST /login` - JWT token generation with 7-day expiration
*   *Rate limited:* 5 attempts per 15 minutes (email-based)

### Transaction Routes (`/api/transactions`)
*   `GET /` - List with pagination, filtering, sorting
*   `POST /` - Create transaction
*   `PUT /:id` - Update transaction
*   `DELETE /:id` - Delete transaction
*   `POST /upload` - Upload PDF and extract transactions

### Portfolio Routes (`/api/portfolios`)
*   `GET /` - List user portfolios
*   `POST /` - Create portfolio
*   `PUT /:id` - Update portfolio
*   `DELETE /:id` - Delete portfolio
*   `GET /:id/summary` - Portfolio performance metrics

### Holding Routes (`/api/holdings`)
*   `GET /` - List holdings with current prices
*   `POST /` - Add holding to portfolio
*   `PUT /:id` - Update holding
*   `DELETE /:id` - Remove holding
*   *Real-time price data from Alpha Vantage API*

### Category Routes (`/api/categories`)
*   `GET /` - List user categories
*   `POST /` - Create category
*   `PUT /:id` - Update category
*   `DELETE /:id` - Delete category

### Insights Routes (`/api/insights`)
*   `GET /summary` - Financial summary (Gemini AI powered)
*   `GET /recommendations` - AI investment recommendations
*   `GET /spending-analysis` - Transaction analysis
*   *Leverages Google Gemini 2.0 Flash for intelligent insights*

### Price History Routes (`/api/price-history`)
*   `GET /` - Historical price data
*   `GET /chart/:holdingId` - Chart-ready data

### Preferences Routes (`/api/preferences`)
*   `GET /` - User preferences
*   `PUT /` - Update preferences

### Stock Routes (`/api/stocks`)
*   `GET /search` - Search stocks by symbol/name
*   `GET /:symbol` - Get stock details (Alpha Vantage)

### User Routes (`/api/users`)
*   `GET /profile` - User profile data
*   `PUT /profile` - Update profile
*   `GET /dashboard-stats` - Dashboard metrics

## Frontend Architecture

### Page Structure (App Router)
**Public Pages:**
*   `/` - Landing page with Navbar & Footer
*   `/auth/login` - Login form with email/password
*   `/auth/register` - Registration with password strength requirements

**Protected Pages (require JWT):**
*   `/dashboard` - Main dashboard with layout sidebar
*   `/dashboard/portfolio` - Portfolio management
*   `/dashboard/transactions` - Transaction list with filters
*   `/dashboard/holdings` - Holdings tracker
*   `/dashboard/insights` - AI-powered insights
*   `/dashboard/goals` - Financial goals

### Component Structure
**Reusable Components:**
*   `Navbar.jsx` - Navigation with auth state detection
*   `Footer.jsx` - 3-column centered footer (Product, Legal, Status)
*   Layout components with Tailwind styling
*   Dark theme with slate/blue color palette

### State Management
*   React hooks (`useState`, `useEffect`, `useCallback`)
*   Custom hooks: `useProtectedRoute()` for auth guard
*   Axios interceptors for JWT attachment and 401 handling
*   Cookie-based token storage (httpOnly in production)

### API Integration (`api.js`)
*   Axios instance with baseURL from `NEXT_PUBLIC_API_URL`
*   Request interceptor adds JWT token
*   Response interceptor handles 401 errors (redirects to login)
*   Organized API calls: `authAPI`, `transactionAPI`, `portfolioAPI`, etc.

## Security Implementation

### Authentication & Authorization
*   Password hashing: bcryptjs (10 salt rounds)
*   JWT tokens: 7-day expiration
*   Secure cookies: HttpOnly, Secure, SameSite=strict (production)
*   Rate limiting: Email-based (5 login/register attempts per 15 min)
*   User ownership validation on all resources

### Input Validation
*   Email format validation (RFC 5322)
*   Password strength: 8+ chars, uppercase, lowercase, number, special char
*   Name format validation (alphanumeric + spaces)
*   ObjectId validation for MongoDB queries

### Security Headers
*   `X-Content-Type-Options: nosniff`
*   `X-Frame-Options: DENY`
*   `X-XSS-Protection: 1; mode=block`
*   `HSTS: max-age=31536000`

### Error Handling
*   Sanitized error responses (no stack traces in production)
*   Consistent error format: `{ success: false, error: "message" }`
*   Input sanitization on all endpoints

## Key Features Implemented

### Portfolio Management
*   Multiple portfolios per user
*   Track holdings across stocks, bonds, crypto, etc.
*   Real-time price updates via Alpha Vantage API
*   Portfolio performance metrics (returns, allocation, etc.)

### Transaction Tracking
*   Three transaction types: Income, Expense, Investment
*   Category-based organization
*   Date-based filtering and sorting
*   PDF Upload & Processing: Extract transactions from bank PDFs automatically
*   Pagination support (10 items per page)

### AI-Powered Insights (Google Gemini Integration)
*   Financial summary analysis
*   Investment recommendations
*   Spending pattern analysis
*   Context-aware insights using user's actual data

### Price Tracking
*   Historical price data storage
*   Chart-ready time-series data
*   Real-time stock quotes (Alpha Vantage API)
*   Automatic price update scheduling (background job ready)

### User Preferences
*   Currency preference
*   Notification settings
*   Privacy controls

## External API Integrations

### Google Gemini 2.0 Flash
*   Used for AI insights and analysis
*   Processes financial summaries and recommendations
*   Requires: `GOOGLE_API_KEY` env variable

### Alpha Vantage
*   Stock price data and quotes
*   Historical price series
*   Free tier: 5 requests/min, 500/day
*   Requires: `ALPHA_VANTAGE_API_KEY` env variable

## Development & Deployment

### Local Development
**Local Environment:**
*   MongoDB: `mongodb://localhost:27017/FinNuvora`
*   Backend: `http://localhost:4000`
*   Frontend: `http://localhost:3000`

### Production Deployment
**Frontend (Vercel):**
*   Auto-deploys on GitHub push
*   Environment: `NEXT_PUBLIC_API_URL=https://finnuvora.onrender.com`
*   Build: `npm run build` -> `.next` output

**Backend (Render):**
*   Procfile: `web: cd backend && npm install && npm start`
*   Environment variables:
    *   `MONGODB_URI` (Atlas connection)
    *   `JWT_SECRET` (32-char hex string)
    *   `GEMINI_API_KEY`
    *   `ALPHA_VANTAGE_API_KEY`
    *   `FRONTEND_URL` (for CORS)
    *   `NODE_ENV=production`

## UI/UX Design

### Design System
**Color Palette:**
*   Background: `#05060F` (dark navy)
*   Surface: `#0E1324` (slightly lighter)
*   Primary: `#4C6EF5` (blue)
*   Accent: `#22D3EE` (cyan)
*   Highlight: `#8B5CF6` (purple)
*   Success: `#4ADE80` (green)

**Typography:**
*   Sans: Inter (modern, clean, professional)
*   Mono: Fira Code (technical text)
*   Dark theme optimized

**Layout:**
*   Dashboard sidebar + main content
*   Card-based components with glass morphism effects
*   Responsive grid layouts
*   Mobile-friendly design


## Known Limitations & Future Features

### Current Limitations
*   No real-time price updates (scheduled jobs needed)
*   Limited AI context window for Gemini

### Future Enhancements
*   WebSocket for real-time price updates
*   Advanced portfolio rebalancing recommendations
*   Tax loss harvesting calculator
*   Multi-currency support with conversions
*   Collaborative portfolios (shared with advisors)
*   Mobile native app
*   Advanced charting (TradingView integration)
*   Options trading support

## Critical Points for Another AI
*   **MongoDB-Only Architecture:** Project uses ONLY MongoDB for all data (user auth + financial data).
*   **Rate Limiting:** Email-based (not IP-based) to avoid IPv6 validation errors.
*   **Environment Variables:** Must be set in deployment platforms (Vercel & Render) - never hardcoded.
*   **JWT Flow:** 7-day expiration, stored in cookies, validated on protected routes.
*   **API Structure:** RESTful with consistent error handling and response format.
*   **Security First:** All inputs validated, passwords hashed, tokens secured.
*   **Deployment Pipeline:** GitHub -> Vercel (frontend) + Render (backend)
