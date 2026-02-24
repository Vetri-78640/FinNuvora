const mongoose = require('mongoose');
const transactionService = require('../services/transactionService');
const fileProcessingService = require('../services/fileProcessingService');

/**
 * Upload PDF and extract transactions
 * POST /api/transactions/upload
 */
const uploadTransaction = async (req, res, next) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }

    const userId = req.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    const pdfFile = req.files.pdf;
    if (pdfFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Invalid file type. Only PDF is allowed.' });
    }

    let { conversionRate = 1 } = req.body;
    conversionRate = parseFloat(conversionRate);
    if (isNaN(conversionRate)) conversionRate = 1;

    // Delegate to File Processing Service
    const parsedTransactions = await fileProcessingService.processPDF(pdfFile, conversionRate);

    // Delegate to Transaction Service to save data
    const savedTransactions = await transactionService.importTransactions(userId, parsedTransactions);

    res.status(201).json({
      success: true,
      message: `${savedTransactions.length} transactions imported successfully`,
      transactions: savedTransactions,
    });
  } catch (err) {
    fileProcessingService.logToFile({ event: 'PDF Upload Error', error: err.message });
    next(err);
  }
};

const scanReceipt = async (req, res, next) => {
  try {
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({ success: false, error: 'No receipt image uploaded' });
    }

    // Delegate to File Processing Service
    const data = await fileProcessingService.processReceiptImage(req.files.receipt);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
    }

    const { categoryId, categoryName, type, amount, date } = req.body;
    if ((!categoryId && !categoryName) || !type || !amount || !date) {
      return res.status(400).json({ success: false, error: 'Category, type, amount, and date are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be positive' });
    }

    const transaction = await transactionService.createTransaction(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    const result = await transactionService.getTransactions(userId, req.query);

    res.json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(401).json({ success: false, error: 'Invalid session' });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ success: false, error: 'Transaction not found' });

    const transaction = await transactionService.updateTransaction(userId, id, req.body);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (err) {
    if (err.message === 'Transaction not found') return res.status(404).json({ success: false, error: err.message });
    if (err.message === 'Not authorized') return res.status(403).json({ success: false, error: err.message });
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await transactionService.deleteTransaction(userId, id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (err) {
    if (err.message === 'Transaction not found') return res.status(404).json({ success: false, error: err.message });
    if (err.message === 'Not authorized') return res.status(403).json({ success: false, error: err.message });
    next(err);
  }
};

const bulkDeleteTransactions = async (req, res, next) => {
  try {
    const { transactionIds } = req.body;
    const userId = req.userId;

    const count = await transactionService.bulkDeleteTransactions(userId, transactionIds);

    res.json({
      success: true,
      message: `${count} transactions deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await transactionService.getStats(userId, req.query);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

const smartAddTransaction = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    const transaction = await transactionService.smartAdd(userId, text);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully via AI',
      transaction
    });
  } catch (err) {
    next(err);
  }
};

const detectRecurring = async (req, res, next) => {
  try {
    const userId = req.userId;
    const recurring = await transactionService.detectRecurring(userId);
    res.json({ success: true, recurring });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadTransaction,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  smartAddTransaction,
  scanReceipt,
  detectRecurring,
  bulkDeleteTransactions
};
