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
router.post('/smart-add', require('../controllers/holdingController').smartAddHolding);
router.get('/portfolio/:portfolioId', getHoldingsByPortfolio);
router.get('/:holdingId', getHoldingById);
router.put('/:holdingId', updateHolding);
router.delete('/:holdingId', deleteHolding);

module.exports = router;
