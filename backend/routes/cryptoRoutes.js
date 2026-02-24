const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getHoldings,
    addHolding,
    updateHolding,
    deleteHolding,
    getMarketData,
    searchCoins,
} = require('../controllers/cryptoController');

router.use(authMiddleware);

router.get('/holdings', getHoldings);
router.post('/holdings', addHolding);
router.put('/holdings/:id', updateHolding);
router.delete('/holdings/:id', deleteHolding);
router.get('/market', getMarketData);
router.get('/search', searchCoins);

module.exports = router;
