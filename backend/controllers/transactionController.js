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

const { parseTransactionsFromText, parseReceipt } = require('../utils/aiParser');

// ... existing code ...

const scanReceipt = async (req, res, next) => {
  try {
    if (!req.files || !req.files.receipt) {
      return res.status(400).json({
        success: false,
        error: 'No receipt image uploaded'
      });
    }

    const receiptFile = req.files.receipt;

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(receiptFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.'
      });
    }

    // Use AI to parse receipt
    const parsedData = await parseReceipt(receiptFile.data, receiptFile.mimetype);

    if (!parsedData) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract details from the receipt. Please try a clearer image.'
      });
    }

    res.json({
      success: true,
      data: parsedData
    });
  } catch (err) {
    next(err);
  }
};



/**
 * Upload PDF and extract transactions
 * POST /api/transactions/upload
 */
const User = require('../models/User');

// Helper to update balance
const updateUserBalance = async (userId, amount, type, isreversal = false) => {
  const multiplier = isreversal ? -1 : 1;
  let change = 0;

  if (type === 'income') {
    change = amount;
  } else {
    // expense or investment reduces balance
    change = -amount;
  }

  await User.findByIdAndUpdate(userId, {
    $inc: { accountBalance: change * multiplier }
  });
};

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

    // Use AI to parse transactions
    const parsedTransactions = await parseTransactionsFromText(pdfData.text);

    if (!parsedTransactions || parsedTransactions.length === 0) {
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
      user: new mongoose.Types.ObjectId(userId),
      category: defaultCategory._id,
      date: new Date(t.date),
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.type || (t.amount > 0 ? 'income' : 'expense'),
      source: 'bank_statement_ai',
    }));

    const savedTransactions = await Transaction.insertMany(transactionsToSave);

    // Update balance for each transaction
    for (const t of savedTransactions) {
      await updateUserBalance(userId, t.amount, t.type);
    }

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

    // Update User Balance
    await updateUserBalance(userId, parseFloat(amount), type);

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

    // Revert old balance
    await updateUserBalance(userId, transaction.amount, transaction.type, true);

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

    // Apply new balance
    await updateUserBalance(userId, transaction.amount, transaction.type);

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

    // Revert balance
    await updateUserBalance(userId, transaction.amount, transaction.type, true);

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

const smartAddTransaction = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Use AI to parse the text
    const parsedTransactions = await parseTransactionsFromText(text);

    if (!parsedTransactions || parsedTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Could not understand the transaction details. Please try a format like "Spent $50 at Walmart".'
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

    // We'll take the first parsed transaction since the input is likely a single sentence
    const t = parsedTransactions[0];

    const transaction = await Transaction.create({
      user: new mongoose.Types.ObjectId(userId),
      category: defaultCategory._id,
      date: new Date(t.date),
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.type || (t.amount > 0 ? 'income' : 'expense'),
      source: 'smart_add',
    });

    // Update User Balance
    await updateUserBalance(userId, transaction.amount, transaction.type);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully via AI',
      transaction: await transaction.populate('category')
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
  getTransactionStats,
  smartAddTransaction,
  scanReceipt
};

const detectRecurring = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get transactions from the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: threeMonthsAgo },
      type: 'expense' // Mostly interested in recurring expenses
    }).sort({ date: 1 });

    // Group by description (fuzzy match could be better, but exact for now)
    const groups = {};
    transactions.forEach(t => {
      const desc = t.description.toLowerCase().trim();
      // Simple normalization: remove numbers and special chars from end
      const key = desc.replace(/[\d\s#]+$/, '');

      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const recurring = [];

    Object.entries(groups).forEach(([key, group]) => {
      if (group.length < 2) return;

      // Check for regularity in amount and date
      const amounts = group.map(t => t.amount);
      const uniqueAmounts = [...new Set(amounts)];

      // If amounts are similar (within 10%)
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const isAmountConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.1);

      if (isAmountConsistent) {
        // Check date intervals
        let isMonthly = true;
        for (let i = 1; i < group.length; i++) {
          const diffTime = Math.abs(new Date(group[i].date) - new Date(group[i - 1].date));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Allow 25-35 days for monthly
          if (diffDays < 25 || diffDays > 35) {
            isMonthly = false;
            break;
          }
        }

        if (isMonthly) {
          recurring.push({
            merchant: key,
            amount: avgAmount,
            frequency: 'Monthly',
            lastDate: group[group.length - 1].date,
            confidence: 'High'
          });
        }
      }
    });

    res.json({
      success: true,
      recurring
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
  getTransactionStats,
  smartAddTransaction,
  scanReceipt,
  detectRecurring
};
