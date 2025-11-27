# Getting Started

This guide will help you set up FinNuvora on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/finnuvora.git
cd finnuvora
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```bash
touch .env
```

Add the following environment variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Alpha Vantage (Stock Data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Plaid (Bank Integration)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the frontend directory:

```bash
touch .env.local
```

Add the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Obtain API Keys

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Add it to `MONGODB_URI` in backend `.env`

#### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to `GEMINI_API_KEY` in backend `.env`

#### Alpha Vantage
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get a free API key
3. Add it to `ALPHA_VANTAGE_API_KEY` in backend `.env`

#### Plaid (Optional for Bank Integration)
1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/signup)
2. Get your `client_id` and `sandbox` secret from Team Settings → Keys
3. Add them to `PLAID_CLIENT_ID` and `PLAID_SECRET` in backend `.env`

## Running the Application

### Start the Backend

In the backend directory:

```bash
npm run dev
```

The backend server will start on `http://localhost:4000`

### Start the Frontend

In the frontend directory:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Creating a Test User

You can create a test user using the provided script:

```bash
cd backend
node scripts/createTestUser.js
```

This creates a user with:
- **Email:** test@example.com
- **Password:** Test123!

## Verifying the Setup

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" or use the test credentials to log in
3. You should see the dashboard
4. Try creating a transaction to verify everything works

## Common Issues

### MongoDB Connection Error

**Problem:** `MongoDB connection error`

**Solution:** 
- Verify your `MONGODB_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB service is running (if using local installation)

### Port Already in Use

**Problem:** `Port 4000 is already in use`

**Solution:**
- Change the `PORT` in backend `.env` to another port (e.g., 5000)
- Or kill the process using port 4000:
  ```bash
  lsof -ti:4000 | xargs kill
  ```

### API Key Errors

**Problem:** `Invalid API key` errors

**Solution:**
- Double-check all API keys are correctly copied
- Ensure no extra spaces in `.env` file
- Restart the backend server after changing `.env`

### Frontend Can't Connect to Backend

**Problem:** `Network Error` or `CORS` issues

**Solution:**
- Verify backend is running on port 4000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Clear browser cache and restart frontend

## Next Steps

Now that you have FinNuvora running locally:

1. [[03-Architecture|Learn about the architecture]]
2. [[04-Features/Transactions|Explore the features]]
3. [[07-Development-Guide/Code-Style|Review the code style guide]]
4. [[05-API-Reference/Auth-API|Check out the API reference]]

---

[[01-About|← Previous: About]] | [[README|Back to Index]] | [[03-Architecture|Next: Architecture →]]
