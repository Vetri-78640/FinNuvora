const express = require('express');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction, getTransactionStats } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/stats/summary', getTransactionStats);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
