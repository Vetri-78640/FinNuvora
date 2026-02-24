const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getRequests, createRequest, respondToRequest } = require('../controllers/paymentController');

router.use(authMiddleware);

router.get('/', getRequests);
router.post('/', createRequest);
router.patch('/:id', respondToRequest);

module.exports = router;
