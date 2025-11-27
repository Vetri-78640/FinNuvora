const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createLinkToken, setAccessToken, syncTransactions } = require('../controllers/plaidController');

router.post('/create_link_token', protect, createLinkToken);
router.post('/set_access_token', protect, setAccessToken);
router.post('/sync_transactions', protect, syncTransactions);

module.exports = router;
