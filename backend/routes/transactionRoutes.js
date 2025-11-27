const express = require('express');
const { uploadTransaction, createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionStats } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/upload', uploadTransaction);
router.post('/scan-receipt', require('../controllers/transactionController').scanReceipt);
router.post('/', createTransaction);
router.post('/smart-add', require('../controllers/transactionController').smartAddTransaction);
router.get('/detect-recurring', require('../controllers/transactionController').detectRecurring);
router.get('/', getTransactions);
router.get('/stats/summary', getTransactionStats);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
