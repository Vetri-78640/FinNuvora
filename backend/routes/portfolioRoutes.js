// Portfolio routes
// All these endpoints require authentication

const express = require('express');
const {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio
} = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

const router = express.Router();

// All portfolio routes are protected by auth middleware
router.use(auth); // This checks JWT token on every request below

// Create portfolio - POST /api/portfolio
router.post('/', createPortfolio);

// Get all portfolios for user - GET /api/portfolio
router.get('/', getPortfolios);

// Get specific portfolio - GET /api/portfolio/:id
router.get('/:id', getPortfolioById);

// Update portfolio - PUT /api/portfolio/:id
router.put('/:id', updatePortfolio);

// Delete portfolio - DELETE /api/portfolio/:id
router.delete('/:id', deletePortfolio);

module.exports = router;
