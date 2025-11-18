const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PriceHistory = require('../models/PriceHistory');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key not configured'
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

    const [transactions, user] = await Promise.all([
      Transaction.find(filters).populate('category'),
      User.findById(userId)
    ]);

    const stats = {
      totalIncome: 0,
      totalExpense: 0,
      totalInvestment: 0,
      byCategory: {},
      transactionCount: transactions.length
    };

    transactions.forEach(t => {
      if (t.type === 'income') stats.totalIncome += t.amount;
      if (t.type === 'expense') stats.totalExpense += t.amount;
      if (t.type === 'investment') stats.totalInvestment += t.amount;

      const categoryName = t.category?.name || 'Uncategorized';

      if (!stats.byCategory[categoryName]) {
        stats.byCategory[categoryName] = { income: 0, expense: 0, investment: 0 };
      }
      stats.byCategory[categoryName][t.type] += t.amount;
    });

    stats.netAmount = stats.totalIncome - stats.totalExpense;
    stats.savingsRate = stats.totalIncome > 0 
      ? Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100) 
      : 0;

    const prompt = `
You are a personal finance advisor. Analyze the following financial data for user "${user.name}" and provide personalized insights and recommendations.

Financial Summary:
- Total Income: $${stats.totalIncome.toFixed(2)}
- Total Expenses: $${stats.totalExpense.toFixed(2)}
- Total Investment: $${stats.totalInvestment.toFixed(2)}
- Net Amount (Income - Expenses): $${stats.netAmount.toFixed(2)}
- Savings Rate: ${stats.savingsRate}%
- Total Transactions: ${stats.transactionCount}

Spending by Category:
${Object.entries(stats.byCategory)
  .map(([cat, amounts]) => `- ${cat}: Income: $${amounts.income.toFixed(2)}, Expense: $${amounts.expense.toFixed(2)}, Investment: $${amounts.investment.toFixed(2)}`)
  .join('\n')}

Please provide:
1. Key insights about their financial health
2. Top 3 areas where they're spending the most
3. Specific, actionable recommendations to improve their financial situation
4. Suggestions for better budgeting and savings

Keep the response concise, friendly, and specific to their financial data.
    `;

    try {
      // Use gemini-2.0-flash which is available
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const insights = result.response.text();

      res.json({
        success: true,
        insights,
        stats
      });
    } catch (geminiErr) {
      // If Gemini fails, return stats with a fallback message
      const fallbackInsight = `
Financial Overview for ${user.name}:

Your financial health shows:
- Total Income: $${stats.totalIncome.toFixed(2)}
- Total Expenses: $${stats.totalExpense.toFixed(2)}
- Savings Rate: ${stats.savingsRate}%

Top Spending Categories:
${Object.entries(stats.byCategory)
  .sort((a, b) => b[1].expense - a[1].expense)
  .slice(0, 3)
  .map(([cat, amounts]) => `- ${cat}: $${amounts.expense.toFixed(2)}`)
  .join('\n')}

Key Recommendations:
1. Review your top spending categories for optimization opportunities
2. Maintain your savings rate by tracking monthly expenses
3. Consider setting up automatic transfers to savings

Note: AI insights are temporarily unavailable. Please check your API configuration.
      `;

      res.json({
        success: true,
        insights: fallbackInsight,
        stats,
        warning: 'Using fallback insights - Gemini API issue'
      });
    }
  } catch (err) {
    next(err);
  }
};

const getInsightHistory = async (req, res, next) => {
  try {
    const userId = req.userId;

    const query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    const history = await PriceHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      history
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateInsights,
  getInsightHistory
};
