const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

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

      if (!stats.byCategory[t.category.name]) {
        stats.byCategory[t.category.name] = { income: 0, expense: 0, investment: 0 };
      }
      stats.byCategory[t.category.name][t.type] += t.amount;
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

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const insights = result.response.text();

    res.json({
      success: true,
      insights,
      stats
    });
  } catch (err) {
    next(err);
  }
};

const getInsightHistory = async (req, res, next) => {
  try {
    const userId = req.userId;

    const history = await prisma.priceHistory.find({ userId }).limit(10).sort({ _id: -1 });

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
