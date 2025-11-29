require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectMongoDB = require('./config/mongodb');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const holdingRoutes = require('./routes/holdingRoutes');
const userRoutes = require('./routes/userRoutes');
const priceHistoryRoutes = require('./routes/priceHistoryRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '1mb' })); // Limit JSON payload
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Strict Allow List:
    // 1. Localhost for development
    // 2. The exact FRONTEND_URL from env vars (Production)
    // 3. Vercel Preview URLs that belong to THIS project (contain 'finnuvora')
    const isAllowed =
      origin === 'http://localhost:3000' ||
      origin === process.env.FRONTEND_URL ||
      (origin.endsWith('.vercel.app') && origin.includes('finnuvora'));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - only on auth endpoints (custom email-based limiter)
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/holding', holdingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/price', priceHistoryRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/plaid', require('./routes/plaidRoutes'));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);


connectMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});