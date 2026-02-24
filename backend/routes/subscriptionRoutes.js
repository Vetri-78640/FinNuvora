const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getSubscription, createCheckoutSession, cancelSubscription } = require('../controllers/subscriptionController');

router.use(authMiddleware);

router.get('/', getSubscription);
router.post('/checkout', createCheckoutSession);
router.post('/cancel', cancelSubscription);

module.exports = router;
