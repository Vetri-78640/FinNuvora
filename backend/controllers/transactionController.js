const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createTransaction = async (req, res, next) => {
  try {
    const { categoryId, type, amount, description, date } = req.body;
    const userId = req.userId;

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

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to use this category'
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        type,
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date)
      },
      include: { category: true }
    });

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
    const { type, categoryId, startDate, endDate, search, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    if (search) {
      where.OR = [
        { description: { contains: search } }
      ];
    }

    const orderBy = {};
    if (sortBy && ['date', 'amount', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.date = 'desc';
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limitNum
    });

    const total = await prisma.transaction.count({ where });

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

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category || category.userId !== userId) {
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

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(categoryId && { categoryId }),
        ...(type && { type }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) })
      },
      include: { category: true }
    });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }

    await prisma.transaction.delete({
      where: { id }
    });

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

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true }
    });

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
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
