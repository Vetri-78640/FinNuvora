const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const User = require('../models/User');
const { parseTransactionsFromText } = require('../utils/aiParser');

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

// Find or Create Category Helper
const findOrCreateCategory = async (userId, categoryName, categoryId) => {
    if (categoryName) {
        const normalizedName = categoryName.trim();
        let category = await Category.findOne({
            user: new mongoose.Types.ObjectId(userId),
            name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
        });

        if (!category) {
            category = await Category.create({
                user: new mongoose.Types.ObjectId(userId),
                name: normalizedName
            });
        }
        return category._id;
    }

    if (categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID');
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.user.toString() !== userId.toString()) {
            throw new Error('Not authorized to use this category');
        }
        return category._id;
    }

    // Fallback to 'Other'
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
    return defaultCategory._id;
};

const createTransaction = async (userId, data) => {
    const { categoryId, categoryName, type, amount, description, date } = data;

    const finalCategoryId = await findOrCreateCategory(userId, categoryName, categoryId);

    const transaction = await Transaction.create({
        user: new mongoose.Types.ObjectId(userId),
        category: finalCategoryId,
        type,
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date),
        source: data.source || 'manual'
    });

    // Update User Balance
    await updateUserBalance(userId, parseFloat(amount), type);

    return transaction.populate('category');
};

const importTransactions = async (userId, transactionsData) => {
    // Get default category (or 'Other') for bulk imports if not specified
    const defaultCategoryId = await findOrCreateCategory(userId, null, null);

    const transactionsToSave = transactionsData.map(t => ({
        user: new mongoose.Types.ObjectId(userId),
        category: defaultCategoryId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        source: t.source || 'import',
    }));

    const savedTransactions = await Transaction.insertMany(transactionsToSave);

    // Update balance for each transaction
    for (const t of savedTransactions) {
        await updateUserBalance(userId, t.amount, t.type);
    }

    // Populate category info
    await Transaction.populate(savedTransactions, 'category');

    return savedTransactions;
};

const getTransactions = async (userId, query) => {
    const { type, categoryId, startDate, endDate, search, sortBy, sortOrder, page = 1, limit = 10 } = query;

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

    const [transactions, total] = await Promise.all([
        Transaction.find(filters)
            .populate('category')
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        Transaction.countDocuments(filters)
    ]);

    return {
        transactions,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum)
        }
    };
};

const updateTransaction = async (userId, transactionId, data) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.user.toString() !== userId.toString()) throw new Error('Not authorized');

    const { categoryId, categoryName, type, amount, description, date } = data;

    // Revert old balance
    await updateUserBalance(userId, transaction.amount, transaction.type, true);

    if (categoryId || categoryName) {
        transaction.category = await findOrCreateCategory(userId, categoryName, categoryId);
    }

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (description !== undefined) transaction.description = description || null;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    // Apply new balance
    await updateUserBalance(userId, transaction.amount, transaction.type);

    return transaction.populate('category');
};

const deleteTransaction = async (userId, transactionId) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');
    if (transaction.user.toString() !== userId.toString()) throw new Error('Not authorized');

    // Revert balance
    await updateUserBalance(userId, transaction.amount, transaction.type, true);

    await transaction.deleteOne();
    return true;
};

const bulkDeleteTransactions = async (userId, transactionIds) => {
    // Find transactions to verify ownership and revert balances
    const transactions = await Transaction.find({
        _id: { $in: transactionIds },
        user: userId
    });

    if (transactions.length === 0) {
        throw new Error('No transactions found to delete');
    }

    // Revert balances
    for (const t of transactions) {
        await updateUserBalance(userId, t.amount, t.type, true);
    }

    // Delete transactions
    await Transaction.deleteMany({
        _id: { $in: transactionIds },
        user: userId
    });

    return transactions.length;
};

const getStats = async (userId, query) => {
    const { startDate, endDate } = query;
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
    return stats;
};

const smartAdd = async (userId, text) => {
    if (!text) throw new Error('Text is required');

    // Use AI to parse the text
    const parsedTransactions = await parseTransactionsFromText(text);

    if (!parsedTransactions || parsedTransactions.length === 0) {
        throw new Error('Could not understand the transaction details.');
    }

    // We'll take the first parsed transaction
    const t = parsedTransactions[0];

    // Create using the internal create function
    return await createTransaction(userId, {
        categoryName: 'Other', // Or AI inferred category if available
        date: t.date,
        description: t.description,
        amount: Math.abs(t.amount),
        type: t.type || (t.amount > 0 ? 'income' : 'expense'),
        source: 'smart_add'
    });
};

const detectRecurring = async (userId) => {
    // Get transactions from the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const transactions = await Transaction.find({
        user: userId,
        date: { $gte: threeMonthsAgo },
        type: 'expense'
    }).sort({ date: 1 });

    const groups = {};
    transactions.forEach(t => {
        const desc = t.description.toLowerCase().trim();
        const key = desc.replace(/[\d\s#]+$/, '');

        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
    });

    const recurring = [];

    Object.entries(groups).forEach(([key, group]) => {
        if (group.length < 2) return;

        const amounts = group.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const isAmountConsistent = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.1);

        if (isAmountConsistent) {
            let isMonthly = true;
            for (let i = 1; i < group.length; i++) {
                const diffTime = Math.abs(new Date(group[i].date) - new Date(group[i - 1].date));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

    return recurring;
};

module.exports = {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    getStats,
    importTransactions,
    smartAdd,
    detectRecurring,
    findOrCreateCategory
};
