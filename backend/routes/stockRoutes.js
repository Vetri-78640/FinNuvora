const express = require('express');
const { getStockPrice, getStockPriceDaily, getMultipleStockPrices, searchStocks } = require('../controllers/stockController');

const router = express.Router();

router.get('/quote/:symbol', getStockPrice);
router.get('/daily/:symbol', getStockPriceDaily);
router.post('/batch', getMultipleStockPrices);
router.get('/search', searchStocks);

module.exports = router;
