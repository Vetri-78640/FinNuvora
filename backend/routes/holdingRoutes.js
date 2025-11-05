const express = require('express');
const {
    createHolding,
    getHoldingsByPortfolio,
    getHoldingById,
    updateHolding,
    deleteHolding
} = require('../controllers/holdingController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createHolding);
router.get('/portfolio/:portfolioId', getHoldingsByPortfolio);
router.get('/:holdingId', getHoldingById);
router.put('/:holdingId', updateHolding);
router.delete('/:holdingId', deleteHolding);

module.exports = router;
