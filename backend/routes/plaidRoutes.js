const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getStatus, createLinkToken, setAccessToken, syncTransactions } = require('../controllers/plaidController');

router.get('/status', protect, getStatus);
router.post('/create_link_token', protect, createLinkToken);
router.post('/set_access_token', protect, setAccessToken);
router.post('/sync_transactions', protect, syncTransactions);

module.exports = router;
