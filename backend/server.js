require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectMongoDB = require('./config/mongodb');
const errorHandler = require('./middleware/errorHandler');
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
const PORT = process.env.PORT || 5000;

connectMongoDB();

app.use(express.json());
app.use(cors());

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

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
