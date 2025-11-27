const express = require('express');
const router = express.Router();
const { getHistory, sendMessage, clearHistory } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/history', getHistory);
router.post('/send', sendMessage);
router.delete('/history', clearHistory);

module.exports = router;
