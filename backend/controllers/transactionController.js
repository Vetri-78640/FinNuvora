const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

/**
 * Parse transaction text from PDF
 * Expected format: DATE DESCRIPTION AMOUNT
 * Example: 2024-01-15 Starbucks Coffee -25.50
 */
const parseTransactionFromText = (lines) => {
  const transactions = [];
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.toLowerCase().includes('date') || line.toLowerCase().includes('description')) {
      continue;
    }

    // Basic pattern: Date Description Amount
    const match = line.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([-+]?\d+\.\d{2}|[-+]?\d+)$/);
    
    if (match) {
      const [_, dateStr, description, amountStr] = match;
      
      transactions.push({
        date: new Date(dateStr),
        description: description.trim(),
        amount: Math.abs(parseFloat(amountStr)),
        type: parseFloat(amountStr) > 0 ? 'income' : 'expense',
        source: 'bank_statement',
      });
    }
  }

  return transactions;
};

/**
 * Upload PDF and extract transactions
 * POST /api/transactions/upload
 */
const uploadTransaction = async (req, res, next) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const pdfFile = req.files.pdf;

    // Parse PDF
    const pdfData = await pdfParse(pdfFile.data);
    const lines = pdfData.text.split('\n');

    // Extract transactions
    const parsedTransactions = parseTransactionFromText(lines);

    if (parsedTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No transactions found in PDF'
      });
    }

    // Get default category (or 'Other')
    let defaultCategory = await Category.findOne({ 
      user: new mongoose.Types.ObjectId(userId),
      name: 'Other' 
    });
    
    if (!defaultCategory) {
      defaultCategory = await Category.create({ 
        user: new mongoose.Types.ObjectId(userId),
        name: 'Other' 
      });
    }

    // Save to MongoDB
    const transactionsToSave = parsedTransactions.map(t => ({
      ...t,
      user: new mongoose.Types.ObjectId(userId),
      category: defaultCategory._id,
    }));

    const savedTransactions = await Transaction.insertMany(transactionsToSave);
    
    // Populate category info
    await Transaction.populate(savedTransactions, 'category');

    res.status(201).json({
      success: true,
      message: `${savedTransactions.length} transactions imported successfully`,
      transactions: savedTransactions,
    });
  } catch (error) {
    console.error('Transaction upload error:', error);
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { categoryId, type, amount, description, date } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!categoryId || !type || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'categoryId, type, amount, and date are required'
      });
    }

    if (!['income', 'expense', 'investment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be income, expense, or investment'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to use this category'
      });
    }

    const transaction = await Transaction.create({
      user: new mongoose.Types.ObjectId(userId),
      category: category._id,
      type,
      amount: parseFloat(amount),
      description: description || null,
      date: new Date(date)
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: await transaction.populate('category')
    });
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type, categoryId, startDate, endDate, search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const filters = {
      user: new mongoose.Types.ObjectId(userId)
    };

    if (type) filters.type = type;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filters.category = new mongoose.Types.ObjectId(categoryId);
    }

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.date.$lte = end;
      }
    }

    if (search) {
      filters.$or = [
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    if (sortBy && ['date', 'amount', 'createdAt'].includes(sortBy)) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.date = -1;
    }

    const query = Transaction.find(filters)
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const [transactions, total] = await Promise.all([
      query,
      Transaction.countDocuments(filters)
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, type, amount, description, date } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(403).json({
          success: false,
          error: 'Invalid category'
        });
      }

      const category = await Category.findById(categoryId);

      if (!category || category.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Invalid category'
        });
      }
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    if (type && !['income', 'expense', 'investment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be income, expense, or investment'
      });
    }

    if (categoryId) {
      transaction.category = new mongoose.Types.ObjectId(categoryId);
    }
    if (type) {
      transaction.type = type;
    }
    if (amount !== undefined) {
      transaction.amount = parseFloat(amount);
    }
    if (description !== undefined) {
      transaction.description = description || null;
    }
    if (date) {
      transaction.date = new Date(date);
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: await transaction.populate('category')
    });
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const filters = {
      user: new mongoose.Types.ObjectId(userId)
    };

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filters).populate('category');

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
      netAmount: 0,
      byType: {},
      byCategory: {}
    };

    transactions.forEach(t => {
      if (t.type === 'income') stats.totalIncome += t.amount;
      if (t.type === 'expense') stats.totalExpense += t.amount;
      if (t.type === 'investment') stats.totalInvestment += t.amount;

      stats.byType[t.type] = (stats.byType[t.type] || 0) + t.amount;
      stats.byCategory[t.category.name] = (stats.byCategory[t.category.name] || 0) + t.amount;
    });

    stats.netAmount = stats.totalIncome - stats.totalExpense;

    res.json({
      success: true,
      stats
    });
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
  getTransactionStats
};
