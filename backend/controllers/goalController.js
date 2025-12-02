const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { convertToBase } = require('../utils/currencyUtils');

const createGoal = async (req, res, next) => {
  try {
    const { title, description, targetAmount, deadline, category } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'title, targetAmount, and deadline are required'
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be positive'
      });
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Deadline must be in the future'
      });
    }

    // Fetch user to get currency
    const user = await User.findById(userId);
    const targetAmountBase = convertToBase(targetAmount, user.currency || 'USD');

    const goal = await Goal.create({
      user: new mongoose.Types.ObjectId(userId),
      title,
      description: description || null,
      targetAmount: targetAmountBase, // Store in Base (INR)
      deadline: deadlineDate,
      category: category || null,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal: {
        ...goal.toObject(),
        progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
        daysRemaining: Math.ceil((goal.deadline - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (err) {
    next(err);
  }
};

const getGoals = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const filters = {
      user: new mongoose.Types.ObjectId(userId)
    };

    if (status) {
      filters.status = status;
    }

    const goals = await Goal.find(filters).sort({ deadline: 1 });

    const goalsWithProgress = goals.map(goal => ({
      ...goal.toObject(),
      progress: Math.round((goal.currentAmount / goal.targetAmount) * 100),
      daysRemaining: Math.ceil((goal.deadline - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      goals: goalsWithProgress
    });
  } catch (err) {
    next(err);
  }
};

const updateGoalProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this goal'
      });
    }

    // Fetch user to get currency
    const user = await User.findById(userId);
    const amountBase = convertToBase(amount, user.currency || 'USD');

    goal.currentAmount += amountBase; // Add Base amount
    goal.status = goal.currentAmount >= goal.targetAmount ? 'completed' : 'active';
    await goal.save();

    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      goal: {
        ...goal.toObject(),
        progress
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, targetAmount, deadline, category, status } = req.body;
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
        error: 'Goal not found'
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this goal'
      });
    }

    if (targetAmount !== undefined && targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be positive'
      });
    }

    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      if (deadlineDate < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Deadline must be in the future'
        });
      }
    }

    if (status && !['active', 'completed', 'abandoned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be active, completed, or abandoned'
      });
    }

    if (title) {
      goal.title = title;
    }
    if (description !== undefined) {
      goal.description = description || null;
    }
    if (targetAmount) {
      goal.targetAmount = parseFloat(targetAmount);
    }
    if (deadline) {
      goal.deadline = new Date(deadline);
    }
    if (category !== undefined) {
      goal.category = category || null;
    }
    if (status) {
      goal.status = status;
    }

    await goal.save();

    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal: {
        ...goal.toObject(),
        progress
      }
    });
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
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
        error: 'Goal not found'
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this goal'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoalProgress,
  updateGoal,
  deleteGoal
};
