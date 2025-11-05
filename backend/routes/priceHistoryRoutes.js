const express = require('express');
const {
  recordPriceHistory,
  getPriceHistory,
  getLatestPrice
} = require('../controllers/priceHistoryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, recordPriceHistory);
router.get('/history', getPriceHistory);
router.get('/latest/:symbol', getLatestPrice);

module.exports = router;
