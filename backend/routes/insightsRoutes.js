const express = require('express');
const { generateInsights, getInsightHistory } = require('../controllers/insightsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/generate', generateInsights);
router.get('/history', getInsightHistory);

module.exports = router;
