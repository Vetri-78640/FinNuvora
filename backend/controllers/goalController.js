const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createGoal = async (req, res, next) => {
  try {
    const { title, description, targetAmount, deadline, category } = req.body;
    const userId = req.userId;

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

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description: description || null,
        targetAmount: parseFloat(targetAmount),
        deadline: deadlineDate,
        category: category || null,
        status: 'active'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (err) {
    next(err);
  }
};

const getGoals = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { deadline: 'asc' }
    });

    const goalsWithProgress = goals.map(goal => ({
      ...goal,
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

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    const goal = await prisma.goal.findUnique({
      where: { id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this goal'
      });
    }

    const newAmount = goal.currentAmount + parseFloat(amount);
    const status = newAmount >= goal.targetAmount ? 'completed' : 'active';

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        status
      }
    });

    const progress = Math.round((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100);

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      goal: {
        ...updatedGoal,
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

    const goal = await prisma.goal.findUnique({
      where: { id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.userId !== userId) {
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

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(targetAmount && { targetAmount: parseFloat(targetAmount) }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(category !== undefined && { category }),
        ...(status && { status })
      }
    });

    const progress = Math.round((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100);

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal: {
        ...updatedGoal,
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

    const goal = await prisma.goal.findUnique({
      where: { id }
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    if (goal.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this goal'
      });
    }

    await prisma.goal.delete({
      where: { id }
    });

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
