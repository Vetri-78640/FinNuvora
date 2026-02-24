const path = require('path');
require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectMongoDB = require('./config/mongodb');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimiter');
const securityHeaders = require('./middleware/security');
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max i made this will see if i need more
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(securityHeaders);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      origin === 'http://localhost:3000' ||
      origin === process.env.FRONTEND_URL ||
      (origin.endsWith('.vercel.app') && origin.includes('fin-nuvora'));

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

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// Debug Logger
app.use((req, res, next) => {
  console.log(`[DEBUG] Received ${req.method} request for: ${req.url}`);
  next();
});

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