// Main server file
// This is where Express app starts and everything connects

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE - Process all requests through these
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Allow cross-origin requests from frontend

// ROUTES
// All auth endpoints will be at /api/auth/...
app.use('/api/auth', authRoutes);

// Health check endpoint - test if server is running
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// 404 - route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware - catches all errors
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
