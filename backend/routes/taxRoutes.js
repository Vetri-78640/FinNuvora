const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getTaxSummary, exportTaxCSV } = require('../controllers/taxController');

router.use(authMiddleware);

router.get('/summary', getTaxSummary);
router.get('/export', exportTaxCSV);

module.exports = router;
